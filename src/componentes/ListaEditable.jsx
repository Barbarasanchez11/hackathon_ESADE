export default function ListaEditable({ titulo, items, onChange }) {
  return (
    <fieldset>
      <legend>{titulo}</legend>
      {items.length === 0 && <p className="ayuda">Sin elementos.</p>}
      {items.map((item, i) => (
        <div key={i} className="fila">
          <textarea
            aria-label={`${titulo} ${i + 1}`}
            rows={2}
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button
            type="button"
            className="secundario"
            aria-label={`Quitar «${titulo}» ${i + 1}`}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            Quitar
          </button>
        </div>
      ))}
      <button type="button" className="secundario" onClick={() => onChange([...items, ""])}>
        Añadir a «{titulo}»
      </button>
    </fieldset>
  );
}
