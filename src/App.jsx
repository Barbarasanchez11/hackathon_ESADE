import { useCallback, useState } from "react";
import { reiniciarDemo } from "./api.js";
import Logo from "./componentes/Logo.jsx";
import Espejo from "./espejo/Espejo.jsx";
import PasarRelevo from "./presentacion/PasarRelevo.jsx";
import PresentarNadia from "./presentacion/PresentarNadia.jsx";

const VISTAS = [
  { id: "presentacion", titulo: "Presentar a Nadia", Vista: PresentarNadia },
  { id: "espejo", titulo: "El café", Vista: Espejo },
  { id: "relevo", titulo: "Pasar el relevo", Vista: PasarRelevo },
];

export default function App() {
  const [vista, setVista] = useState("presentacion");
  const [enCurso, setEnCurso] = useState(false);
  // Cambiar la clave vuelve a montar la vista desde cero (al reiniciar la demo).
  const [version, setVersion] = useState(0);
  const { Vista } = VISTAS.find((v) => v.id === vista);
  const alCambiarEnCurso = useCallback((valor) => setEnCurso(valor), []);

  function cambiarVista(id) {
    if (id === vista) return;
    if (enCurso && !window.confirm("Tienes una propuesta sin decidir. Si cambias de paso, se perderán los cambios. ¿Cambiar igualmente?")) return;
    setEnCurso(false);
    setVista(id);
  }

  async function reiniciar() {
    if (!window.confirm("¿Reiniciar la demo? Nadia vuelve a 4 presentaciones y se borra lo que hayas hecho.")) return;
    await reiniciarDemo();
    setEnCurso(false);
    setVista("presentacion");
    setVersion((v) => v + 1);
  }

  return (
    <div className="app">
      <header className="cabecera">
        <div className="cabecera-fila">
          <Logo />
          <button type="button" className="enlace" onClick={reiniciar}>
            Reiniciar demo
          </button>
        </div>
        <nav aria-label="Pasos de la demo" className="pasos">
          {VISTAS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              className={v.id === vista ? "paso paso-actual" : "paso"}
              aria-current={v.id === vista ? "step" : undefined}
              onClick={() => cambiarVista(v.id)}
            >
              <span className="paso-numero">{i + 1}</span>
              {v.titulo}
            </button>
          ))}
        </nav>
      </header>

      <main className="contenido">
        <Vista key={`${vista}-${version}`} onEnCurso={alCambiarEnCurso} />
      </main>

      <footer className="pie">La IA propone, las personas deciden. Sin rankings ni puntuaciones.</footer>
    </div>
  );
}
