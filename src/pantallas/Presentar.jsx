import { useEffect, useState } from "react";
import { crearConector, crearPreparador, decidirConector, decidirPreparador, MOTIVO_DEMO, perfilCompartido } from "../api.js";
import Avatar from "../componentes/Avatar.jsx";
import AvisosGuardian from "../componentes/AvisosGuardian.jsx";
import Boton from "../componentes/Boton.jsx";
import EtiquetaIA from "../componentes/EtiquetaIA.jsx";
import Icono from "../componentes/Icono.jsx";
import ListaEditable from "../componentes/ListaEditable.jsx";
import Titulo from "../componentes/Titulo.jsx";

// Flujo común a «Presentar a Lucía» (presenta Marta) y «Pasar el relevo» (presenta Lucía).

function AvisoDemo({ children }) {
  return <p className="aviso-demo">{children}</p>;
}

function Busqueda({ junior, presentador, buscaInicial, notaBusca, onPropuestas, onSalir }) {
  const [busca, setBusca] = useState(buscaInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const perfil = perfilCompartido(junior.id);
  const vacio = !busca.trim();

  async function buscar() {
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
    <main className="screen">
      <p className="step-tag">Vista de {presentador.nombre} · tu turno</p>
      <div className="title-block">
        <Titulo>¿A quién le abres la puerta?</Titulo>
        <p>
          Busca a alguien de tu red que pueda ayudar a {junior.nombre} ahora. {junior.nombre} no tiene que escribir a nadie.
        </p>
      </div>
      <section className="profile-strip" aria-label={`Sobre ${junior.nombre}`}>
        <Avatar id={junior.id} nombre={junior.nombre} tamano="lg" />
        <div>
          <p>Buscas para</p>
          <h2>{junior.nombre}</h2>
          {perfil?.rol && <p>{perfil.rol}</p>}
        </div>
      </section>
      <div className="field">
        <label htmlFor="busca">Qué busca {junior.nombre}</label>
        <textarea id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} aria-describedby="nota-busca" />
        <small id="nota-busca">
          <Icono nombre="editar" tamano={14} /> {notaBusca ?? "Puedes editarlo antes de buscar."}
        </small>
      </div>
      <div className="human-note">
        <Icono nombre="escudo" tamano={22} />
        <p>
          <b>Tú tienes la última palabra.</b> La IA sugiere. Nada se envía sin tu aprobación.
        </p>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <Boton icono="chispa" bloqueado={cargando || vacio} aria-describedby={vacio ? "motivo-busca" : undefined} onClick={buscar}>
        {cargando ? "Buscando en tu red…" : "Buscar a quién presentar"}
      </Boton>
      {vacio && (
        <p id="motivo-busca" className="helper">
          Cuéntanos qué busca {junior.nombre}.
        </p>
      )}
      <p className="solo-lector" aria-live="polite">
        {cargando ? "Buscando en tu red, espera un momento." : ""}
      </p>
      <Boton variante="ghost" onClick={onSalir}>
        Dejarlo para luego
      </Boton>
    </main>
  );
}

function Eleccion({ junior, sesion, onElegida, onNinguna }) {
  const [indice, setIndice] = useState(0);
  // Sin preselección: el orden (alfabético) no debe funcionar como recomendación.
  const [eleccion, setEleccion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const total = sesion.propuestas.length;
  const p = sesion.propuestas[indice];
  const perfil = p && perfilCompartido(p.persona_a_presentar);

  async function decidir(valor) {
    setEnviando(true);
    setError("");
    try {
      const r = await decidirConector(sesion.thread_id, { eleccion: valor, decidido_por: sesion.presentador }, { simulado: sesion.simulado });
      if (r.estado === "elegida") onElegida(r.eleccion);
      else onNinguna();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <main className="screen">
      <div className="title-block">
        <p className="kicker">Para {sesion.presentador}</p>
        <Titulo>Podrían encajar</Titulo>
        <p>Desliza para explorar. No hay un orden mejor o peor: tú decides si presentas a {junior.nombre} y a quién.</p>
      </div>
      {sesion.simulado && <AvisoDemo>Propuestas de ejemplo: {MOTIVO_DEMO}.</AvisoDemo>}
      <AvisosGuardian avisos={sesion.simulado ? null : sesion.avisos} />

      {total === 0 ? (
        <p className="vacio">Ahora mismo no vemos a nadie en tu red que encaje con lo que busca {junior.nombre}.</p>
      ) : (
        <div className="swipe-stack">
          <article key={p.persona_a_presentar} className={`person-card ${eleccion === p.persona_a_presentar ? "elegida" : ""}`}>
            <EtiquetaIA />
            <div className="person-head">
              <Avatar id={p.persona_a_presentar} nombre={p.persona_nombre} tamano="lg" />
              <div>
                <h2>{p.persona_nombre}</h2>
                {perfil?.rol && <p>{perfil.rol}</p>}
              </div>
            </div>
            <p className="reason">{p.motivo}</p>
            {perfil?.intereses?.length > 0 && (
              <ul className="mini-tags" aria-label={`Intereses que comparte ${p.persona_nombre}`}>
                {perfil.intereses.map((i, n) => (
                  <li key={i} className={`skill ${["skill-cyan", "skill-lime", "skill-pink"][n % 3]}`}>
                    {i}
                  </li>
                ))}
              </ul>
            )}
            <label className="elegir">
              <input
                type="radio"
                name="eleccion"
                checked={eleccion === p.persona_a_presentar}
                onChange={() => setEleccion(p.persona_a_presentar)}
              />
              Elegir a {p.persona_nombre}
            </label>
          </article>
          {total > 1 && (
            <div className="swipe-controls">
              <button type="button" aria-label="Propuesta anterior" onClick={() => setIndice((indice + total - 1) % total)}>
                <Icono nombre="flechaIzq" tamano={18} />
              </button>
              <span aria-live="polite">
                {indice + 1} / {total}
                <span className="solo-lector">: {p.persona_nombre}</span>
              </span>
              <button type="button" aria-label="Propuesta siguiente" onClick={() => setIndice((indice + 1) % total)}>
                <Icono nombre="flecha" tamano={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {eleccion && (
        <p className="helper" role="status">
          Has elegido a <b>{sesion.propuestas.find((x) => x.persona_a_presentar === eleccion)?.persona_nombre}</b>.
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {total > 0 && (
        <Boton
          icono="flecha"
          bloqueado={enviando || !eleccion}
          aria-describedby={!eleccion ? "motivo-eleccion" : undefined}
          onClick={() => decidir(eleccion)}
        >
          {enviando
            ? "Preparando…"
            : eleccion
              ? `Preparar presentación con ${sesion.propuestas.find((x) => x.persona_a_presentar === eleccion)?.persona_nombre}`
              : "Preparar presentación"}
        </Boton>
      )}
      {total > 0 && !eleccion && (
        <p id="motivo-eleccion" className="helper">
          Elige una persona para continuar.
        </p>
      )}
      <p className="solo-lector" aria-live="polite">
        {enviando ? "Preparando la presentación, espera un momento." : ""}
      </p>
      <Boton variante="secondary" icono="x" bloqueado={enviando} onClick={() => decidir(null)}>
        No presentar ahora
      </Boton>
    </main>
  );
}

function Borrador({ junior, sesion, eleccion, onDecision }) {
  const [b, setB] = useState(sesion.borrador);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const persona = eleccion.persona_nombre;
  const presentador = eleccion.presentador_nombre;

  const fichaJunior = (cambios) => setB({ ...b, ficha_para_junior: { ...b.ficha_para_junior, ...cambios } });
  const fichaSenior = (cambios) => setB({ ...b, ficha_para_senior: { ...b.ficha_para_senior, ...cambios } });

  async function decidir(accion) {
    if (accion === "descartar" && !window.confirm(`¿Descartar la presentación? No se enviará nada a ${junior.nombre} ni a ${persona}.`)) return;
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
      const r = await decidirPreparador(sesion.thread_id, { accion, aprobado_por: presentador, borrador_editado: limpio }, { simulado: sesion.simulado });
      onDecision(r);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <main className="screen">
      <div className="title-block">
        <p className="kicker">Casi listo</p>
        <Titulo>Tu presentación</Titulo>
        <p>Revísala, edítala o descártala. Tú decides qué se envía.</p>
      </div>
      {sesion.simulado && <AvisoDemo>Borrador de ejemplo: {MOTIVO_DEMO}.</AvisoDemo>}
      <EtiquetaIA>Borrador generado con IA</EtiquetaIA>
      <AvisosGuardian avisos={sesion.simulado ? null : sesion.avisos} />

      <div className="field message-field">
        <label htmlFor="mensaje">
          Mensaje de {presentador} para {junior.nombre} y {persona}
        </label>
        <textarea id="mensaje" value={b.mensaje_presentacion} onChange={(e) => setB({ ...b, mensaje_presentacion: e.target.value })} />
      </div>

      <details className="prep-card">
        <summary>
          <Avatar id={eleccion.persona_a_presentar} nombre={persona} tamano="sm" />
          <span className="mini-person">
            <b>Para {junior.nombre}</b>
            <span>Sobre {persona}, preguntas y qué evitar</span>
          </span>
        </summary>
        <div className="field">
          <label htmlFor="sobre-senior">Sobre {persona}</label>
          <textarea id="sobre-senior" value={b.ficha_para_junior.sobre_la_persona} onChange={(e) => fichaJunior({ sobre_la_persona: e.target.value })} />
        </div>
        <div className="field">
          <p className="field-label">Preguntas sugeridas</p>
          <ListaEditable
            titulo="Preguntas sugeridas"
            items={b.ficha_para_junior.preguntas_sugeridas}
            onChange={(preguntas_sugeridas) => fichaJunior({ preguntas_sugeridas })}
          />
        </div>
        <div className="field">
          <p className="field-label">Qué evitar</p>
          <ListaEditable titulo="Qué evitar" items={b.ficha_para_junior.que_evitar} onChange={(que_evitar) => fichaJunior({ que_evitar })} />
        </div>
      </details>

      <details className="prep-card">
        <summary>
          <Avatar id={junior.id} nombre={junior.nombre} tamano="sm" />
          <span className="mini-person">
            <b>Para {persona}</b>
            <span>Sobre {junior.nombre} y en qué puede ayudar</span>
          </span>
        </summary>
        <div className="field">
          <label htmlFor="sobre-junior">Sobre {junior.nombre}</label>
          <textarea id="sobre-junior" value={b.ficha_para_senior.sobre_la_persona} onChange={(e) => fichaSenior({ sobre_la_persona: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="ayuda-senior">En qué puede ayudar</label>
          <textarea
            id="ayuda-senior"
            value={b.ficha_para_senior.en_que_puede_ayudar}
            onChange={(e) => fichaSenior({ en_que_puede_ayudar: e.target.value })}
          />
        </div>
      </details>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <Boton icono="enviar" bloqueado={enviando} onClick={() => decidir("aprobar")}>
        {enviando ? "Enviando…" : sesion.simulado ? "Aprobar (ejemplo: no se envía)" : "Aprobar y enviar"}
      </Boton>
      <p className="solo-lector" aria-live="polite">
        {enviando ? "Enviando la presentación." : ""}
      </p>
      <Boton variante="ghost" bloqueado={enviando} onClick={() => decidir("descartar")}>
        Descartar presentación
      </Boton>
    </main>
  );
}

function Final({ titulo, children, acciones }) {
  return (
    <main className="screen ready-screen">
      <div className="celebrate-icon">
        <Icono nombre="enviar" tamano={34} />
      </div>
      <div className="title-block centered">
        <Titulo>{titulo}</Titulo>
        {children}
      </div>
      {acciones}
    </main>
  );
}

const PASOS_EN_CURSO = ["eleccion", "borrador", "error_preparador"];

export default function Presentar({ junior, presentador, buscaInicial, notaBusca, onEnCurso, onEnviada, onSalir, siguiente }) {
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

  const otra = (
    <Boton variante="secondary" onClick={reiniciar}>
      Empezar otra presentación
    </Boton>
  );

  if (paso === "busqueda") {
    return (
      <Busqueda
        junior={junior}
        presentador={presentador}
        buscaInicial={buscaInicial}
        notaBusca={notaBusca}
        onSalir={onSalir}
        onPropuestas={(s) => {
          setConector(s);
          setPaso("eleccion");
        }}
      />
    );
  }
  if (paso === "eleccion" || paso === "preparando") {
    return <Eleccion junior={junior} sesion={conector} onElegida={alElegir} onNinguna={() => setPaso("ninguna")} />;
  }
  if (paso === "error_preparador") {
    return (
      <main className="screen">
        <div className="title-block">
          <Titulo>No se ha podido preparar la presentación</Titulo>
          <p role="alert" className="error">
            {error}
          </p>
          <p>
            Ya elegiste presentar a {junior.nombre} a {eleccion.persona_nombre}. No se ha enviado nada.
          </p>
        </div>
        <Boton icono="reiniciar" onClick={preparar}>
          Volver a intentarlo
        </Boton>
        {otra}
      </main>
    );
  }
  if (paso === "borrador") {
    return (
      <Borrador
        junior={junior}
        sesion={borrador}
        eleccion={eleccion}
        onDecision={(r) => {
          setPaso(r.estado === "enviado" ? "enviada" : "descartada");
          if (r.estado === "enviado") onEnviada?.(r);
        }}
      />
    );
  }
  if (paso === "enviada") {
    return borrador.simulado ? (
      <Final
        titulo="Presentación de ejemplo aprobada"
        acciones={
          <>
            {siguiente && <Boton icono="flecha" onClick={siguiente.onClick}>{siguiente.texto}</Boton>}
            {otra}
          </>
        }
      >
        <p className="aviso-demo">{MOTIVO_DEMO.charAt(0).toUpperCase() + MOTIVO_DEMO.slice(1)}: no se ha enviado nada a nadie.</p>
      </Final>
    ) : (
      <Final
        titulo="¡Presentación enviada!"
        acciones={
          <>
            {siguiente && <Boton icono="flecha" onClick={siguiente.onClick}>{siguiente.texto}</Boton>}
            {otra}
          </>
        }
      >
        <p>
          {junior.nombre} y {eleccion.persona_nombre} ya tienen el mensaje y sus fichas. {junior.nombre} no ha tenido que pedir nada.
        </p>
      </Final>
    );
  }
  return (
    <main className="screen">
      <div className="title-block">
        <Titulo>{paso === "ninguna" ? "Sin presentación por ahora" : "Presentación descartada"}</Titulo>
        <p>No se ha enviado nada a nadie.</p>
      </div>
      {otra}
    </main>
  );
}
