import { useEffect, useRef } from "react";

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
    <fieldset>
      <legend>{titulo}</legend>
      {items.length === 0 && <p className="ayuda">Sin elementos.</p>}
      {items.map((item, i) => (
        <div key={i} className="fila">
          <textarea
            ref={(el) => (campos.current[i] = el)}
            aria-label={`${titulo} ${i + 1}`}
            rows={2}
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button type="button" className="secundario" aria-label={`Quitar «${titulo}» ${i + 1}`} onClick={() => quitar(i)}>
            Quitar
          </button>
        </div>
      ))}
      <button ref={anadir} type="button" className="secundario" onClick={anadirItem}>
        Añadir a «{titulo}»
      </button>
    </fieldset>
  );
}
