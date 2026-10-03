import { useEffect, useRef } from "react";

// Hasta que la persona interactúa no movemos el foco: en la carga inicial se empieza por el principio.
let haInteractuado = false;
for (const evento of ["pointerdown", "keydown"]) {
  window.addEventListener(evento, () => (haInteractuado = true), { once: true, capture: true });
}

// Título de pantalla: recibe el foco al cambiar de pantalla para que el lector de pantalla la anuncie.
export default function Titulo({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (haInteractuado) ref.current?.focus();
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1}>
      {children}
    </h1>
  );
}
