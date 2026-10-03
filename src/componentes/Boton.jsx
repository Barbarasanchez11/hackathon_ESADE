import Icono from "./Icono.jsx";

// Botón del diseño. Para bloquear sin perder el foco se usa bloqueado (aria-disabled) en vez de disabled.
export default function Boton({ children, variante = "primary", icono, bloqueado = false, onClick, className = "", ...resto }) {
  return (
    <button
      type="button"
      className={`btn btn-${variante} ${className}`}
      aria-disabled={bloqueado || undefined}
      onClick={(e) => !bloqueado && onClick?.(e)}
      {...resto}
    >
      <span>{children}</span>
      {icono && <Icono nombre={icono} tamano={18} />}
    </button>
  );
}
