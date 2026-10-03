import { useState } from "react";
import { crearConector, crearPreparador, decidirConector, decidirPreparador } from "../api.js";
import ListaEditable from "../componentes/ListaEditable.jsx";
import Titulo from "../componentes/Titulo.jsx";

const JUNIOR_ID = "nadia";
const JUNIOR = "Nadia";
const PRESENTACIONES_PARA_RELEVO = 5;

function Busqueda({ onPropuestas }) {
  const [busca, setBusca] = useState("Entrar en marketing: primeras prácticas y aprender analítica de campañas.");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function buscar(e) {
    e.preventDefault();
    if (cargando) return;
    setCargando(true);
    setError("");
    try {
      onPropuestas(await crearConector({ junior_id: JUNIOR_ID, busca }));
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  }

  return (
    <form onSubmit={buscar} className="tarjeta" aria-busy={cargando}>
      <Titulo>¿A quién puedes presentar a {JUNIOR}?</Titulo>
      <p className="ayuda">{JUNIOR} no tiene que escribir a nadie: Relevo te propone personas de tu red y tú decides.</p>

      <label htmlFor="busca">Qué busca {JUNIOR}</label>
      <textarea id="busca" rows={3} value={busca} onChange={(e) => setBusca(e.target.value)} />

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <button type="submit" className="principal" aria-disabled={cargando}>
        {cargando ? "Buscando en tu red…" : "Buscar a quién presentar"}
      </button>
      <p className="solo-lector" aria-live="polite">
        {cargando ? "Buscando en tu red, espera un momento." : ""}
      </p>
    </form>
  );
}

function Eleccion({ sesion, onElegida, onNinguna }) {
  const [eleccion, setEleccion] = useState(sesion.propuestas[0]?.persona_a_presentar ?? null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function decidir(valor) {
    setEnviando(true);
    setError("");
    try {
      const r = await decidirConector(
        sesion.thread_id,
        { eleccion: valor, decidido_por: sesion.presentador },
        { simulado: sesion.simulado },
      );
      if (r.estado === "elegida") onElegida(r.eleccion);
      else onNinguna();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <section className="tarjeta" aria-busy={enviando}>
      <Titulo>Propuestas para {sesion.presentador}</Titulo>
      <p className="aviso">Propuesta de Relevo: solo personas que conoces. Tú decides si presentas a {JUNIOR} y a quién.</p>
      {sesion.simulado && (
        <p className="aviso aviso-fuerte">Propuestas de ejemplo: no se ha podido conectar con Relevo.</p>
      )}

      {sesion.propuestas.length === 0 ? (
        <p>Ahora mismo no vemos a nadie en tu red que encaje con lo que busca {JUNIOR}.</p>
      ) : (
        <fieldset>
          <legend>Personas de tu red</legend>
          {sesion.propuestas.map((p) => (
            <label key={p.persona_a_presentar} className="propuesta">
              <input
                type="radio"
                name="eleccion"
                value={p.persona_a_presentar}
                checked={eleccion === p.persona_a_presentar}
                onChange={() => setEleccion(p.persona_a_presentar)}
              />
              <span>
                <strong>{p.persona_nombre}</strong>
                <span className="motivo">{p.motivo}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <div className="acciones">
        {sesion.propuestas.length > 0 && (
          <button type="button" className="principal" disabled={enviando || !eleccion} onClick={() => decidir(eleccion)}>
            {enviando ? "Preparando…" : "Preparar presentación"}
          </button>
        )}
        <button type="button" className="secundario" disabled={enviando} onClick={() => decidir(null)}>
          No presentar ahora
        </button>
      </div>
    </section>
  );
}

function Borrador({ sesion, eleccion, onDecision }) {
  const [b, setB] = useState(sesion.borrador);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const persona = eleccion.persona_nombre;
  const presentador = eleccion.presentador_nombre;

  const fichaJunior = (cambios) => setB({ ...b, ficha_para_junior: { ...b.ficha_para_junior, ...cambios } });
  const fichaSenior = (cambios) => setB({ ...b, ficha_para_senior: { ...b.ficha_para_senior, ...cambios } });

  async function decidir(accion) {
    if (accion === "descartar" && !window.confirm(`¿Descartar la presentación? No se enviará nada a ${JUNIOR} ni a ${persona}.`)) return;
    setEnviando(true);
    setError("");
    const limpio = {
      ...b,
      ficha_para_junior: {
        ...b.ficha_para_junior,
        preguntas_sugeridas: b.ficha_para_junior.preguntas_sugeridas.filter((x) => x.trim()),
        que_evitar: b.ficha_para_junior.que_evitar.filter((x) => x.trim()),
      },
    };
    try {
      const r = await decidirPreparador(
        sesion.thread_id,
        { accion, aprobado_por: presentador, borrador_editado: limpio },
        { simulado: sesion.simulado },
      );
      onDecision(r);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <section className="tarjeta" aria-busy={enviando}>
      <Titulo>
        Presentación de {JUNIOR} a {persona}
      </Titulo>
      <p className="aviso">Borrador de Relevo, revísalo antes de enviar. No se envía nada hasta que lo apruebes.</p>
      {sesion.simulado && (
        <p className="aviso aviso-fuerte">Borrador de ejemplo: no se ha podido conectar con Relevo.</p>
      )}

      <label htmlFor="mensaje">Mensaje para {JUNIOR} y {persona}</label>
      <textarea id="mensaje" rows={6} value={b.mensaje_presentacion} onChange={(e) => setB({ ...b, mensaje_presentacion: e.target.value })} />

      <h3>Ficha para {JUNIOR}</h3>
      <label htmlFor="sobre-senior">Sobre {persona}</label>
      <textarea
        id="sobre-senior"
        rows={2}
        value={b.ficha_para_junior.sobre_la_persona}
        onChange={(e) => fichaJunior({ sobre_la_persona: e.target.value })}
      />
      <ListaEditable
        titulo="Preguntas sugeridas"
        items={b.ficha_para_junior.preguntas_sugeridas}
        onChange={(preguntas_sugeridas) => fichaJunior({ preguntas_sugeridas })}
      />
      <ListaEditable
        titulo="Qué evitar"
        items={b.ficha_para_junior.que_evitar}
        onChange={(que_evitar) => fichaJunior({ que_evitar })}
      />

      <h3>Ficha para {persona}</h3>
      <label htmlFor="sobre-junior">Sobre {JUNIOR}</label>
      <textarea
        id="sobre-junior"
        rows={2}
        value={b.ficha_para_senior.sobre_la_persona}
        onChange={(e) => fichaSenior({ sobre_la_persona: e.target.value })}
      />
      <label htmlFor="ayuda-senior">En qué puede ayudar</label>
      <textarea
        id="ayuda-senior"
        rows={2}
        value={b.ficha_para_senior.en_que_puede_ayudar}
        onChange={(e) => fichaSenior({ en_que_puede_ayudar: e.target.value })}
      />

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <div className="acciones">
        <button type="button" className="principal" disabled={enviando} onClick={() => decidir("aprobar")}>
          {enviando ? "Enviando…" : "Aprobar y enviar"}
        </button>
        <button type="button" className="secundario" disabled={enviando} onClick={() => decidir("descartar")}>
          Descartar presentación
        </button>
      </div>
      <p className="solo-lector" aria-live="polite">
        {enviando ? "Enviando la presentación." : ""}
      </p>
    </section>
  );
}

export default function Presentacion() {
  const [paso, setPaso] = useState("busqueda");
  const [conector, setConector] = useState(null);
  const [eleccion, setEleccion] = useState(null);
  const [borrador, setBorrador] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  async function alElegir(elegida) {
    setEleccion(elegida);
    setError("");
    try {
      setBorrador(await crearPreparador(conector.thread_id, { simulado: conector.simulado, eleccion: elegida }));
      setPaso("borrador");
    } catch (err) {
      setError(err.message);
    }
  }

  function reiniciar() {
    setConector(null);
    setEleccion(null);
    setBorrador(null);
    setResultado(null);
    setError("");
    setPaso("busqueda");
  }

  const simulado = conector?.simulado || borrador?.simulado;

  return (
    <>
      {simulado && <p className="simulado">Modo demo sin conexión</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {paso === "busqueda" && (
        <Busqueda
          onPropuestas={(s) => {
            setConector(s);
            setPaso("eleccion");
          }}
        />
      )}
      {paso === "eleccion" && <Eleccion sesion={conector} onElegida={alElegir} onNinguna={() => setPaso("ninguna")} />}
      {paso === "borrador" && (
        <Borrador
          sesion={borrador}
          eleccion={eleccion}
          onDecision={(r) => {
            setResultado(r);
            setPaso(r.estado === "enviado" ? "enviada" : "descartada");
          }}
        />
      )}
      {paso === "enviada" && (
        <section className="tarjeta">
          <Titulo>Presentación enviada</Titulo>
          <p>
            {JUNIOR} y {eleccion.persona_nombre} ya tienen el mensaje y sus fichas. {JUNIOR} no ha tenido que pedir nada.
          </p>
          <p className="contador">
            {JUNIOR} lleva {resultado.presentaciones_recibidas} de {PRESENTACIONES_PARA_RELEVO} presentaciones.
          </p>
          {resultado.presentaciones_recibidas >= PRESENTACIONES_PARA_RELEVO && (
            <p>Después de este café, {JUNIOR} podrá pasar el relevo a quien viene detrás.</p>
          )}
          <div className="acciones">
            <button type="button" className="secundario" onClick={reiniciar}>
              Empezar otra presentación
            </button>
          </div>
        </section>
      )}
      {(paso === "ninguna" || paso === "descartada") && (
        <section className="tarjeta">
          <Titulo>{paso === "ninguna" ? "Sin presentación por ahora" : "Presentación descartada"}</Titulo>
          <p>No se ha enviado nada a nadie.</p>
          <div className="acciones">
            <button type="button" className="secundario" onClick={reiniciar}>
              Empezar otra presentación
            </button>
          </div>
        </section>
      )}
    </>
  );
}
