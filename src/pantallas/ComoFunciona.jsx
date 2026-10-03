import Boton from "../componentes/Boton.jsx";
import Icono from "../componentes/Icono.jsx";
import Titulo from "../componentes/Titulo.jsx";

// El proceso completo: quién hace qué, dónde propone la IA y quién decide.
const ETAPAS = [
  {
    titulo: "Relevo busca en la red de Marta",
    texto: "El Conector propone personas que Marta ya conoce y que encajan con lo que busca Lucía.",
    ia: "Conector",
    guardian: true,
    decide: "Marta elige a quién presentar",
  },
  {
    titulo: "Marta presenta a Lucía y a Javier",
    texto: "El Preparador redacta el mensaje y una ficha para cada uno. Lucía no escribe a nadie.",
    ia: "Preparador",
    guardian: true,
    decide: "Marta revisa, edita y aprueba",
  },
  {
    titulo: "Lucía y Javier toman un café",
    texto: "Si los dos dan su consentimiento, se usa la transcripción; si no, las notas de Lucía.",
    decide: "Los dos dan su consentimiento",
  },
  {
    titulo: "El Espejo convierte el café en aprendizaje",
    texto: "Propone qué salió bien, qué mejorar y evidencias con cita literal. Sin notas ni emociones.",
    ia: "Espejo",
    guardian: true,
    decide: "Javier corrige y aprueba",
  },
  {
    titulo: "Las evidencias entran en su huella",
    texto: "Solo lo que Javier ha confirmado. Es la quinta presentación de Lucía: completa su cadena.",
  },
  {
    titulo: "Lucía pasa el relevo a Iker",
    texto: "Ahora es ella quien presenta. Relevo le propone personas de su red para Iker.",
    ia: "Conector + Preparador",
    guardian: true,
    decide: "Lucía decide y aprueba",
  },
  {
    titulo: "Iker empieza su cadena",
    texto: "Cuando reciba sus cinco presentaciones, él también pasará el relevo. Así crece la red.",
  },
];

export default function ComoFunciona({ onIr }) {
  return (
    <main className="screen">
      <div className="title-block">
        <p className="kicker">Sin cajas negras</p>
        <Titulo>Cómo funciona</Titulo>
        <p>La IA propone. Una persona decide. Siempre. Y el Guardián revisa cada propuesta para que no invente datos ni puntúe a nadie.</p>
      </div>
      <ol className="timeline">
        {ETAPAS.map((e, i) => (
          <li key={e.titulo} className="timeline-item">
            <span className="timeline-node" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h2>{e.titulo}</h2>
              <p>{e.texto}</p>
              {(e.ia || e.decide) && (
                <ul className="decision-tags">
                  {e.ia && (
                    <li className="tag-ia">
                      <Icono nombre="chispa" tamano={13} /> IA propone: {e.ia}
                    </li>
                  )}
                  {e.guardian && (
                    <li className="tag-ia">
                      <Icono nombre="escudo" tamano={13} /> Revisa: Guardián
                    </li>
                  )}
                  {e.decide && (
                    <li className="tag-decide">
                      <Icono nombre="check" tamano={13} /> Decide: {e.decide}
                    </li>
                  )}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="human-note">
        <Icono nombre="escudo" tamano={22} />
        <p>
          <b>Nada sale solo.</b> Puedes editar, aprobar o descartar cualquier propuesta.
        </p>
      </div>
      <Boton icono="flecha" onClick={() => onIr("inicio")}>
        Volver al inicio
      </Boton>
    </main>
  );
}
