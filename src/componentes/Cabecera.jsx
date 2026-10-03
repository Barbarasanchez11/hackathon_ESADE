import { useEffect, useRef, useState } from "react";
import Icono from "./Icono.jsx";

export default function Cabecera({ titulo, onVolver, onComoFunciona, tema, onCambiarTema, onReiniciar }) {
  const [menu, setMenu] = useState(false);
  const boton = useRef(null);

  // El menú se cierra con Escape y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!menu) return;
    const cerrar = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        boton.current?.focus();
      }
    };
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [menu]);

  return (
    <header className="topbar">
      <div className="top-left">
        {onVolver ? (
          <button type="button" className="icon-btn" aria-label="Volver" onClick={onVolver}>
            <Icono nombre="flechaIzq" tamano={20} />
          </button>
        ) : (
          <p className="brand">
            <span className="brand-mark">
              <Icono nombre="testigo" tamano={19} />
            </span>
            relevo
          </p>
        )}
        {titulo && <strong>{titulo}</strong>}
      </div>
      <div className="top-actions">
        <button type="button" className="icon-btn" aria-label="Cómo funciona" onClick={onComoFunciona}>
          <Icono nombre="info" tamano={19} />
        </button>
        <button type="button" className="icon-btn" aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"} onClick={onCambiarTema}>
          <Icono nombre={tema === "dark" ? "sol" : "luna"} tamano={19} />
        </button>
        <button
          ref={boton}
          type="button"
          className="icon-btn"
          aria-label="Más opciones"
          aria-expanded={menu}
          aria-controls="menu-opciones"
          onClick={() => setMenu(!menu)}
        >
          <Icono nombre="menu" tamano={22} />
        </button>
      </div>
      {menu && (
        <div id="menu-opciones" className="menu">
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              onReiniciar();
            }}
          >
            <Icono nombre="reiniciar" tamano={18} /> Reiniciar demo
          </button>
        </div>
      )}
    </header>
  );
}
