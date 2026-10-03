import { useState } from "react";
import Espejo from "./espejo/Espejo.jsx";
import Presentacion from "./presentacion/Presentacion.jsx";

const VISTAS = [
  { id: "presentacion", titulo: "Recibir una presentación", subtitulo: "Vista de Marta, el relevo de Nadia." },
  { id: "espejo", titulo: "El café con feedback", subtitulo: "Espejo: aprende de cada conversación." },
];

export default function App() {
  const [vista, setVista] = useState("presentacion");
  const actual = VISTAS.find((v) => v.id === vista);

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
              onClick={() => setVista(v.id)}
            >
              {i + 1}. {v.titulo}
            </button>
          ))}
        </nav>
        <p>{actual.subtitulo}</p>
      </header>

      {/* Cada vista guarda su propio estado; al cambiar de paso se empieza de cero. */}
      {vista === "presentacion" ? <Presentacion /> : <Espejo />}
    </main>
  );
}
