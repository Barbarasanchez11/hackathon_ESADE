import Icono from "./Icono.jsx";

// Lo que ha encontrado el Guardián al revisar el texto de otro agente. Nunca cambia el texto: avisa a quien aprueba.
const TIPOS = {
  dato_inventado: "Puede no estar en lo que se sabe",
  puntuacion: "Puntuación",
  dato_sensible: "Dato sensible",
  sin_revision: "Sin revisar",
};

export default function AvisosGuardian({ avisos }) {
  // En modo simulado no hay revisión: no se muestra nada para no dar a entender que la hubo.
  if (!avisos) return null;

  if (avisos.length === 0) {
    return (
      <p className="guardian">
        <Icono nombre="escudo" tamano={18} />
        <span>
          <b>Revisado</b> por el Guardián: sin datos inventados ni puntuaciones
        </span>
      </p>
    );
  }

  return (
    <div className="guardian-avisos" role="note" aria-label="Avisos del Guardián">
      <p className="guardian-titulo">
        <Icono nombre="escudo" tamano={18} />
        El Guardián te pide que revises esto antes de aprobar:
      </p>
      <ul>
        {avisos.map((a, i) => (
          <li key={i}>
            <span className="skill skill-pink">{TIPOS[a.tipo] ?? a.tipo}</span>
            {a.fragmento && <q>{a.fragmento}</q>}
            <span className="guardian-detalle">{a.detalle}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
