export default function Interruptor({ activo, onCambio, etiqueta, describedBy }) {
  return (
    <button type="button" className="toggle-row" role="switch" aria-checked={activo} aria-describedby={describedBy} onClick={onCambio}>
      <span>{etiqueta}</span>
      <span className={`toggle ${activo ? "on" : ""}`} aria-hidden="true">
        <span />
      </span>
    </button>
  );
}
