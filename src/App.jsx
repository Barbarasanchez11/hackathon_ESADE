import { useCallback, useState } from "react";
import Espejo from "./espejo/Espejo.jsx";
import Presentacion from "./presentacion/Presentacion.jsx";

const VISTAS = [
  { id: "presentacion", titulo: "Presentar a Nadia", subtitulo: "Vista de Marta, el relevo de Nadia." },
  { id: "espejo", titulo: "El café con feedback", subtitulo: "Espejo: aprende de cada conversación." },
];

export default function App() {
  const [vista, setVista] = useState("presentacion");
  const [enCurso, setEnCurso] = useState(false);
  const actual = VISTAS.find((v) => v.id === vista);
  const alCambiarEnCurso = useCallback((valor) => setEnCurso(valor), []);

  function cambiarVista(id) {
    if (id === vista) return;
    if (enCurso && !window.confirm("Tienes una propuesta sin decidir. Si cambias de paso, se perderán los cambios. ¿Cambiar igualmente?")) return;
    setEnCurso(false);
    setVista(id);
  }

  return (
    <main>
      <header>
        <h1>Relevo</h1>
        <nav aria-label="Pasos de la demo" className="pasos">
          {VISTAS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              className={v.id === vista ? "paso paso-actual" : "paso"}
              aria-current={v.id === vista ? "step" : undefined}
              onClick={() => cambiarVista(v.id)}
            >
              {i + 1}. {v.titulo}
            </button>
          ))}
        </nav>
        <p>{actual.subtitulo}</p>
      </header>

      {/* Cada vista guarda su propio estado; al cambiar de paso se empieza de cero. */}
      {vista === "presentacion" ? <Presentacion onEnCurso={alCambiarEnCurso} /> : <Espejo onEnCurso={alCambiarEnCurso} />}
    </main>
  );
}
