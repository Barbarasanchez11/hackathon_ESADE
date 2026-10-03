import {
  BORRADORES_SIMULADOS,
  PRESENTADOR_SIMULADO,
  PROPUESTA_SIMULADA,
  PROPUESTAS_SIMULADAS,
} from "./datos/simulados.js";

const API = "http://localhost:8000/api";
const TIMEOUT_MS = 4000;

// Huella local para cuando el backend no responde.
const huellaSimulada = {};

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
  if (decision.accion === "descartar") return { estado: "descartado", feedback: null };
  const feedback = { ...decision.propuesta_editada, aprobado_por: decision.aprobado_por };
  const fecha = new Date().toISOString().slice(0, 10);
  const persona = junior.toLowerCase();
  huellaSimulada[persona] = [
    ...(huellaSimulada[persona] || []),
    ...feedback.evidencias.map((e) => ({ ...e, confirmada_por: decision.aprobado_por, fecha })),
  ];
  return { estado: "aprobado", feedback };
}

export async function verHuella(persona, { simulado }) {
  if (!simulado) {
    try {
      return await pedir(`/huella/${encodeURIComponent(persona)}`);
    } catch {
      // Sigue con la huella simulada.
    }
  }
  const agrupada = {};
  for (const e of huellaSimulada[persona.toLowerCase()] || []) {
    (agrupada[e.skill] ||= []).push(e);
  }
  return agrupada;
}

// --- Conector y Preparador ---

// Presentaciones de Nadia en el modo simulado (la red de ejemplo empieza en 4).
let presentacionesSimuladas = 4;

// En una sesión real, un fallo al decidir se muestra; nunca se convierte en una decisión local.
async function decisionReal(ruta, cuerpo) {
  try {
    return await pedir(ruta, { method: "POST", body: JSON.stringify(cuerpo) }, 15000);
  } catch (e) {
    if (e.status) throw e;
    throw new Error("No se ha podido enviar la decisión. Comprueba la conexión y vuelve a intentarlo.");
  }
}

export async function crearConector(entrada) {
  if (!entrada.busca.trim()) throw new Error("Cuéntanos qué busca la persona.");
  try {
    const datos = await pedir("/conector", { method: "POST", body: JSON.stringify(entrada) }, 60000);
    return { ...datos, simulado: false };
  } catch (e) {
    if (esErrorDelUsuario(e)) throw e;
    return {
      thread_id: "simulado",
      presentador: PRESENTADOR_SIMULADO,
      propuestas: structuredClone(PROPUESTAS_SIMULADAS),
      simulado: true,
    };
  }
}

export async function decidirConector(threadId, decision, { simulado }) {
  if (!simulado) return decisionReal(`/conector/${threadId}/decision`, decision);
  if (decision.eleccion === null) return { estado: "sin_presentacion", eleccion: null };
  const eleccion = PROPUESTAS_SIMULADAS.find((p) => p.persona_a_presentar === decision.eleccion);
  return { estado: "elegida", eleccion };
}

export async function crearPreparador(conectorThreadId, { simulado, eleccion }) {
  if (!simulado) {
    try {
      const datos = await pedir("/preparador", { method: "POST", body: JSON.stringify({ conector_thread_id: conectorThreadId }) }, 60000);
      return { ...datos, simulado: false };
    } catch (e) {
      if (e.status && e.status !== 502) throw e;
    }
  }
  return {
    thread_id: "simulado",
    borrador: structuredClone(BORRADORES_SIMULADOS[eleccion.persona_a_presentar]),
    simulado: true,
  };
}

export async function decidirPreparador(threadId, decision, { simulado }) {
  if (!simulado) return decisionReal(`/preparador/${threadId}/decision`, decision);
  if (decision.accion === "descartar") return { estado: "descartado", presentaciones_recibidas: null };
  presentacionesSimuladas += 1;
  return { estado: "enviado", presentaciones_recibidas: presentacionesSimuladas };
}
