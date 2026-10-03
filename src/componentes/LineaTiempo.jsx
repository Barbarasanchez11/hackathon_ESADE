// Línea de tiempo de la demo: también es la navegación entre pasos.
export default function LineaTiempo({ pasos, actual, hechos, onElegir }) {
  return (
    <nav aria-label="Pasos de la demo" className="linea">
      <ol className="linea-hitos">
        {pasos.map((p, i) => {
          const hecho = hechos.has(p.id);
          const esActual = p.id === actual;
          const clases = ["hito", hecho && "hito-hecho", esActual && "hito-actual"].filter(Boolean).join(" ");
          return (
            <li key={p.id} className={clases}>
              <button
                type="button"
                className="hito-boton"
                aria-current={esActual ? "step" : undefined}
                onClick={() => onElegir(p.id)}
              >
                <span className="hito-punto" aria-hidden="true">
                  {hecho ? "✓" : i + 1}
                </span>
                <span className="hito-titulo">{p.titulo}</span>
                <span className="hito-quien">{p.quien}</span>
                {hecho && <span className="solo-lector"> (hecho)</span>}
              </button>
            </li>
          );
        })}
        <li className="hito hito-final" aria-label="Después: la cadena sigue con Iker">
          <span className="hito-punto" aria-hidden="true">
            ∞
          </span>
          <span className="hito-titulo" aria-hidden="true">
            La cadena sigue
          </span>
        </li>
      </ol>
    </nav>
  );
}
