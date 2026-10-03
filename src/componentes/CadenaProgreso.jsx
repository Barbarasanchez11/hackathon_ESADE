import { PRESENTACIONES_PARA_RELEVO } from "../constantes.js";
import Icono from "./Icono.jsx";

// Las presentaciones que ha recibido la persona. Es su propio progreso, no una comparación.
export default function CadenaProgreso({ nombre, recibidas, titulo = "Tu cadena" }) {
  const total = PRESENTACIONES_PARA_RELEVO;
  const hechas = Math.min(recibidas, total);
  return (
    <div className="progress-wrap">
      <p className="progress-label">
        <span>{titulo}</span>
        <b>
          {hechas} de {total}
        </b>
        <span className="solo-lector">
          : {nombre} ha recibido {hechas} de {total} presentaciones
        </span>
      </p>
      <ol className="chain-row" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li className="link-wrap" key={i}>
            <span className={`chain-link ${i < hechas ? "done" : ""}`}>
              {i < hechas ? <Icono nombre="check" tamano={16} /> : <span>{i + 1}</span>}
            </span>
            {i < total - 1 && <span className={`connector ${i + 1 < hechas ? "done" : ""}`} />}
          </li>
        ))}
      </ol>
    </div>
  );
}
