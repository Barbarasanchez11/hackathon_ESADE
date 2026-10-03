import Icono from "./Icono.jsx";

// Transparencia (Ley de IA, art. 50): todo lo que propone la IA se marca como tal.
export default function EtiquetaIA({ children = "Propuesta generada con IA" }) {
  return (
    <p className="ai-label">
      <Icono nombre="chispa" tamano={14} /> {children}
    </p>
  );
}
