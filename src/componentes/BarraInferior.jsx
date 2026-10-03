import Icono from "./Icono.jsx";

const ELEMENTOS = [
  { texto: "Inicio", icono: "inicio", destino: "inicio", activa: ["inicio", "presentar"] },
  { texto: "Mi cadena", icono: "cadena", destino: "cadena", activa: ["cadena", "como"] },
  { texto: "Cafés", icono: "cafe", destino: "cafe", activa: ["cafe"] },
  { texto: "Mi huella", icono: "chispa", destino: "huella", activa: ["huella"] },
];

export default function BarraInferior({ pantalla, onIr }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {ELEMENTOS.map((e) => (
        <button key={e.destino} type="button" aria-current={e.activa.includes(pantalla) ? "page" : undefined} onClick={() => onIr(e.destino)}>
          <Icono nombre={e.icono} tamano={20} />
          <span>{e.texto}</span>
        </button>
      ))}
    </nav>
  );
}
