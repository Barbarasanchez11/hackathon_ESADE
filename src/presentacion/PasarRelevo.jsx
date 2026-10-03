import { useCallback, useEffect, useState } from "react";
import { verPersona } from "../api.js";
import Avatar from "../componentes/Avatar.jsx";
import CadenaProgreso from "../componentes/CadenaProgreso.jsx";
import Celebracion from "../componentes/Celebracion.jsx";
import Titulo from "../componentes/Titulo.jsx";
import { PRESENTACIONES_PARA_RELEVO } from "../constantes.js";
import FlujoPresentacion from "./FlujoPresentacion.jsx";

const NADIA = { id: "nadia", nombre: "Nadia" };

// Paso 3 de la demo: con las presentaciones completas, Nadia presenta a quien viene detrás.
export default function PasarRelevo({ onEnCurso, onCompletado }) {
  const [nadia, setNadia] = useState(null);
  const [error, setError] = useState("");
  const [junior, setJunior] = useState(null);

  const cargar = useCallback(() => {
    setError("");
    setNadia(null);
    return verPersona(NADIA.id).then(setNadia, (e) => setError(e.message));
  }, []);

  useEffect(() => {
    let activo = true;
    verPersona(NADIA.id).then(
      (p) => activo && setNadia(p),
      (e) => activo && setError(e.message),
    );
    return () => {
      activo = false;
    };
  }, []);

  if (error) {
    return (
      <section className="tarjeta">
        <Titulo>No se ha podido cargar la cadena</Titulo>
        <p role="alert" className="error">
          {error}
        </p>
        <div className="acciones">
          <button type="button" className="principal" onClick={cargar}>
            Volver a intentarlo
          </button>
        </div>
      </section>
    );
  }

  if (!nadia) {
    return (
      <section className="tarjeta">
        <p aria-live="polite">Cargando la cadena de {NADIA.nombre}…</p>
      </section>
    );
  }

  if (junior) {
    const { intereses = [], rol } = junior.comparte;
    return (
      <FlujoPresentacion
        junior={{ id: junior.id, nombre: junior.nombre }}
        presentador={NADIA}
        buscaInicial={`${rol}. Le interesan: ${intereses.join(", ")}.`}
        notaBusca={`Lo hemos rellenado con lo que ${junior.nombre} comparte en su perfil. Cámbialo si sabes qué busca.`}
        onEnCurso={onEnCurso}
        onEnviada={onCompletado}
      />
    );
  }

  if (!nadia.puede_pasar_relevo) {
    const faltan = PRESENTACIONES_PARA_RELEVO - nadia.presentaciones_recibidas;
    return (
      <section className="tarjeta">
        <Titulo>Todavía no toca pasar el relevo</Titulo>
        <CadenaProgreso nombre={NADIA.nombre} recibidas={nadia.presentaciones_recibidas} total={PRESENTACIONES_PARA_RELEVO} />
        <p>
          A {NADIA.nombre} le {faltan === 1 ? "falta 1 presentación" : `faltan ${faltan} presentaciones`}. Haz primero el
          paso «Presentar a Nadia».
        </p>
      </section>
    );
  }

  return (
    <section className="tarjeta tarjeta-fiesta">
      <Celebracion />
      {nadia.simulado && <p className="simulado">Modo demo sin conexión</p>}
      <p className="antetitulo">Vista de {NADIA.nombre}</p>
      <Titulo>¡Ya puedes pasar el relevo!</Titulo>
      <CadenaProgreso nombre={NADIA.nombre} recibidas={nadia.presentaciones_recibidas} total={PRESENTACIONES_PARA_RELEVO} />
      <p>
        Te han presentado a {PRESENTACIONES_PARA_RELEVO} personas sin que tuvieras que pedir nada. Ahora te toca abrirle la
        puerta a quien viene detrás.
      </p>

      {nadia.detras.length === 0 ? (
        <p className="ayuda">Ahora mismo no hay nadie en tu red esperando su relevo.</p>
      ) : (
        <ul className="detras">
          {nadia.detras.map((d) => (
            <li key={d.id} className="persona-detras">
              <Avatar id={d.id} nombre={d.nombre} grande />
              <div>
                <h3 className="propuesta-nombre">{d.nombre}</h3>
                <p className="motivo">{d.comparte.rol}</p>
                <ul className="etiquetas" aria-label={`Intereses de ${d.nombre}`}>
                  {(d.comparte.intereses || []).map((i) => (
                    <li key={i} className="etiqueta">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <button type="button" className="principal" onClick={() => setJunior(d)}>
                Pasar el relevo a {d.nombre}
                <span aria-hidden="true"> →</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
