import { useEffect, useState } from "react";
import { crearEspejo, decidirEspejo } from "../api.js";
import Avatar from "../componentes/Avatar.jsx";
import AvisosGuardian from "../componentes/AvisosGuardian.jsx";
import Boton from "../componentes/Boton.jsx";
import EtiquetaIA from "../componentes/EtiquetaIA.jsx";
import Icono from "../componentes/Icono.jsx";
import Interruptor from "../componentes/Interruptor.jsx";
import ListaEditable from "../componentes/ListaEditable.jsx";
import Titulo from "../componentes/Titulo.jsx";
import { TRANSCRIPCION_CAFE } from "../datos/cafe.js";

const JUNIOR = { id: "lucia", nombre: "Lucía" };
const SENIOR = { id: "javier", nombre: "Javier" };

function Conversacion({ onPropuesta }) {
  const [origen, setOrigen] = useState("audio");
  const [consJunior, setConsJunior] = useState(false);
  const [consSenior, setConsSenior] = useState(false);
  const [texto, setTexto] = useState(TRANSCRIPCION_CAFE);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const faltaConsentimiento = origen === "audio" && !(consJunior && consSenior);
  const bloqueado = faltaConsentimiento || cargando || !texto.trim();

  // Al cambiar de origen cambia el texto: las notas nunca arrastran la transcripción del audio.
  function cambiarOrigen(nuevo) {
    setOrigen(nuevo);
    setTexto(nuevo === "audio" ? TRANSCRIPCION_CAFE : "");
  }

  async function generar() {
    if (bloqueado) return;
    setCargando(true);
    setError("");
    try {
      onPropuesta(
        await crearEspejo({
          origen,
          texto,
          junior: JUNIOR.nombre,
          senior: SENIOR.nombre,
          consentimiento_junior: consJunior,
          consentimiento_senior: consSenior,
        }),
      );
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  }

  return (
    <main className="screen">
      <div className="coffee-visual" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <span>☕</span>
        <div className="coffee-people">
          <Avatar id={JUNIOR.id} nombre={JUNIOR.nombre} />
          <Avatar id={SENIOR.id} nombre={SENIOR.nombre} />
        </div>
      </div>
      <div className="title-block centered">
        <p className="kicker">
          Café de {JUNIOR.nombre} con {SENIOR.nombre}
        </p>
        <Titulo>Aprender sin invadir</Titulo>
        <p>Solo preparamos una propuesta de feedback si las dos personas dicen que sí.</p>
      </div>

      <fieldset className="segmentado" aria-label="¿De dónde sale la conversación?">
        <label>
          <input type="radio" name="origen" checked={origen === "audio"} onChange={() => cambiarOrigen("audio")} />
          Transcripción del audio
        </label>
        <label>
          <input type="radio" name="origen" checked={origen === "notas"} onChange={() => cambiarOrigen("notas")} />
          Notas de {JUNIOR.nombre}
        </label>
      </fieldset>

      {origen === "audio" && (
        <>
          <section className="consent-card" aria-label="Consentimiento para usar el audio">
            <Interruptor
              activo={consJunior}
              onCambio={() => setConsJunior(!consJunior)}
              etiqueta={`${JUNIOR.nombre} da su consentimiento`}
              describedBy="privacidad"
            />
            <Interruptor
              activo={consSenior}
              onCambio={() => setConsSenior(!consSenior)}
              etiqueta={`${SENIOR.nombre} da su consentimiento`}
              describedBy="privacidad"
            />
          </section>
          <div className="privacy-note">
            <Icono nombre="escudo" tamano={20} />
            <p id="privacidad">
              El audio solo se usa para preparar la propuesta. <b>La transcripción no se guarda.</b> Relevo no analiza la voz ni
              las emociones.
            </p>
          </div>
        </>
      )}

      <details className="prep-card" open={origen === "notas"}>
        <summary>
          <span className="mini-person">
            <b>{origen === "audio" ? "Transcripción del café" : "Notas del café"}</b>
            <span>{origen === "audio" ? "Toca para revisarla" : "Escribe lo que recuerdes de la conversación"}</span>
          </span>
        </summary>
        <div className="field">
          <label htmlFor="texto">{origen === "audio" ? "Transcripción" : "Notas"}</label>
          <textarea id="texto" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
      </details>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <Boton icono="chispa" bloqueado={bloqueado} aria-describedby={faltaConsentimiento ? "motivo-cafe" : undefined} onClick={generar}>
        {cargando ? "Generando propuesta…" : "Generar propuesta"}
      </Boton>
      {faltaConsentimiento && (
        <p id="motivo-cafe" className="helper">
          Hace falta el sí de las dos personas.
        </p>
      )}
      <p className="solo-lector" aria-live="polite">
        {cargando ? "Generando la propuesta, espera un momento." : ""}
      </p>
    </main>
  );
}

function Revision({ sesion, onDecision }) {
  const [p, setP] = useState(sesion.propuesta);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function decidir(accion) {
    if (accion === "descartar" && !window.confirm(`¿Descartar la propuesta? ${JUNIOR.nombre} no recibirá nada.`)) return;
    setEnviando(true);
    setError("");
    const limpia = { ...p, bien: p.bien.filter((x) => x.trim()), a_mejorar: p.a_mejorar.filter((x) => x.trim()) };
    try {
      const r = await decidirEspejo(
        sesion.thread_id,
        { accion, aprobado_por: SENIOR.nombre, propuesta_editada: limpia },
        { simulado: sesion.simulado, junior: JUNIOR.nombre },
      );
      onDecision(r);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <main className="screen">
      <div className="title-block">
        <p className="kicker">Revisión de {SENIOR.nombre}</p>
        <Titulo>Tu mirada importa</Titulo>
        <p>
          La IA ha preparado esto. Corrígelo antes de que {JUNIOR.nombre} lo vea: no recibe nada hasta que lo apruebes.
        </p>
      </div>
      {sesion.simulado && (
        <p className="aviso-demo">Propuesta de ejemplo: no se ha podido conectar con Relevo y no sale de esta conversación.</p>
      )}
      <EtiquetaIA />
      <AvisosGuardian avisos={sesion.simulado ? null : sesion.avisos} />

      <section className="feedback-card good">
        <div className="feedback-title">
          <span aria-hidden="true">✨</span>
          <h2>Lo que hizo bien</h2>
        </div>
        <ListaEditable titulo="Lo que hizo bien" items={p.bien} onChange={(bien) => setP({ ...p, bien })} />
      </section>

      <section className="feedback-card improve">
        <div className="feedback-title">
          <span aria-hidden="true">↗</span>
          <h2>Lo que puede mejorar</h2>
        </div>
        <ListaEditable titulo="Lo que puede mejorar" items={p.a_mejorar} onChange={(a_mejorar) => setP({ ...p, a_mejorar })} />
      </section>

      <section className="evidence-card">
        <p className="kicker">Para su huella</p>
        <h2>Evidencias</h2>
        {p.evidencias.length === 0 && <p className="helper">Sin evidencias.</p>}
        {p.evidencias.map((ev, i) => (
          <div key={i} className="evidencia">
            <span className={`skill ${["skill-cyan", "skill-pink", "skill-lime"][i % 3]}`}>{ev.skill}</span>
            <div className="fila">
              <textarea
                className="campo-texto"
                aria-label={`Evidencia de ${ev.skill}`}
                value={ev.evidencia}
                onChange={(e) => setP({ ...p, evidencias: p.evidencias.map((x, j) => (j === i ? { ...x, evidencia: e.target.value } : x)) })}
              />
              <button
                type="button"
                className="icono-quitar"
                aria-label={`Quitar evidencia de ${ev.skill}`}
                onClick={() => setP({ ...p, evidencias: p.evidencias.filter((_, j) => j !== i) })}
              >
                <Icono nombre="x" tamano={16} />
              </button>
            </div>
            <blockquote>«{ev.cita}»</blockquote>
          </div>
        ))}
      </section>

      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="siguiente">Siguiente paso para {JUNIOR.nombre}</label>
        <textarea id="siguiente" value={p.siguiente_paso} onChange={(e) => setP({ ...p, siguiente_paso: e.target.value })} />
      </div>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <Boton icono="enviar" bloqueado={enviando} onClick={() => decidir("aprobar")}>
        {enviando ? "Enviando…" : `Aprobar y enviar a ${JUNIOR.nombre}`}
      </Boton>
      <p className="solo-lector" aria-live="polite">
        {enviando ? "Enviando la decisión." : ""}
      </p>
      <Boton variante="ghost" bloqueado={enviando} onClick={() => decidir("descartar")}>
        Descartar propuesta
      </Boton>
    </main>
  );
}

export default function Cafe({ onEnCurso, onCompletado, onIr }) {
  const [paso, setPaso] = useState("cafe");
  const [sesion, setSesion] = useState(null);

  useEffect(() => {
    onEnCurso?.(paso === "revision");
  }, [paso, onEnCurso]);

  if (paso === "revision") {
    return (
      <Revision
        sesion={sesion}
        onDecision={(r) => {
          if (r.estado === "aprobado") onCompletado?.();
          setPaso(r.estado === "aprobado" ? "aprobado" : "descartado");
        }}
      />
    );
  }
  if (paso === "aprobado" || paso === "descartado") {
    const aprobado = paso === "aprobado";
    return (
      <main className="screen ready-screen">
        <div className="celebrate-icon">
          <Icono nombre={aprobado ? "check" : "x"} tamano={34} />
        </div>
        <div className="title-block centered">
          <Titulo>{aprobado ? `Enviado a ${JUNIOR.nombre}` : "Propuesta descartada"}</Titulo>
          <p>
            {aprobado
              ? `Lo que ${SENIOR.nombre} ha confirmado ya está en la huella de ${JUNIOR.nombre}.`
              : `${JUNIOR.nombre} no ha recibido nada.`}
          </p>
        </div>
        {aprobado && (
          <Boton icono="flecha" onClick={() => onIr("huella")}>
            Ver la huella de {JUNIOR.nombre}
          </Boton>
        )}
        <Boton variante="secondary" onClick={() => setPaso("cafe")}>
          Empezar otro café
        </Boton>
      </main>
    );
  }
  return (
    <Conversacion
      onPropuesta={(s) => {
        setSesion(s);
        setPaso("revision");
      }}
    />
  );
}
