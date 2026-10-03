import { useCallback, useState } from "react";
import { reiniciarDemo } from "./api.js";
import LineaTiempo from "./componentes/LineaTiempo.jsx";
import Logo from "./componentes/Logo.jsx";
import Proceso from "./componentes/Proceso.jsx";
import Espejo from "./espejo/Espejo.jsx";
import PasarRelevo from "./presentacion/PasarRelevo.jsx";
import PresentarLucia from "./presentacion/PresentarLucia.jsx";

const VISTAS = [
  { id: "presentacion", titulo: "Presentar a Lucía", quien: "Marta → Lucía", Vista: PresentarLucia },
  { id: "espejo", titulo: "El café", quien: "Lucía y Javier", Vista: Espejo },
  { id: "relevo", titulo: "Pasar el relevo", quien: "Lucía → Iker", Vista: PasarRelevo },
];

export default function App() {
  const [vista, setVista] = useState("presentacion");
  const [enCurso, setEnCurso] = useState(false);
  const [hechos, setHechos] = useState(() => new Set());
  const [verProceso, setVerProceso] = useState(false);
  // Cambiar la clave vuelve a montar la vista desde cero (al reiniciar la demo).
  const [version, setVersion] = useState(0);
  const { Vista } = VISTAS.find((v) => v.id === vista);
  const alCambiarEnCurso = useCallback((valor) => setEnCurso(valor), []);
  const alCompletar = useCallback((id) => setHechos((h) => new Set(h).add(id)), []);

  function cambiarVista(id) {
    if (id === vista) return;
    if (enCurso && !window.confirm("Tienes una propuesta sin decidir. Si cambias de paso, se perderán los cambios. ¿Cambiar igualmente?")) return;
    setEnCurso(false);
    setVerProceso(false);
    setVista(id);
  }

  async function reiniciar() {
    if (!window.confirm("¿Reiniciar la demo? Lucía vuelve a 4 presentaciones y se borra lo que hayas hecho.")) return;
    await reiniciarDemo();
    setEnCurso(false);
    setHechos(new Set());
    setVerProceso(false);
    setVista("presentacion");
    setVersion((v) => v + 1);
  }

  return (
    <div className="app">
      <header className="cabecera">
        <div className="cabecera-fila">
          <h1 className="titulo-app">
            <Logo />
          </h1>
          <div className="cabecera-enlaces">
            <button
              type="button"
              className="enlace"
              aria-pressed={verProceso}
              onClick={() => setVerProceso((v) => !v)}
            >
              ¿Cómo funciona?
            </button>
            <button type="button" className="enlace" onClick={reiniciar}>
              Reiniciar demo
            </button>
          </div>
        </div>
        <LineaTiempo pasos={VISTAS} actual={verProceso ? null : vista} hechos={hechos} onElegir={cambiarVista} />
      </header>

      <main className="contenido">
        {verProceso && <Proceso onCerrar={() => setVerProceso(false)} />}
        {/* La vista sigue montada mientras se ve el proceso, para no perder lo que estaba a medias. */}
        <div hidden={verProceso}>
          <Vista
            key={`${vista}-${version}`}
            onEnCurso={alCambiarEnCurso}
            onCompletado={() => alCompletar(vista)}
          />
        </div>
      </main>

      <footer className="pie">La IA propone, las personas deciden. Sin rankings ni puntuaciones.</footer>
    </div>
  );
}
