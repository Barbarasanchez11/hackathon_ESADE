// Confeti solo con CSS; con prefers-reduced-motion no se anima.
const PIEZAS = 18;

export default function Celebracion() {
  return (
    <div className="celebracion" aria-hidden="true">
      {Array.from({ length: PIEZAS }, (_, i) => (
        <span key={i} className={`confeti confeti-${i % 4}`} style={{ "--x": `${(i * 37) % 100}%`, "--retraso": `${(i % 6) * 0.12}s` }} />
      ))}
    </div>
  );
}
