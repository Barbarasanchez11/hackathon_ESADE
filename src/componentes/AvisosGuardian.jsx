// Lo que ha encontrado el Guardián al revisar el texto de otro agente. Nunca cambia el texto: avisa a quien aprueba.
const TIPOS = {
  dato_inventado: "Puede no estar en lo que se sabe",
  puntuacion: "Puntuación",
  dato_sensible: "Dato sensible",
  sin_revision: "Sin revisar",
};

function Escudo() {
  return (
    <svg className="escudo" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
    </svg>
  );
}

export default function AvisosGuardian({ avisos }) {
  // En modo simulado no hay revisión: no se muestra nada para no dar a entender que la hubo.
  if (!avisos) return null;

  if (avisos.length === 0) {
    return (
      <p className="guardian guardian-ok">
        <Escudo />
        Revisado por el Guardián: no ha encontrado datos inventados, puntuaciones ni datos sensibles.
      </p>
    );
  }

  return (
    <div className="guardian guardian-avisos" role="note" aria-label="Avisos del Guardián">
      <p className="guardian-titulo">
        <Escudo />
        El Guardián te pide que revises esto antes de aprobar:
      </p>
      <ul>
        {avisos.map((a, i) => (
          <li key={i}>
            <span className="etiqueta">{TIPOS[a.tipo] ?? a.tipo}</span>
            {a.fragmento && <q className="guardian-fragmento">{a.fragmento}</q>}
            <span className="guardian-detalle">{a.detalle}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
