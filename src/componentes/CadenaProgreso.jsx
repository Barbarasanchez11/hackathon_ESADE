import { PRESENTACIONES_PARA_RELEVO } from "../constantes.js";

// Cinco eslabones: las presentaciones que la persona ha recibido. Es su propio progreso, no una comparación.
export default function CadenaProgreso({ nombre, recibidas, total = PRESENTACIONES_PARA_RELEVO }) {
  const hechas = Math.min(recibidas, total);
  return (
    <div className="cadena">
      <p className="cadena-texto">
        {nombre} ha recibido{" "}
        <strong>
          {hechas} de {total}
        </strong>{" "}
        presentaciones
      </p>
      <ol className="cadena-eslabones" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={i < hechas ? "eslabon eslabon-hecho" : "eslabon"} />
        ))}
      </ol>
    </div>
  );
}
