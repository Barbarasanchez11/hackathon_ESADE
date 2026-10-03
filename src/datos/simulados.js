// Respuesta simulada del Espejo para el café de ejemplo. Se usa si el backend no responde.
export const PROPUESTA_SIMULADA = {
  bien: [
    "Llegaste con tres preguntas preparadas y las usaste para guiar la conversación.",
    "Explicaste con datos tu análisis de la cooperativa: de 300 a 1.200 seguidores en cuatro meses.",
    "Cerraste pidiendo a quién más deberías conocer, y conseguiste el contacto de Lucía.",
  ],
  a_mejorar: [
    "Empieza por tu proyecto de la cooperativa: es lo más interesante que contaste y llegó al final.",
    "No le quites valor a lo que has hecho: tu trabajo de fin de grado cuenta como experiencia.",
  ],
  evidencias: [
    {
      skill: "Análisis de datos",
      evidencia: "Midió qué tipo de publicación funcionaba comparando el alcance mes a mes.",
      cita: "Comparé el alcance de cada tipo de publicación mes a mes.",
    },
    {
      skill: "Preparación",
      evidencia: "Preparó la conversación con preguntas concretas.",
      cita: "Me he preparado tres preguntas, si te parece.",
    },
    {
      skill: "Iniciativa",
      evidencia: "Aprende analítica por su cuenta, fuera de la carrera.",
      cita: "Yo estoy haciendo un curso de Google Analytics por mi cuenta.",
    },
  ],
  siguiente_paso: "Termina el último módulo del curso de Google Analytics y escribe a Lucía cuando Javier te presente.",
};

// Respuestas simuladas del Conector y del Preparador para la red de ejemplo.
export const PRESENTADOR_SIMULADO = "Marta";

export const PROPUESTAS_SIMULADAS = [
  {
    presentador: "marta",
    persona_a_presentar: "javier",
    presentador_nombre: "Marta",
    persona_nombre: "Javier",
    motivo: "Javier dirige un equipo de marketing y le interesan las prácticas. Puede contarle a Nadia cómo es el primer año en el sector.",
  },
  {
    presentador: "marta",
    persona_a_presentar: "sofia",
    presentador_nombre: "Marta",
    persona_nombre: "Sofía",
    motivo: "Sofía trabaja con datos, y a Nadia le interesa la analítica. Puede contarle cómo se trabaja con datos y visualización en el día a día.",
  },
];

// Solo usan lo que cada persona comparte en backend/datos/red.json.
export const BORRADORES_SIMULADOS = {
  javier: {
    mensaje_presentacion:
      "Hola, Javier y Nadia. Os presento porque creo que tenéis mucho de qué hablar. Nadia está en el último curso de ADE con beca y busca sus primeras prácticas en marketing; le interesa el análisis de redes sociales y está aprendiendo Google Analytics. Javier, tú llevas el marketing de una empresa mediana y te interesan las prácticas. ¿Os apetece un café de 20 minutos estas semanas?",
    ficha_para_junior: {
      sobre_la_persona: "Javier es responsable de marketing en una empresa mediana. Le interesan las campañas digitales, los equipos de marketing y las prácticas.",
      preguntas_sugeridas: [
        "¿Qué hace de verdad alguien en su primer año en un equipo como el tuyo?",
        "¿Qué buscáis cuando contratáis a alguien en prácticas?",
        "¿Hay alguien más con quien creas que debería hablar?",
      ],
      que_evitar: ["Pedirle trabajo directamente en el primer café.", "Llegar sin haber mirado qué hace su empresa."],
    },
    ficha_para_senior: {
      sobre_la_persona: "Nadia está en el último curso de ADE con beca y busca sus primeras prácticas en marketing. Le interesa el análisis de redes sociales y está aprendiendo Google Analytics.",
      en_que_puede_ayudar: "Contarle cómo es el día a día de un equipo de marketing y qué se valora en unas prácticas.",
    },
  },
  sofia: {
    mensaje_presentacion:
      "Hola, Sofía y Nadia. Os presento porque compartís el interés por los datos. Nadia está en el último curso de ADE con beca, busca sus primeras prácticas en marketing y está aprendiendo Google Analytics. Sofía, tú eres analista de datos en una consultora. ¿Os apetece un café de 20 minutos?",
    ficha_para_junior: {
      sobre_la_persona: "Sofía es analista de datos en una consultora. Le interesan los datos y la visualización.",
      preguntas_sugeridas: [
        "¿Cómo es un día normal de una analista de datos?",
        "¿Qué herramientas de datos y visualización usas cada semana?",
        "¿Qué me recomendarías aprender para trabajar con datos?",
      ],
      que_evitar: ["Pedirle trabajo directamente en el primer café.", "Quedarte en lo teórico: lleva un ejemplo de algo que hayas analizado."],
    },
    ficha_para_senior: {
      sobre_la_persona: "Nadia está en el último curso de ADE con beca y busca sus primeras prácticas en marketing. Le interesa el análisis de redes sociales y está aprendiendo Google Analytics.",
      en_que_puede_ayudar: "Contarle cómo se trabaja con datos y visualización en el día a día.",
    },
  },
};
