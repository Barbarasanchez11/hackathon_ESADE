import { useEffect, useState } from "react";
import { verPersona } from "../api.js";
import Avatar from "../componentes/Avatar.jsx";
import CadenaProgreso from "../componentes/CadenaProgreso.jsx";
import Icono from "../componentes/Icono.jsx";
import Titulo from "../componentes/Titulo.jsx";

// Inicio de Lucía: su cadena y lo siguiente que le toca. Lo destacado cambia según avanza la demo.
export default function Inicio({ hechos, onIr }) {
  const [lucia, setLucia] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    verPersona("lucia").then(
      (p) => activo && setLucia(p),
      (e) => activo && setError(e.message),
    );
    return () => {
      activo = false;
    };
  }, [hechos]);

  const recibidas = lucia?.presentaciones_recibidas;
  const completa = lucia?.puede_pasar_relevo;

  let destacado;
  if (!hechos.has("presentacion") && !completa) {
    destacado = {
      etiqueta: "Nuevo",
      quien: { id: "marta", nombre: "Marta" },
      antetitulo: "Tu relevo",
      titulo: "Marta quiere presentarte a alguien",
      cta: "Ver cómo lo prepara",
      ir: "presentar",
    };
  } else if (!hechos.has("cafe")) {
    destacado = {
      etiqueta: "Hoy",
      quien: { id: "javier", nombre: "Javier" },
      antetitulo: "Te han presentado",
      titulo: "Tu café con Javier",
      cta: "Ir al café",
      ir: "cafe",
    };
  } else {
    destacado = {
      etiqueta: "Tu turno",
      quien: { id: "iker", nombre: "Iker" },
      antetitulo: "Cadena completa",
      titulo: "Pasa el relevo a quien viene detrás",
      cta: "Ver mi cadena",
      ir: "cadena",
    };
  }

  return (
    <main className="screen">
      <section className="hello">
        <div>
          <p className="kicker">Tu red, sin pedir favores</p>
          <Titulo>
            Hola, Lucía <span aria-hidden="true">👋</span>
          </Titulo>
          <p>
            {!lucia
              ? "Tu red, sin pedir favores."
              : completa
                ? "Has completado tu cadena. Ya puedes pasar el relevo."
                : recibidas === 4
                  ? "Una puerta más y completas tu cadena."
                  : `Llevas ${recibidas} presentaciones.`}
          </p>
        </div>
        <Avatar id="lucia" nombre="Lucía" />
      </section>

      {error ? (
        <p role="alert" className="error">
          No se ha podido cargar tu cadena: {error}
        </p>
      ) : lucia ? (
        <CadenaProgreso nombre="Lucía" recibidas={recibidas} />
      ) : (
        <p className="cargando" role="status">
          Cargando tu cadena…
        </p>
      )}

      <button type="button" className="feature-card" onClick={() => onIr(destacado.ir)}>
        <span className="sticker">{destacado.etiqueta}</span>
        <span className="avatar-pair">
          <Avatar id={destacado.quien.id} nombre={destacado.quien.nombre} tamano="lg" />
        </span>
        <span className="feature-ante">{destacado.antetitulo}</span>
        <span className="feature-titulo">{destacado.titulo}</span>
        <span className="feature-cta">
          {destacado.cta} <Icono nombre="flecha" tamano={18} />
        </span>
      </button>

      <section>
        <div className="section-title">
          <div>
            <p className="kicker">Lo siguiente</p>
            <h2>Tu próximo café</h2>
          </div>
        </div>
        <button type="button" className="coffee-card" onClick={() => onIr("cafe")}>
          <span className="coffee-emoji" aria-hidden="true">
            ☕
          </span>
          <span>
            <span className="coffee-titulo">Ir al café con Javier</span>
            <span className="coffee-detalle">Lucía + Javier, cuando Marta os presente</span>
          </span>
          <span className="round-arrow" aria-hidden="true">
            <Icono nombre="flecha" tamano={17} />
          </span>
        </button>
      </section>
    </main>
  );
}
