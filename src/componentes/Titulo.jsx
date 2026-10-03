import { useEffect, useRef } from "react";

// Hasta que la persona interactúa no movemos el foco: en la carga inicial se empieza por el h1 y el selector.
let haInteractuado = false;
for (const evento of ["pointerdown", "keydown"]) {
  window.addEventListener(evento, () => (haInteractuado = true), { once: true, capture: true });
}

// Título que recibe el foco al cambiar de pantalla, para que el lector de pantalla la anuncie.
export default function Titulo({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (haInteractuado) ref.current?.focus();
  }, []);
  return (
    <h2 ref={ref} tabIndex={-1}>
      {children}
    </h2>
  );
}
