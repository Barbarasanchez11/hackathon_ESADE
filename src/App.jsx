import { useState } from "react";
import { crearEspejo, decidirEspejo, verHuella } from "./api.js";
import { TRANSCRIPCION_CAFE } from "./datos/cafe.js";

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

  async function generar(e) {
    e.preventDefault();
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
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={generar} className="tarjeta">
      <h2>El café de {JUNIOR} con {SENIOR}</h2>

      <fieldset>
        <legend>¿De dónde sale la conversación?</legend>
        <label className="opcion">
          <input type="radio" name="origen" value="audio" checked={origen === "audio"} onChange={() => setOrigen("audio")} />
          Transcripción del audio
        </label>
        <label className="opcion">
          <input type="radio" name="origen" value="notas" checked={origen === "notas"} onChange={() => setOrigen("notas")} />
          Notas de {JUNIOR}
        </label>
      </fieldset>

      {origen === "audio" && (
        <fieldset>
          <legend>Consentimiento para usar el audio</legend>
          <label className="opcion">
            <input type="checkbox" checked={consJunior} onChange={(e) => setConsJunior(e.target.checked)} />
            {JUNIOR} da su consentimiento
          </label>
          <label className="opcion">
            <input type="checkbox" checked={consSenior} onChange={(e) => setConsSenior(e.target.checked)} />
            {SENIOR} da su consentimiento
          </label>
          <p className="ayuda">El audio solo se usa para generar el feedback. La transcripción se borra después.</p>
        </fieldset>
      )}

      <label htmlFor="texto">{origen === "audio" ? "Transcripción" : "Notas"}</label>
      <textarea id="texto" rows={10} value={texto} onChange={(e) => setTexto(e.target.value)} />

      {error && <p role="alert" className="error">{error}</p>}
      {faltaConsentimiento && <p className="ayuda">Necesitamos el consentimiento de las dos personas.</p>}

      <button type="submit" className="principal" disabled={faltaConsentimiento || cargando || !texto.trim()}>
        {cargando ? "Generando feedback…" : "Generar feedback"}
      </button>
    </form>
  );
}

function ListaEditable({ titulo, items, onChange }) {
  return (
    <fieldset>
      <legend>{titulo}</legend>
      {items.map((item, i) => (
        <div key={i} className="fila">
          <textarea
            aria-label={`${titulo} ${i + 1}`}
            rows={2}
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button type="button" className="secundario" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            Quitar
          </button>
        </div>
      ))}
    </fieldset>
  );
}

function Revision({ sesion, onDecision }) {
  const [p, setP] = useState(sesion.propuesta);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function decidir(accion) {
    setEnviando(true);
    setError("");
    try {
      const r = await decidirEspejo(
        sesion.thread_id,
        { accion, aprobado_por: SENIOR, propuesta_editada: p },
        { simulado: sesion.simulado, junior: JUNIOR },
      );
      onDecision(r);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <section className="tarjeta">
      <h2>Revisión de {SENIOR}</h2>
      <p className="aviso">Propuesta de Relevo, revísala antes de enviar. {JUNIOR} no verá nada hasta que la apruebes.</p>

      <ListaEditable titulo="Lo que hizo bien" items={p.bien} onChange={(bien) => setP({ ...p, bien })} />
      <ListaEditable titulo="Lo que puede mejorar" items={p.a_mejorar} onChange={(a_mejorar) => setP({ ...p, a_mejorar })} />

      <fieldset>
        <legend>Evidencias para su huella</legend>
        {p.evidencias.length === 0 && <p className="ayuda">Sin evidencias.</p>}
        {p.evidencias.map((ev, i) => (
          <div key={i} className="evidencia">
            <p className="skill">{ev.skill}</p>
            <textarea
              aria-label={`Evidencia de ${ev.skill}`}
              rows={2}
              value={ev.evidencia}
              onChange={(e) =>
                setP({ ...p, evidencias: p.evidencias.map((x, j) => (j === i ? { ...x, evidencia: e.target.value } : x)) })
              }
            />
            <blockquote>«{ev.cita}»</blockquote>
            <button
              type="button"
              className="secundario"
              onClick={() => setP({ ...p, evidencias: p.evidencias.filter((_, j) => j !== i) })}
            >
              Quitar evidencia
            </button>
          </div>
        ))}
      </fieldset>

      <label htmlFor="siguiente">Siguiente paso</label>
      <textarea id="siguiente" rows={2} value={p.siguiente_paso} onChange={(e) => setP({ ...p, siguiente_paso: e.target.value })} />

      {error && <p role="alert" className="error">{error}</p>}

      <div className="acciones">
        <button type="button" className="principal" disabled={enviando} onClick={() => decidir("aprobar")}>
          Aprobar y enviar a {JUNIOR}
        </button>
        <button type="button" className="secundario" disabled={enviando} onClick={() => decidir("descartar")}>
          Descartar
        </button>
      </div>
    </section>
  );
}

function VistaNadia({ feedback, huella }) {
  return (
    <section className="tarjeta">
      <h2>Feedback para {JUNIOR}</h2>
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
          <h3 className="skill">{skill}</h3>
          <ul>
            {evidencias.map((e, i) => (
              <li key={i}>
                {e.evidencia} <span className="ayuda">Confirmada por {e.confirmada_por}, {e.fecha}.</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default function App() {
  const [paso, setPaso] = useState("cafe");
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
    <main>
      <header>
        <h1>Relevo</h1>
        <p>Espejo: aprende de cada conversación.</p>
        {sesion?.simulado && <p className="simulado">Modo demo sin conexión</p>}
      </header>

      {paso === "cafe" && (
        <Cafe
          onPropuesta={(s) => {
            setSesion(s);
            setPaso("revision");
          }}
        />
      )}
      {paso === "revision" && <Revision sesion={sesion} onDecision={alDecidir} />}
      {paso === "nadia" && <VistaNadia feedback={resultado.feedback} huella={huella} />}
      {paso === "descartado" && (
        <section className="tarjeta">
          <h2>Propuesta descartada</h2>
          <p>{JUNIOR} no ha recibido nada.</p>
        </section>
      )}
      {(paso === "nadia" || paso === "descartado") && (
        <button type="button" className="secundario" onClick={reiniciar}>
          Empezar otro café
        </button>
      )}
    </main>
  );
}
