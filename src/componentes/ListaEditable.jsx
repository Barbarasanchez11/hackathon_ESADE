import { useEffect, useRef } from "react";
import Icono from "./Icono.jsx";

export default function ListaEditable({ titulo, items, onChange }) {
  const campos = useRef([]);
  const anadir = useRef(null);
  // Índice del campo que debe recibir el foco tras quitar o añadir (-1: el botón «Añadir»).
  const enfocar = useRef(null);

  useEffect(() => {
    if (enfocar.current === null) return;
    const destino = enfocar.current === -1 ? anadir.current : campos.current[enfocar.current];
    destino?.focus();
    enfocar.current = null;
  }, [items]);

  function quitar(i) {
    onChange(items.filter((_, j) => j !== i));
    enfocar.current = items.length > 1 ? Math.min(i, items.length - 2) : -1;
  }

  function anadirItem() {
    onChange([...items, ""]);
    enfocar.current = items.length;
  }

  return (
    <div>
      {items.length === 0 && <p className="helper">Sin elementos.</p>}
      {items.map((item, i) => (
        <div key={i} className="fila">
          <textarea
            ref={(el) => (campos.current[i] = el)}
            className="campo-texto"
            aria-label={`${titulo} ${i + 1}`}
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button type="button" className="icono-quitar" aria-label={`Quitar «${titulo}» ${i + 1}`} onClick={() => quitar(i)}>
            <Icono nombre="x" tamano={16} />
          </button>
        </div>
      ))}
      <button ref={anadir} type="button" className="anadir" onClick={anadirItem}>
        + Añadir a «{titulo}»
      </button>
    </div>
  );
}
