import { useState } from "react";
import Boton from "../componentes/Boton.jsx";
import Icono from "../componentes/Icono.jsx";

const TARJETAS = [
  { n: "01", emoji: "🤝", titulo: "Alguien te abre la puerta", texto: "Tu relevo te presenta. Tú no tienes que escribir a desconocidos.", color: "violet" },
  { n: "02", emoji: "☕", titulo: "Cada café te hace crecer", texto: "Recibes feedback útil, revisado por la persona que habló contigo.", color: "pink" },
  { n: "03", emoji: "✨", titulo: "Luego lo pasas tú", texto: "Tras cinco presentaciones, abres la puerta a quien viene detrás.", color: "lime" },
];

export default function Bienvenida({ onEmpezar, tema, onCambiarTema }) {
  const [i, setI] = useState(0);
  const t = TARJETAS[i];
  return (
    <main className="welcome">
      <div className="welcome-top">
        <p className="brand">
          <span className="brand-mark">
            <Icono nombre="testigo" tamano={20} />
          </span>
          relevo
        </p>
        <button type="button" className="icon-btn" aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"} onClick={onCambiarTema}>
          <Icono nombre={tema === "dark" ? "sol" : "luna"} tamano={19} />
        </button>
      </div>
      <div className="hero-copy">
        <p className="kicker">Tu primera puerta</p>
        <h1>
          La red que no heredaste, <em>te la pasan.</em>
        </h1>
        <p>No te falta talento. Te falta alguien que te abra la primera puerta.</p>
      </div>
      <section className="carousel" aria-roledescription="carrusel" aria-label="Cómo funciona Relevo">
        <p className="solo-lector" aria-live="polite">
          Tarjeta {i + 1} de 3: {t.titulo}
        </p>
        <article key={t.n} className={`intro-card intro-${t.color}`}>
          <span className="card-number">
            {t.n} <span className="solo-lector">de 03</span>
          </span>
          <span className="card-emoji" aria-hidden="true">
            {t.emoji}
          </span>
          <h2>{t.titulo}</h2>
          <p>{t.texto}</p>
        </article>
        <div className="carousel-controls">
          <button type="button" aria-label="Tarjeta anterior" onClick={() => setI((i + 2) % 3)}>
            <Icono nombre="flechaIzq" tamano={18} />
          </button>
          <div className="dots">
            {TARJETAS.map((x, n) => (
              <button key={x.n} type="button" aria-label={`Ver tarjeta ${n + 1}`} aria-current={n === i} onClick={() => setI(n)} />
            ))}
          </div>
          <button type="button" aria-label="Tarjeta siguiente" onClick={() => setI((i + 1) % 3)}>
            <Icono nombre="flecha" tamano={18} />
          </button>
        </div>
      </section>
      <Boton icono="flecha" onClick={onEmpezar}>
        Empezar
      </Boton>
    </main>
  );
}
