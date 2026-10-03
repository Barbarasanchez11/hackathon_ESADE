import { useCallback, useEffect, useState } from "react";
import { verPersona } from "../api.js";
import Avatar from "../componentes/Avatar.jsx";
import Boton from "../componentes/Boton.jsx";
import CadenaProgreso from "../componentes/CadenaProgreso.jsx";
import Icono from "../componentes/Icono.jsx";
import Titulo from "../componentes/Titulo.jsx";
import { PRESENTACIONES_PARA_RELEVO } from "../constantes.js";
import Presentar from "./Presentar.jsx";

const LUCIA = { id: "lucia", nombre: "Lucía" };

// Con las presentaciones completas, Lucía pasa el relevo a quien viene detrás.
export default function MiCadena({ onEnCurso, onCompletado, onIr }) {
  const [lucia, setLucia] = useState(null);
  const [error, setError] = useState("");
  const [junior, setJunior] = useState(null);

  const cargar = useCallback(() => {
    setError("");
    setLucia(null);
    return verPersona(LUCIA.id).then(setLucia, (e) => setError(e.message));
  }, []);

  useEffect(() => {
    let activo = true;
    verPersona(LUCIA.id).then(
      (p) => activo && setLucia(p),
      (e) => activo && setError(e.message),
    );
    return () => {
      activo = false;
    };
  }, []);

  if (junior) {
    const { intereses = [], rol = "" } = junior.comparte;
    const partes = [rol && `${rol}.`, intereses.length > 0 && `Le interesan: ${intereses.join(", ")}.`].filter(Boolean);
    return (
      <Presentar
        junior={{ id: junior.id, nombre: junior.nombre }}
        presentador={LUCIA}
        buscaInicial={partes.join(" ")}
        notaBusca={`Lo hemos rellenado con lo que ${junior.nombre} comparte en su perfil. Cámbialo si sabes qué busca.`}
        onEnCurso={onEnCurso}
        onEnviada={onCompletado}
        onSalir={() => setJunior(null)}
        siguiente={{ texto: "Ver cómo funciona", onClick: () => onIr("como") }}
      />
    );
  }

  if (error) {
    return (
      <main className="screen">
        <div className="title-block">
          <Titulo>No se ha podido cargar tu cadena</Titulo>
          <p role="alert" className="error">
            {error}
          </p>
        </div>
        <Boton icono="reiniciar" onClick={cargar}>
          Volver a intentarlo
        </Boton>
      </main>
    );
  }

  if (!lucia) {
    return (
      <main className="screen">
        <div className="title-block">
          <p className="kicker">Mi cadena</p>
          <Titulo>Tu cadena</Titulo>
        </div>
        <p className="cargando" role="status">
          Cargando tu cadena…
        </p>
      </main>
    );
  }

  if (!lucia.puede_pasar_relevo) {
    const faltan = PRESENTACIONES_PARA_RELEVO - lucia.presentaciones_recibidas;
    return (
      <main className="screen">
        <div className="title-block">
          <p className="kicker">Mi cadena</p>
          <Titulo>Todavía no toca pasar el relevo</Titulo>
          <p>
            Te {faltan === 1 ? "falta 1 presentación" : `faltan ${faltan} presentaciones`}. Cuando completes tu cadena, podrás
            abrirle la puerta a quien viene detrás.
          </p>
        </div>
        <CadenaProgreso nombre={LUCIA.nombre} recibidas={lucia.presentaciones_recibidas} />
        <Boton icono="flecha" onClick={() => onIr("inicio")}>
          Volver al inicio
        </Boton>
      </main>
    );
  }

  return (
    <main className="screen ready-screen">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-(i % 6) * 0.45}s` }} />
        ))}
      </div>
      <div className="celebrate-icon">
        <Icono nombre="testigo" tamano={36} />
      </div>
      <div className="title-block centered">
        <p className="kicker">Cadena completa</p>
        <Titulo>¡Ya puedes pasar el relevo!</Titulo>
        <p>
          {PRESENTACIONES_PARA_RELEVO} personas te abrieron una puerta sin que tuvieras que pedir nada. Ahora tú puedes abrirle la
          primera a alguien más.
        </p>
      </div>
      {lucia.simulado && <p className="aviso-demo">Modo demo sin conexión.</p>}
      <CadenaProgreso nombre={LUCIA.nombre} recibidas={lucia.presentaciones_recibidas} />

      {lucia.detras.length === 0 ? (
        <p className="vacio">Ahora mismo no hay nadie en tu red esperando su relevo.</p>
      ) : (
        lucia.detras.map((d) => (
          <article key={d.id} className="iker-card">
            <div className="iker-head">
              <Avatar id={d.id} nombre={d.nombre} tamano="lg" />
              <div>
                <p>Viene detrás de ti</p>
                <h2>{d.nombre}</h2>
                {d.comparte.rol && <p>{d.comparte.rol}</p>}
              </div>
            </div>
            {d.comparte.intereses?.length > 0 && (
              <ul className="mini-tags" aria-label={`Intereses de ${d.nombre}`}>
                {d.comparte.intereses.map((i, n) => (
                  <li key={i} className={`skill ${["skill-lime", "skill-cyan", "skill-pink"][n % 3]}`}>
                    {i}
                  </li>
                ))}
              </ul>
            )}
            <Boton icono="testigo" onClick={() => setJunior(d)}>
              Pasar el relevo a {d.nombre}
            </Boton>
          </article>
        ))
      )}
      <Boton variante="ghost" onClick={() => onIr("como")}>
        Ver cómo funciona
      </Boton>
    </main>
  );
}
