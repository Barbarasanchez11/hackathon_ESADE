// Cinco eslabones: las presentaciones que la persona ha recibido. Es su propio progreso, no una comparación.
export default function CadenaProgreso({ nombre, recibidas, total = 5 }) {
  const hechas = Math.min(recibidas, total);
  return (
    <div className="cadena">
      <p className="cadena-texto">
        <strong>
          {hechas} de {total}
        </strong>{" "}
        presentaciones de {nombre}
      </p>
      <ol className="cadena-eslabones" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={i < hechas ? "eslabon eslabon-hecho" : "eslabon"} />
        ))}
      </ol>
    </div>
  );
}
