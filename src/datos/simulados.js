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
    motivo: "Sofía trabaja con datos, y a Nadia le interesa la analítica. Puede orientarla sobre cómo aplicar Google Analytics en un trabajo real.",
  },
];

export const BORRADORES_SIMULADOS = {
  javier: {
    mensaje_presentacion:
      "Hola, Javier y Nadia. Os presento porque creo que tenéis mucho de qué hablar. Nadia termina ADE y quiere dar sus primeros pasos en marketing; analizó las redes de una cooperativa para su trabajo de fin de grado. Javier, tú llevas un equipo de marketing y sé que te gusta ayudar a quien empieza. ¿Os apetece un café de 20 minutos estas semanas?",
    ficha_para_junior: {
      sobre_la_persona: "Javier es responsable de marketing en una empresa mediana. Le interesan las campañas digitales y la gente que empieza.",
      preguntas_sugeridas: [
        "¿Qué hace de verdad alguien en su primer año en un equipo como el tuyo?",
        "¿Qué buscáis cuando contratáis a alguien en prácticas?",
        "¿Hay alguien más con quien creas que debería hablar?",
      ],
      que_evitar: ["Pedirle trabajo directamente en el primer café.", "Llegar sin haber mirado qué hace su empresa."],
    },
    ficha_para_senior: {
      sobre_la_persona: "Nadia termina ADE con beca y quiere entrar en marketing. Le interesa el análisis de redes sociales y está aprendiendo Google Analytics.",
      en_que_puede_ayudar: "Contarle cómo es el día a día de un equipo de marketing y qué se valora en unas prácticas.",
    },
  },
  sofia: {
    mensaje_presentacion:
      "Hola, Sofía y Nadia. Os presento porque compartís el interés por los datos. Nadia termina ADE, quiere entrar en marketing y está aprendiendo Google Analytics. Sofía, tú eres analista de datos y sabes cómo se usan en el día a día. ¿Os apetece un café de 20 minutos?",
    ficha_para_junior: {
      sobre_la_persona: "Sofía es analista de datos en una consultora. Le interesan los datos y la visualización.",
      preguntas_sugeridas: [
        "¿Qué herramientas de datos usas cada semana?",
        "¿Cómo se mide si una campaña ha funcionado?",
        "¿Qué me recomendarías aprender después de Google Analytics?",
      ],
      que_evitar: ["Pedirle trabajo directamente en el primer café.", "Quedarte en lo teórico: lleva un ejemplo tuyo."],
    },
    ficha_para_senior: {
      sobre_la_persona: "Nadia termina ADE con beca y quiere entrar en marketing. Analizó las redes de una cooperativa y está aprendiendo Google Analytics.",
      en_que_puede_ayudar: "Orientarla sobre cómo se usan los datos en un trabajo real de marketing.",
    },
  },
};
