import Titulo from "./Titulo.jsx";

// El proceso completo, paso a paso: quién hace qué y dónde propone la IA y decide una persona.
const ETAPAS = [
  {
    fase: "Presentar a Nadia",
    titulo: "Relevo busca en la red de Marta",
    texto: "El Conector propone personas que Marta ya conoce y que encajan con lo que busca Nadia.",
    ia: "Conector",
    persona: "Marta elige a quién presentar",
  },
  {
    fase: "Presentar a Nadia",
    titulo: "Marta presenta a Nadia y a Javier",
    texto: "El Preparador redacta el mensaje y una ficha para cada uno. Nadia no escribe a nadie.",
    ia: "Preparador",
    persona: "Marta revisa, edita y aprueba",
  },
  {
    fase: "El café",
    titulo: "Nadia y Javier toman un café",
    texto: "Si los dos dan su consentimiento, se usa la transcripción; si no, las notas de Nadia.",
    persona: "Los dos dan su consentimiento",
  },
  {
    fase: "El café",
    titulo: "El Espejo convierte el café en aprendizaje",
    texto: "Propone qué salió bien, qué mejorar y evidencias con cita literal. Sin notas.",
    ia: "Espejo",
    persona: "Javier corrige y aprueba",
  },
  {
    fase: "El café",
    titulo: "Las evidencias entran en la huella de Nadia",
    texto: "Solo lo que Javier ha confirmado. Es la quinta presentación de Nadia: completa su cadena.",
  },
  {
    fase: "Pasar el relevo",
    titulo: "Nadia pasa el relevo a Iker",
    texto: "Ahora es ella quien presenta. Relevo le propone personas de su red para Iker.",
    ia: "Conector + Preparador",
    persona: "Nadia decide y aprueba",
  },
  {
    fase: "Y sigue",
    titulo: "Iker empieza su cadena",
    texto: "Cuando reciba sus cinco presentaciones, él también pasará el relevo. Así crece la red.",
  },
];

export default function Proceso({ onCerrar }) {
  return (
    <section className="tarjeta proceso">
      <Titulo>Cómo funciona Relevo</Titulo>
      <p className="ayuda">La IA propone, las personas deciden. Nada se envía sin que alguien lo apruebe.</p>
      <ol className="proceso-etapas">
        {ETAPAS.map((e, i) => (
          <li key={i} className="etapa">
            <span className="etapa-punto" aria-hidden="true" />
            <p className="antetitulo">{e.fase}</p>
            <h3 className="etapa-titulo">{e.titulo}</h3>
            <p className="etapa-texto">{e.texto}</p>
            {(e.ia || e.persona) && (
              <ul className="etiquetas">
                {e.ia && <li className="etiqueta etiqueta-ia">IA propone: {e.ia}</li>}
                {e.persona && <li className="etiqueta etiqueta-persona">Decide: {e.persona}</li>}
              </ul>
            )}
          </li>
        ))}
      </ol>
      <div className="acciones">
        <button type="button" className="principal" onClick={onCerrar}>
          Volver a la demo
        </button>
      </div>
    </section>
  );
}
