import FlujoPresentacion from "./FlujoPresentacion.jsx";

// Paso 1 de la demo: Marta, el relevo de Lucía, la presenta a alguien de su red.
export default function PresentarLucia({ onEnCurso, onCompletado }) {
  return (
    <FlujoPresentacion
      junior={{ id: "lucia", nombre: "Lucía" }}
      presentador={{ id: "marta", nombre: "Marta" }}
      buscaInicial="Entrar en marketing: primeras prácticas y aprender analítica de campañas."
      onEnCurso={onEnCurso}
      onEnviada={onCompletado}
    />
  );
}
