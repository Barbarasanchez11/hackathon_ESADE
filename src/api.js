import redEjemplo from "../backend/datos/red.json";
import { PRESENTACIONES_PARA_RELEVO } from "./constantes.js";
import { BORRADORES_SIMULADOS, PROPUESTA_SIMULADA, PROPUESTAS_SIMULADAS } from "./datos/simulados.js";

const API = "http://localhost:8000/api";
const TIMEOUT_MS = 4000;

// Huella local para cuando el backend no responde.
const huellaSimulada = {};
let sesionEspejoSimulada = null;
// Quien quiera enterarse de que la app ha pasado a datos simulados (la píldora «Modo demo»).
const oyentesModo = new Set();

async function pedir(ruta, opciones = {}, timeout = TIMEOUT_MS) {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), timeout);
  try {
    const r = await fetch(`${API}${ruta}`, {
      ...opciones,
      headers: { "Content-Type": "application/json" },
      signal: control.signal,
    });
    const datos = await r.json().catch(() => ({}));
    if (!r.ok) {
      // FastAPI devuelve una lista en los 422: mensaje propio en español.
      const mensaje = typeof datos.detail === "string" ? datos.detail : "Revisa los datos del café: falta información.";
      const error = new Error(mensaje);
      error.status = r.status;
      throw error;
    }
    return datos;
  } finally {
    clearTimeout(temporizador);
  }
}

// Solo se muestran los errores de datos (por ejemplo, falta de consentimiento); el resto pasa a datos simulados.
function esErrorDelUsuario(e) {
  return [400, 403, 422].includes(e.status);
}

// Las mismas reglas fijas del Guardián que en el backend: un texto editado con una puntuación no se envía.
const PUNTUACIONES = [
  /\b\d+(?:[.,]\d+)?\s*(?:\/|sobre)\s*(?:5|10|100)\b/i,
  /\b\d+(?:[.,]\d+)?\s+de\s+(?:5|10|100)\s+(?:puntos|estrellas)\b/i,
  /\b\d+(?:[.,]\d+)?\s*%/,
  /(?:^|[^\p{L}])(?:puntuaci(?:ó|o)n(?:es)?|rankings?|notas? (?:de|final)|calificaci(?:ó|o)n(?:es)?|nivel(?:es)? (?:alto|bajo|medio)s?)(?![\p{L}])/iu,
];

function bloquearSiPuntua(textos) {
  for (const t of textos) {
    for (const r of PUNTUACIONES) {
      const m = t.match(r);
      if (m) {
        throw new Error(`El Guardián ha bloqueado el envío: «${m[0].trim()}». Relevo no puntúa a las personas.`);
      }
    }
  }
}

function normalizar(texto) {
  return texto.replace(/["'«»“”]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

export async function crearEspejo(entrada) {
  // Misma regla que el backend, para que el modo simulado tampoco la salte.
  if (entrada.origen === "audio" && !(entrada.consentimiento_junior && entrada.consentimiento_senior)) {
    throw new Error("Falta el consentimiento de las dos personas para usar el audio.");
  }
  try {
    // El modelo puede tardar: más margen que el resto de llamadas.
    const datos = await pedir("/espejo", { method: "POST", body: JSON.stringify(entrada) }, 60000);
    return { ...datos, simulado: false };
  } catch (e) {
    if (esErrorDelUsuario(e)) throw e;
    // Igual que en el backend: solo quedan las evidencias cuya cita está en el texto enviado.
    const propuesta = structuredClone(PROPUESTA_SIMULADA);
    const fuente = normalizar(entrada.texto);
    propuesta.evidencias = propuesta.evidencias.filter((e) => fuente.includes(normalizar(e.cita)));
    marcarSimulado();
    sesionEspejoSimulada = { senior: entrada.senior, decidido: false };
    return { thread_id: "simulado", propuesta, simulado: true };
  }
}

export async function decidirEspejo(threadId, decision, { simulado, junior }) {
  // En una sesión real, un fallo nunca se convierte en una aprobación local: se muestra y se puede reintentar.
  if (!simulado) {
    try {
      return await pedir(`/espejo/${threadId}/decision`, { method: "POST", body: JSON.stringify(decision) }, 15000);
    } catch (e) {
      if (e.status) throw e;
      throw new Error("No se ha podido enviar la decisión. Comprueba la conexión y vuelve a intentarlo.");
    }
  }
  // Mismas comprobaciones que el backend: solo decide la senior del café, una vez y sin puntuaciones.
  if (!sesionEspejoSimulada || sesionEspejoSimulada.decidido) throw new Error("No hay ninguna propuesta pendiente.");
  if (decision.aprobado_por.trim().toLowerCase() !== sesionEspejoSimulada.senior.toLowerCase()) {
    throw new Error("Solo la persona senior del café puede aprobar o descartar la propuesta.");
  }
  if (decision.accion === "descartar") {
    sesionEspejoSimulada.decidido = true;
    return { estado: "descartado", feedback: null };
  }
  const editada = decision.propuesta_editada;
  bloquearSiPuntua([...editada.bien, ...editada.a_mejorar, ...editada.evidencias.map((e) => e.evidencia), editada.siguiente_paso]);
  sesionEspejoSimulada.decidido = true;
  const feedback = { ...editada, aprobado_por: decision.aprobado_por };
  const fecha = new Date().toISOString().slice(0, 10);
  const persona = junior.toLowerCase();
  huellaSimulada[persona] = [
    ...(huellaSimulada[persona] || []),
    ...feedback.evidencias.map((e) => ({ ...e, confirmada_por: decision.aprobado_por, fecha })),
  ];
  return { estado: "aprobado", feedback };
}

// Sin indicar el modo, se usa el de la sesión: real hasta que alguna llamada pase a datos simulados.
export async function verHuella(persona, { simulado = modoSimulado } = {}) {
  if (!simulado) {
    try {
      return await pedir(`/huella/${encodeURIComponent(persona)}`);
    } catch {
      // Sigue con la huella simulada, y se avisa de que la app está en modo demo.
      marcarSimulado();
    }
  }
  const agrupada = {};
  for (const e of huellaSimulada[persona.toLowerCase()] || []) {
    (agrupada[e.skill] ||= []).push(e);
  }
  return agrupada;
}

// --- Red, Conector y Preparador ---

// Modo simulado: copia local de la red con las mismas reglas que backend/red.py.
let personas = {};
let conexiones = new Set();
const sesionesConector = new Map();
const sesionesPreparador = new Map();
const eleccionesUsadas = new Set();
let contadorSesiones = 0;
// En cuanto una llamada pasa a datos simulados, la red se lee también en local para que todo cuadre.
let modoSimulado = false;

const clave = (a, b) => [a, b].sort().join("|");

function reiniciarLocal() {
  personas = Object.fromEntries(structuredClone(redEjemplo.personas).map((p) => [p.id, p]));
  conexiones = new Set(redEjemplo.conexiones.map(([a, b]) => clave(a, b)));
  sesionesConector.clear();
  sesionesPreparador.clear();
  eleccionesUsadas.clear();
  for (const persona of Object.keys(huellaSimulada)) delete huellaSimulada[persona];
  sesionEspejoSimulada = null;
  modoSimulado = false;
  for (const fn of oyentesModo) fn(false);
}
reiniciarLocal();

const seConocen = (a, b) => conexiones.has(clave(a, b));
const contactos = (id) => Object.keys(personas).filter((otro) => otro !== id && seConocen(id, otro)).sort();
const puedePasarRelevo = (id) => personas[id].presentaciones_recibidas >= PRESENTACIONES_PARA_RELEVO;
const relevosDe = (junior) => contactos(junior).filter(puedePasarRelevo);
const candidatos = (presentador, junior) => contactos(presentador).filter((c) => c !== junior && !seConocen(c, junior));
const quienVieneDetras = (id) => (puedePasarRelevo(id) ? contactos(id).filter((c) => !puedePasarRelevo(c)) : []);
const nombre = (id) => personas[id].nombre;

function siguienteId(prefijo) {
  contadorSesiones += 1;
  return `${prefijo}-simulado-${contadorSesiones}`;
}

// En una sesión real, un fallo al decidir se muestra; nunca se convierte en una decisión local.
async function decisionReal(ruta, cuerpo) {
  try {
    return await pedir(ruta, { method: "POST", body: JSON.stringify(cuerpo) }, 15000);
  } catch (e) {
    if (e.status) throw e;
    throw new Error("No se ha podido enviar la decisión. Comprueba la conexión y vuelve a intentarlo.");
  }
}

function comprobarPresentador(texto, id) {
  const t = texto.trim().toLowerCase();
  if (t !== id && t !== nombre(id).toLowerCase()) throw new Error("Solo quien presenta puede decidir.");
}

function personaLocal(id) {
  const p = personas[id];
  return {
    id,
    nombre: p.nombre,
    presentaciones_recibidas: p.presentaciones_recibidas,
    puede_pasar_relevo: puedePasarRelevo(id),
    detras: quienVieneDetras(id).map((d) => ({ id: d, nombre: nombre(d), comparte: structuredClone(personas[d].comparte) })),
  };
}

export function enModoSimulado() {
  return modoSimulado;
}

export function suscribirModo(fn) {
  oyentesModo.add(fn);
  return () => oyentesModo.delete(fn);
}

function marcarSimulado() {
  if (modoSimulado) return;
  modoSimulado = true;
  for (const fn of oyentesModo) fn(true);
}

// Lo que cada persona ha decidido compartir (nombre, rol, intereses). Nunca el contador ni las conexiones.
export function perfilCompartido(id) {
  const p = redEjemplo.personas.find((x) => x.id === id);
  return p ? { id: p.id, nombre: p.nombre, ...structuredClone(p.comparte) } : null;
}

// Derecho de supresión (RGPD art. 17): la persona borra su huella.
// Borra la copia local y siempre intenta borrar también la del servidor, aunque la app esté en modo demo:
// la persona puede haber aprobado cafés reales antes de perder la conexión.
export async function borrarHuella(persona) {
  delete huellaSimulada[persona.toLowerCase()];
  try {
    await pedir(`/huella/${encodeURIComponent(persona)}`, { method: "DELETE" });
  } catch (e) {
    if (e.status || !modoSimulado) throw new Error("No se ha podido borrar la huella en el servidor. Vuelve a intentarlo.");
    // Sin servidor y en modo demo: solo había copia local, ya borrada.
  }
}

export async function verPersona(id) {
  if (!modoSimulado) {
    try {
      return { ...(await pedir(`/red/${id}`)), simulado: false };
    } catch (e) {
      if (e.status === 404) throw new Error("No conocemos a esa persona en la red.");
      marcarSimulado();
    }
  }
  if (!personas[id]) throw new Error("No conocemos a esa persona en la red.");
  return { ...personaLocal(id), simulado: true };
}

export async function reiniciarDemo() {
  reiniciarLocal();
  try {
    await pedir("/demo/reiniciar", { method: "POST" });
  } catch {
    // Sin backend basta con reiniciar el modo simulado.
  }
}

function conectorLocal(entrada) {
  if (!personas[entrada.junior_id]) throw new Error("No conocemos a esa persona en la red.");
  const relevos = relevosDe(entrada.junior_id);
  let presentador = entrada.presentador_id;
  if (presentador != null) {
    if (!relevos.includes(presentador)) throw new Error("Esa persona no puede presentar a la junior.");
  } else if (relevos.length === 1) {
    presentador = relevos[0];
  } else {
    throw new Error(relevos.length ? "Hay varias personas que pueden presentarla: indica quién presenta." : "Esta persona todavía no tiene un relevo que pueda presentarla.");
  }
  const posibles = candidatos(presentador, entrada.junior_id);
  const propuestas = PROPUESTAS_SIMULADAS.filter(
    (p) => p.junior === entrada.junior_id && p.presentador === presentador && posibles.includes(p.persona_a_presentar),
  )
    .map(({ junior: _junior, ...p }) => ({ ...p, presentador_nombre: nombre(p.presentador), persona_nombre: nombre(p.persona_a_presentar) }))
    .sort((a, b) => a.persona_nombre.localeCompare(b.persona_nombre));
  const thread_id = siguienteId("conector");
  sesionesConector.set(thread_id, { junior: entrada.junior_id, presentador, propuestas, eleccion: undefined });
  return { thread_id, presentador: nombre(presentador), propuestas, simulado: true };
}

export async function crearConector(entrada) {
  if (!entrada.busca.trim()) throw new Error("Cuéntanos qué busca la persona.");
  if (!modoSimulado) {
    try {
      const datos = await pedir("/conector", { method: "POST", body: JSON.stringify(entrada) }, 60000);
      return { ...datos, simulado: false };
    } catch (e) {
      if (esErrorDelUsuario(e)) throw e;
      marcarSimulado();
    }
  }
  return conectorLocal(entrada);
}

export async function decidirConector(threadId, decision, { simulado }) {
  if (!simulado) return decisionReal(`/conector/${threadId}/decision`, decision);
  const sesion = sesionesConector.get(threadId);
  if (!sesion || sesion.eleccion !== undefined) throw new Error("No hay ninguna propuesta pendiente.");
  comprobarPresentador(decision.decidido_por, sesion.presentador);
  if (decision.eleccion === null) {
    sesion.eleccion = null;
    return { estado: "sin_presentacion", eleccion: null };
  }
  const eleccion = sesion.propuestas.find((p) => p.persona_a_presentar === decision.eleccion);
  if (!eleccion) throw new Error("Esa persona no está entre las propuestas.");
  sesion.eleccion = { ...eleccion, junior: sesion.junior };
  return { estado: "elegida", eleccion: structuredClone(sesion.eleccion) };
}

// Una sesión real sigue siendo real: si el Preparador falla, se muestra el error y se puede reintentar.
export async function crearPreparador(conectorThreadId, { simulado }) {
  if (!simulado) {
    try {
      const datos = await pedir("/preparador", { method: "POST", body: JSON.stringify({ conector_thread_id: conectorThreadId }) }, 60000);
      return { ...datos, simulado: false };
    } catch (e) {
      if (e.status === 502) throw new Error("No se ha podido preparar el borrador. Vuelve a intentarlo.");
      if (e.status) throw e;
      throw new Error("No se ha podido conectar con Relevo. Comprueba la conexión y vuelve a intentarlo.");
    }
  }
  const sesion = sesionesConector.get(conectorThreadId);
  if (!sesion?.eleccion) throw new Error("No hay ninguna propuesta elegida.");
  if (eleccionesUsadas.has(conectorThreadId)) throw new Error("Esta presentación ya se ha preparado.");
  const { junior, persona_a_presentar: persona, presentador } = sesion.eleccion;
  const borrador = BORRADORES_SIMULADOS[`${junior}-${persona}`];
  if (!borrador) throw new Error("No hay borrador de ejemplo para esta persona.");
  eleccionesUsadas.add(conectorThreadId);
  const thread_id = siguienteId("preparador");
  sesionesPreparador.set(thread_id, { junior, persona, presentador, decidido: false });
  return { thread_id, borrador: structuredClone(borrador), simulado: true };
}

export async function decidirPreparador(threadId, decision, { simulado }) {
  if (!simulado) return decisionReal(`/preparador/${threadId}/decision`, decision);
  const sesion = sesionesPreparador.get(threadId);
  if (!sesion || sesion.decidido) throw new Error("No hay ninguna propuesta pendiente.");
  comprobarPresentador(decision.aprobado_por, sesion.presentador);
  if (decision.accion === "aprobar" && decision.borrador_editado) {
    const b = decision.borrador_editado;
    bloquearSiPuntua([
      b.mensaje_presentacion,
      b.ficha_para_junior.sobre_la_persona,
      ...b.ficha_para_junior.preguntas_sugeridas,
      ...b.ficha_para_junior.que_evitar,
      b.ficha_para_senior.sobre_la_persona,
      b.ficha_para_senior.en_que_puede_ayudar,
    ]);
  }
  sesion.decidido = true;
  if (decision.accion === "descartar") return { estado: "descartado" };
  conexiones.add(clave(sesion.junior, sesion.persona));
  personas[sesion.junior].presentaciones_recibidas += 1;
  // Como el backend: el contador de la junior no se devuelve a quien presenta.
  return { estado: "enviado" };
}
