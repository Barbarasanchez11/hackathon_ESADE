import { useEffect, useState } from "react";
import { crearConector, crearPreparador, decidirConector, decidirPreparador } from "../api.js";
import Avatar from "../componentes/Avatar.jsx";
import AvisosGuardian from "../componentes/AvisosGuardian.jsx";
import ListaEditable from "../componentes/ListaEditable.jsx";
import Titulo from "../componentes/Titulo.jsx";

// Flujo común a «Presentar a Lucía» (presenta Marta) y «Pasar el relevo» (presenta Lucía).
function Busqueda({ junior, presentador, buscaInicial, notaBusca, onPropuestas }) {
  const JUNIOR = junior.nombre;
  const [busca, setBusca] = useState(buscaInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const vacio = !busca.trim();

  async function buscar(e) {
    e.preventDefault();
    if (cargando || vacio) return;
    setCargando(true);
    setError("");
    try {
      onPropuestas(await crearConector({ junior_id: junior.id, busca, presentador_id: presentador.id }));
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  }

  return (
    <form onSubmit={buscar} className="tarjeta">
      <div className="tarjeta-cabecera">
        <Avatar id={junior.id} nombre={JUNIOR} grande />
        <div>
          <p className="antetitulo">Vista de {presentador.nombre}</p>
          <Titulo>¿A quién puedes presentar a {JUNIOR}?</Titulo>
        </div>
      </div>
      <p className="ayuda">{JUNIOR} no tiene que escribir a nadie: Relevo te propone personas de tu red y tú decides.</p>

      <label htmlFor="busca">Qué busca {JUNIOR}</label>
      {notaBusca && (
        <p id="nota-busca" className="ayuda">
          {notaBusca}
        </p>
      )}
      <textarea
        id="busca"
        rows={3}
        value={busca}
        aria-describedby={notaBusca ? "nota-busca" : undefined}
        onChange={(e) => setBusca(e.target.value)}
      />

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {vacio && (
        <p id="motivo-busca" className="ayuda">
          Cuéntanos qué busca {JUNIOR}.
        </p>
      )}

      <button
        type="submit"
        className="principal"
        aria-disabled={cargando || vacio}
        aria-describedby={vacio ? "motivo-busca" : undefined}
      >
        {cargando ? "Buscando en tu red…" : "Buscar a quién presentar"}
        {!cargando && <span aria-hidden="true"> →</span>}
      </button>
      <p className="solo-lector" aria-live="polite">
        {cargando ? "Buscando en tu red, espera un momento." : ""}
      </p>
    </form>
  );
}

function Eleccion({ junior, sesion, onElegida, onNinguna }) {
  const JUNIOR = junior.nombre;
  // Sin preselección: el orden alfabético no debe funcionar como recomendación.
  const [eleccion, setEleccion] = useState(null);
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
    <section className="tarjeta">
      <Titulo>Propuestas para {sesion.presentador}</Titulo>
      <p className="aviso">Propuesta de Relevo: solo personas que conoces. Tú decides si presentas a {JUNIOR} y a quién.</p>
      {sesion.simulado && (
        <p className="aviso aviso-fuerte">Propuestas de ejemplo: no se ha podido conectar con Relevo.</p>
      )}
      <AvisosGuardian avisos={sesion.simulado ? null : sesion.avisos} />

      {sesion.propuestas.length === 0 ? (
        <p>Ahora mismo no vemos a nadie en tu red que encaje con lo que busca {JUNIOR}.</p>
      ) : (
        <fieldset>
          <legend>Personas de tu red</legend>
          <div className="propuestas">
            {sesion.propuestas.map((p) => (
              <label key={p.persona_a_presentar} className="propuesta">
                <input
                  type="radio"
                  name="eleccion"
                  value={p.persona_a_presentar}
                  checked={eleccion === p.persona_a_presentar}
                  onChange={() => setEleccion(p.persona_a_presentar)}
                />
                <Avatar id={p.persona_a_presentar} nombre={p.persona_nombre} />
                <span>
                  <strong className="propuesta-nombre">{p.persona_nombre}</strong>
                  <span className="motivo">{p.motivo}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {sesion.propuestas.length > 0 && !eleccion && (
        <p id="motivo-eleccion" className="ayuda">
          Elige una persona para continuar.
        </p>
      )}

      <div className="acciones">
        {sesion.propuestas.length > 0 && (
          <button
            type="button"
            className="principal"
            aria-disabled={enviando || !eleccion}
            aria-describedby={!eleccion ? "motivo-eleccion" : undefined}
            onClick={() => !enviando && eleccion && decidir(eleccion)}
          >
            {enviando ? "Preparando…" : "Preparar presentación"}
            {!enviando && <span aria-hidden="true"> →</span>}
          </button>
        )}
        <button type="button" className="secundario" disabled={enviando} onClick={() => decidir(null)}>
          No presentar ahora
        </button>
      </div>
      <p className="solo-lector" aria-live="polite">
        {enviando ? "Preparando la presentación, espera un momento." : ""}
      </p>
    </section>
  );
}

function Borrador({ junior, sesion, eleccion, onDecision }) {
  const JUNIOR = junior.nombre;
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
    <section className="tarjeta">
      <div className="tarjeta-cabecera">
        <span className="pareja" aria-hidden="true">
          <Avatar id={junior.id} nombre={JUNIOR} />
          <Avatar id={eleccion.persona_a_presentar} nombre={persona} />
        </span>
        <Titulo>
          Presentación de {JUNIOR} a {persona}
        </Titulo>
      </div>
      <p className="aviso">Borrador de Relevo, revísalo antes de enviar. No se envía nada hasta que lo apruebes.</p>
      {sesion.simulado && (
        <p className="aviso aviso-fuerte">Borrador de ejemplo: no se ha podido conectar con Relevo.</p>
      )}
      <AvisosGuardian avisos={sesion.simulado ? null : sesion.avisos} />

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
          {enviando ? "Enviando…" : sesion.simulado ? "Aprobar (ejemplo: no se envía)" : "Aprobar y enviar"}
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

const PASOS_EN_CURSO = ["eleccion", "borrador", "error_preparador"];

export default function FlujoPresentacion({ junior, presentador, buscaInicial, notaBusca, onEnCurso, onEnviada }) {
  const JUNIOR = junior.nombre;
  const [paso, setPaso] = useState("busqueda");
  const [conector, setConector] = useState(null);
  const [eleccion, setEleccion] = useState(null);
  const [borrador, setBorrador] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    onEnCurso?.(PASOS_EN_CURSO.includes(paso));
  }, [paso, onEnCurso]);

  async function preparar() {
    setError("");
    try {
      setBorrador(await crearPreparador(conector.thread_id, { simulado: conector.simulado }));
      setPaso("borrador");
    } catch (err) {
      setError(err.message);
      setPaso("error_preparador");
    }
  }

  async function alElegir(elegida) {
    setEleccion(elegida);
    setPaso("preparando");
    await preparar();
  }

  function reiniciar() {
    setConector(null);
    setEleccion(null);
    setBorrador(null);
    setError("");
    setPaso("busqueda");
  }

  const simulado = conector?.simulado || borrador?.simulado;

  return (
    <>
      {simulado && <p className="simulado">Modo demo sin conexión</p>}

      {paso === "busqueda" && (
        <Busqueda
          junior={junior}
          presentador={presentador}
          buscaInicial={buscaInicial}
          notaBusca={notaBusca}
          onPropuestas={(s) => {
            setConector(s);
            setPaso("eleccion");
          }}
        />
      )}
      {(paso === "eleccion" || paso === "preparando") && (
        <Eleccion junior={junior} sesion={conector} onElegida={alElegir} onNinguna={() => setPaso("ninguna")} />
      )}
      {paso === "error_preparador" && (
        <section className="tarjeta">
          <Titulo>No se ha podido preparar la presentación</Titulo>
          <p role="alert" className="error">
            {error}
          </p>
          <p>
            Ya elegiste presentar a {JUNIOR} a {eleccion.persona_nombre}. No se ha enviado nada.
          </p>
          <div className="acciones">
            <button type="button" className="principal" onClick={preparar}>
              Volver a intentarlo
            </button>
            <button type="button" className="secundario" onClick={reiniciar}>
              Empezar otra presentación
            </button>
          </div>
        </section>
      )}
      {paso === "borrador" && (
        <Borrador
          junior={junior}
          sesion={borrador}
          eleccion={eleccion}
          onDecision={(r) => {
            setPaso(r.estado === "enviado" ? "enviada" : "descartada");
            if (r.estado === "enviado") onEnviada?.(r);
          }}
        />
      )}
      {paso === "enviada" && (
        <section className="tarjeta">
          {borrador.simulado ? (
            <>
              <Titulo>Presentación de ejemplo aprobada</Titulo>
              <p className="aviso aviso-fuerte">Modo demo sin conexión: no se ha enviado nada a nadie.</p>
            </>
          ) : (
            <>
              <Titulo>Presentación enviada</Titulo>
              <p>
                {JUNIOR} y {eleccion.persona_nombre} ya tienen el mensaje y sus fichas. {JUNIOR} no ha tenido que pedir nada.
              </p>
            </>
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
