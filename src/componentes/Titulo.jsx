import { useEffect, useRef } from "react";

// Título que recibe el foco al cambiar de pantalla, para que el lector de pantalla la anuncie.
export default function Titulo({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <h2 ref={ref} tabIndex={-1}>
      {children}
    </h2>
  );
}
