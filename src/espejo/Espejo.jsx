import { useEffect, useState } from "react";
import { crearEspejo, decidirEspejo, verHuella } from "../api.js";
import ListaEditable from "../componentes/ListaEditable.jsx";
import Titulo from "../componentes/Titulo.jsx";
import { TRANSCRIPCION_CAFE } from "../datos/cafe.js";

const JUNIOR = "Nadia";
const SENIOR = "Javier";

function Cafe({ onPropuesta }) {
  const [origen, setOrigen] = useState("audio");
  const [consJunior, setConsJunior] = useState(false);
  const [consSenior, setConsSenior] = useState(false);
  const [texto, setTexto] = useState(TRANSCRIPCION_CAFE);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const faltaConsentimiento = origen === "audio" && !(consJunior && consSenior);
  const bloqueado = faltaConsentimiento || cargando || !texto.trim();

  // Al cambiar de origen se cambia el texto: las notas nunca arrastran la transcripción del audio.
  function cambiarOrigen(nuevo) {
    setOrigen(nuevo);
    setTexto(nuevo === "audio" ? TRANSCRIPCION_CAFE : "");
  }

  async function generar(e) {
    e.preventDefault();
    if (bloqueado) return;
    setCargando(true);
    setError("");
    try {
      const r = await crearEspejo({
        origen,
        texto,
        junior: JUNIOR,
        senior: SENIOR,
        consentimiento_junior: consJunior,
        consentimiento_senior: consSenior,
      });
      onPropuesta(r);
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  }

  return (
    <form onSubmit={generar} className="tarjeta" aria-busy={cargando}>
      <Titulo>
        El café de {JUNIOR} con {SENIOR}
      </Titulo>

      <fieldset>
        <legend>¿De dónde sale la conversación?</legend>
        <label className="opcion">
          <input type="radio" name="origen" value="audio" checked={origen === "audio"} onChange={() => cambiarOrigen("audio")} />
          Transcripción del audio
        </label>
        <label className="opcion">
          <input type="radio" name="origen" value="notas" checked={origen === "notas"} onChange={() => cambiarOrigen("notas")} />
          Notas de {JUNIOR}
        </label>
      </fieldset>

      {origen === "audio" && (
        <fieldset>
          <legend>Consentimiento para usar el audio</legend>
          <label className="opcion">
            <input type="checkbox" aria-describedby="privacidad" checked={consJunior} onChange={(e) => setConsJunior(e.target.checked)} />
            {JUNIOR} da su consentimiento
          </label>
          <label className="opcion">
            <input type="checkbox" aria-describedby="privacidad" checked={consSenior} onChange={(e) => setConsSenior(e.target.checked)} />
            {SENIOR} da su consentimiento
          </label>
          <p id="privacidad" className="ayuda">
            El audio solo se usa para preparar la propuesta. La transcripción no se guarda.
          </p>
        </fieldset>
      )}

      <label htmlFor="texto">{origen === "audio" ? "Transcripción" : "Notas"}</label>
      <textarea id="texto" rows={10} value={texto} onChange={(e) => setTexto(e.target.value)} />

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {faltaConsentimiento && (
        <p id="motivo" className="ayuda">
          Necesitamos el consentimiento de las dos personas.
        </p>
      )}

      <button
        type="submit"
        className="principal"
        aria-disabled={bloqueado}
        aria-describedby={faltaConsentimiento ? "motivo" : undefined}
      >
        {cargando ? "Generando propuesta…" : "Generar propuesta"}
      </button>
      <p className="solo-lector" aria-live="polite">
        {cargando ? "Generando la propuesta, espera un momento." : ""}
      </p>
    </form>
  );
}

function Revision({ sesion, onDecision }) {
  const [p, setP] = useState(sesion.propuesta);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function decidir(accion) {
    if (accion === "descartar" && !window.confirm(`¿Descartar la propuesta? ${JUNIOR} no recibirá nada.`)) return;
    setEnviando(true);
    setError("");
    const limpia = {
      ...p,
      bien: p.bien.filter((x) => x.trim()),
      a_mejorar: p.a_mejorar.filter((x) => x.trim()),
    };
    try {
      const r = await decidirEspejo(
        sesion.thread_id,
        { accion, aprobado_por: SENIOR, propuesta_editada: limpia },
        { simulado: sesion.simulado, junior: JUNIOR },
      );
      onDecision(r);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <section className="tarjeta" aria-busy={enviando}>
      <Titulo>Revisión de {SENIOR}</Titulo>
      <p className="aviso">
        Propuesta de Relevo, revísala antes de enviar. {JUNIOR} no verá nada hasta que la apruebes.
      </p>
      {sesion.simulado && (
        <p className="aviso aviso-fuerte">
          Propuesta de ejemplo: no se ha podido conectar con Relevo y esta propuesta no sale de esta conversación.
        </p>
      )}

      <ListaEditable titulo="Lo que hizo bien" items={p.bien} onChange={(bien) => setP({ ...p, bien })} />
      <ListaEditable titulo="Lo que puede mejorar" items={p.a_mejorar} onChange={(a_mejorar) => setP({ ...p, a_mejorar })} />

      <fieldset>
        <legend>Evidencias para su huella</legend>
        {p.evidencias.length === 0 && <p className="ayuda">Sin evidencias.</p>}
        {p.evidencias.map((ev, i) => (
          <div key={i} className="evidencia">
            <p className="skill etiqueta">{ev.skill}</p>
            <textarea
              aria-label={`Evidencia de ${ev.skill}`}
              rows={2}
              value={ev.evidencia}
              onChange={(e) =>
                setP({ ...p, evidencias: p.evidencias.map((x, j) => (j === i ? { ...x, evidencia: e.target.value } : x)) })
              }
            />
            <blockquote className="cita">«{ev.cita}»</blockquote>
            <button
              type="button"
              className="secundario"
              aria-label={`Quitar evidencia de ${ev.skill}`}
              onClick={() => setP({ ...p, evidencias: p.evidencias.filter((_, j) => j !== i) })}
            >
              Quitar evidencia
            </button>
          </div>
        ))}
      </fieldset>

      <label htmlFor="siguiente">Siguiente paso</label>
      <textarea id="siguiente" rows={2} value={p.siguiente_paso} onChange={(e) => setP({ ...p, siguiente_paso: e.target.value })} />

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <div className="acciones">
        <button type="button" className="principal" disabled={enviando} onClick={() => decidir("aprobar")}>
          {enviando ? "Enviando…" : `Aprobar y enviar a ${JUNIOR}`}
        </button>
        <button type="button" className="secundario" disabled={enviando} onClick={() => decidir("descartar")}>
          Descartar propuesta
        </button>
      </div>
      <p className="solo-lector" aria-live="polite">
        {enviando ? "Enviando la decisión." : ""}
      </p>
    </section>
  );
}

function VistaNadia({ feedback, huella, onReiniciar }) {
  return (
    <section className="tarjeta">
      <Titulo>Lo que te llevas del café</Titulo>
      <p className="ayuda">Revisado y aprobado por {feedback.aprobado_por}.</p>

      <h3>Lo que hiciste bien</h3>
      <ul>{feedback.bien.map((x, i) => <li key={i}>{x}</li>)}</ul>

      <h3>Para la próxima</h3>
      <ul>{feedback.a_mejorar.map((x, i) => <li key={i}>{x}</li>)}</ul>

      <h3>Siguiente paso</h3>
      <p>{feedback.siguiente_paso}</p>

      <h2>Tu huella</h2>
      {Object.keys(huella).length === 0 && <p className="ayuda">Todavía no hay evidencias confirmadas.</p>}
      {Object.entries(huella).map(([skill, evidencias]) => (
        <div key={skill} className="evidencia">
          <h3 className="skill etiqueta">{skill}</h3>
          <ul>
            {evidencias.map((e, i) => (
              <li key={i}>
                {e.evidencia} <span className="ayuda">Confirmada por {e.confirmada_por}, {e.fecha}.</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="acciones">
        <button type="button" className="secundario" onClick={onReiniciar}>
          Empezar otro café
        </button>
      </div>
    </section>
  );
}

export default function Espejo({ onEnCurso }) {
  const [paso, setPaso] = useState("cafe");

  useEffect(() => {
    onEnCurso?.(paso === "revision");
  }, [paso, onEnCurso]);
  const [sesion, setSesion] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [huella, setHuella] = useState({});

  async function alDecidir(r) {
    setResultado(r);
    if (r.estado === "aprobado") {
      setHuella(await verHuella(JUNIOR, { simulado: sesion.simulado }));
      setPaso("nadia");
    } else {
      setPaso("descartado");
    }
  }

  function reiniciar() {
    setSesion(null);
    setResultado(null);
    setPaso("cafe");
  }

  return (
    <>
      {sesion?.simulado && <p className="simulado">Modo demo sin conexión</p>}

      {paso === "cafe" && (
        <Cafe
          onPropuesta={(s) => {
            setSesion(s);
            setPaso("revision");
          }}
        />
      )}
      {paso === "revision" && <Revision sesion={sesion} onDecision={alDecidir} />}
      {paso === "nadia" && <VistaNadia feedback={resultado.feedback} huella={huella} onReiniciar={reiniciar} />}
      {paso === "descartado" && (
        <section className="tarjeta">
          <Titulo>Propuesta descartada</Titulo>
          <p>{JUNIOR} no ha recibido nada.</p>
          <div className="acciones">
            <button type="button" className="secundario" onClick={reiniciar}>
              Empezar otro café
            </button>
          </div>
        </section>
      )}
    </>
  );
}
