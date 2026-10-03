// Iniciales en un círculo. El color sale solo del id de la persona: no dice nada de ella.
const COLORES = ["violeta", "lima", "rosa", "cian"];

function colorDe(id) {
  let suma = 0;
  for (const letra of id) suma += letra.charCodeAt(0);
  return COLORES[suma % COLORES.length];
}

export default function Avatar({ id, nombre, grande = false }) {
  return (
    <span className={`avatar avatar-${colorDe(id)}${grande ? " avatar-grande" : ""}`} aria-hidden="true">
      {nombre.slice(0, 2).toUpperCase()}
    </span>
  );
}
