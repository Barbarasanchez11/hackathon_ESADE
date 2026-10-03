import { useEffect, useState } from "react";
import { borrarHuella, verHuella } from "../api.js";
import Avatar from "../componentes/Avatar.jsx";
import Boton from "../componentes/Boton.jsx";
import Titulo from "../componentes/Titulo.jsx";

const LUCIA = "Lucía";

function fechaLegible(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

// Evidencias confirmadas por personas, agrupadas por skill. Sin notas, barras ni números de orden.
export default function Huella({ onIr }) {
  const [huella, setHuella] = useState(null);
  const [error, setError] = useState("");
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    let activo = true;
    verHuella(LUCIA).then(
      (h) => activo && setHuella(h),
      () => activo && setErrorCarga("No se ha podido cargar tu huella. Vuelve a intentarlo en un momento."),
    );
    return () => {
      activo = false;
    };
  }, []);

  async function borrar() {
    if (!window.confirm("¿Borrar tu huella? Se eliminan todas las evidencias y no se puede deshacer.")) return;
    setError("");
    try {
      await borrarHuella(LUCIA);
      setHuella({});
    } catch (e) {
      setError(e.message);
    }
  }

  const skills = Object.entries(huella ?? {});

  return (
    <main className="screen footprint-screen">
      <div className="wrapped-bg" aria-hidden="true" />
      <div className="title-block" style={{ position: "relative" }}>
        <p className="kicker">Mi huella</p>
        <Titulo>Lo que dejas cuando hablas</Titulo>
        <p>Evidencias reales, confirmadas por las personas con las que hablaste. Sin notas ni rankings.</p>
      </div>

      {errorCarga ? (
        <p role="alert" className="error">
          {errorCarga}
        </p>
      ) : huella === null ? (
        <p className="cargando" role="status">
          Cargando tu huella…
        </p>
      ) : skills.length === 0 ? (
        <div className="vacio">
          <p>Tu huella se llena con cada café que alguien confirma.</p>
          <Boton variante="secondary" className="btn-pequeno" onClick={() => onIr("cafe")}>
            Ir al café
          </Boton>
        </div>
      ) : (
        <ul className="sticker-wall">
          {skills.map(([skill, evidencias]) => (
            <li key={skill} className="skill-sticker">
              <h2>{skill}</h2>
              {evidencias.map((e, i) => (
                <div key={i}>
                  <p>{e.evidencia}</p>
                  {e.cita && <blockquote>«{e.cita}»</blockquote>}
                  <p className="confirmado">
                    <Avatar id={e.confirmada_por.toLowerCase()} nombre={e.confirmada_por} tamano="sm" />
                    <span>
                      Propuesta por la IA, confirmada por <b>{e.confirmada_por}</b>
                      <br />
                      {fechaLegible(e.fecha)}
                    </span>
                  </p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      <Boton icono="flecha" onClick={() => onIr("cadena")}>
        Ver mi cadena
      </Boton>
      {skills.length > 0 && (
        <Boton variante="ghost" onClick={borrar}>
          Borrar mi huella
        </Boton>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </main>
  );
}
