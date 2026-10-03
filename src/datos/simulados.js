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
