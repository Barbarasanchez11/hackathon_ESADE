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
// Solo usan lo que cada persona comparte en backend/datos/red.json.
export const PROPUESTAS_SIMULADAS = [
  {
    junior: "nadia",
    presentador: "marta",
    persona_a_presentar: "javier",
    motivo: "Javier dirige un equipo de marketing y le interesan las prácticas. Puede contarle a Nadia cómo es el primer año en el sector.",
  },
  {
    junior: "nadia",
    presentador: "marta",
    persona_a_presentar: "sofia",
    motivo: "Sofía trabaja con datos, y a Nadia le interesa la analítica. Puede contarle cómo se trabaja con datos y visualización en el día a día.",
  },
  {
    junior: "iker",
    presentador: "nadia",
    persona_a_presentar: "javier",
    motivo: "Javier lleva campañas digitales y le interesan las prácticas. A Iker le interesan las redes sociales y busca sus primeras prácticas.",
  },
  {
    junior: "iker",
    presentador: "nadia",
    persona_a_presentar: "marta",
    motivo: "Marta trabaja en product marketing y le gusta ayudar a quien empieza. Puede contarle a Iker cómo se lanza un producto.",
  },
];

export const BORRADORES_SIMULADOS = {
  "nadia-javier": {
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
  "nadia-sofia": {
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
  "iker-javier": {
    mensaje_presentacion:
      "Hola, Javier e Iker. Os presento porque creo que os vais a entender. Iker estudia FP de marketing digital, le interesan las redes sociales y busca sus primeras prácticas. Javier, tú llevas el marketing de una empresa mediana y te interesan las campañas digitales y las prácticas. ¿Os apetece un café de 20 minutos?",
    ficha_para_junior: {
      sobre_la_persona: "Javier es responsable de marketing en una empresa mediana. Le interesan las campañas digitales, los equipos de marketing y las prácticas.",
      preguntas_sugeridas: [
        "¿Qué papel tienen las redes sociales en vuestras campañas?",
        "¿Qué buscáis en alguien que viene de FP?",
        "¿Cómo es el primer mes de unas prácticas en tu equipo?",
      ],
      que_evitar: ["Pedirle trabajo directamente en el primer café.", "Llegar sin haber mirado qué hace su empresa."],
    },
    ficha_para_senior: {
      sobre_la_persona: "Iker estudia FP de marketing digital. Le interesan las redes sociales y busca sus primeras prácticas.",
      en_que_puede_ayudar: "Contarle cómo se trabajan las campañas digitales en un equipo de marketing y qué se valora en unas prácticas.",
    },
  },
  "iker-marta": {
    mensaje_presentacion:
      "Hola, Marta e Iker. Os presento porque creo que tenéis mucho de qué hablar. Iker estudia FP de marketing digital, le interesan las redes sociales y busca sus primeras prácticas. Marta, tú trabajas en product marketing en una startup y te gusta ayudar a quien empieza. ¿Os apetece un café de 20 minutos?",
    ficha_para_junior: {
      sobre_la_persona: "Marta trabaja en product marketing en una startup. Le interesan los lanzamientos de producto y ayudar a quien empieza.",
      preguntas_sugeridas: [
        "¿Cómo se prepara el lanzamiento de un producto?",
        "¿Qué hace alguien de marketing en una startup que no haría en una empresa grande?",
        "¿Qué me recomendarías aprender este año?",
      ],
      que_evitar: ["Pedirle trabajo directamente en el primer café.", "Quedarte callado: lleva tus preguntas apuntadas."],
    },
    ficha_para_senior: {
      sobre_la_persona: "Iker estudia FP de marketing digital. Le interesan las redes sociales y busca sus primeras prácticas.",
      en_que_puede_ayudar: "Contarle cómo es el marketing en una startup y cómo se lanza un producto.",
    },
  },
};
