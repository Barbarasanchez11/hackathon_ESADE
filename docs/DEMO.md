# Guion de la demo (90 s)

> Basado en docs/SPEC.md. Los nombres y datos de ejemplo están marcados como **[EJEMPLO]** hasta que se cierren los datos de Nadia (SPEC, sección 2).

## Reparto
- **Nadia:** primera generación universitaria, sin red heredada. [EJEMPLO] 21 años, último curso de ADE con beca, quiere entrar en marketing.
- **Marta, su relevo:** [EJEMPLO] quien presenta a Nadia. Ya pasó por la cadena.
- **Javier, la persona senior:** [EJEMPLO] responsable de marketing en una empresa mediana; tiene el café con Nadia.

## Qué es real y qué simulado
- **Real:** el Espejo, que genera feedback de verdad a partir de la transcripción, y su paso de aprobación.
- **Real con datos de ejemplo:** el Conector y el Preparador, sobre una red de ejemplo.
- **Simulado:** el resto de pantallas y la cadena completa.

## Guion

| Tiempo | Pantalla | Qué se dice |
|---|---|---|
| 0–12 s | Portada con los dos datos | «Con un contacto interno tienes 6,7 veces más probabilidades de que te contraten. Pero el 61% de la Gen Z no construye red porque le da miedo pedir». |
| 12–22 s | Nadia | «Nadia no tiene a quién pedir. "No me falta talento, me falta alguien que me abra la primera puerta"». |
| 22–40 s | Paso 1 «Presentar a Nadia» (vista de Marta): propuestas del Conector, borrador del Preparador y «Aprobar y enviar» | «Nadia no escribe a nadie. Relevo propone a Marta presentarla a Javier y le redacta el mensaje. Marta lo revisa y lo aprueba. Sin su aprobación, no sale nada». |
| 40–65 s | Paso 2 «El café»: consentimiento de audio → propuesta del Espejo → Javier corrige una línea y aprueba → evidencia en la huella | «Tras el café, el Espejo convierte la conversación en feedback. Javier lo corrige antes de que llegue a Nadia. Lo que confirma entra en su huella: evidencias, no notas». |
| 65–78 s | Paso 3 «Pasar el relevo» (vista de Nadia): cadena 5 de 5, celebración y «Pasar el relevo a Iker» | «Tras cinco presentaciones, Nadia pasa el relevo a alguien que va un paso por detrás. Quien recibe, devuelve: así crece la red». |
| 78–90 s | Los tres principios y el logo | «La IA propone, el humano decide. Sin rankings ni puntuaciones. Relevo: la red que no heredaste, te la pasan». |

## Preparación
- [ ] Pulsar «Reiniciar demo» antes de empezar: Nadia vuelve a 4 presentaciones.
- [ ] Red de ejemplo cargada: Nadia, Marta, Javier y la siguiente persona de la cadena.
- [ ] Nadia con 4 presentaciones previas, para que el café sea la quinta.
- [ ] Transcripción del café grabada de antemano: el Espejo trabaja sobre ella y no sobre audio en directo.
- [ ] Una línea del feedback preparada para que Javier la corrija en directo.
- [ ] Ensayo cronometrado: dos pasadas por debajo de 90 s.

## Plan B
- **El backend falla:** el frontend usa datos simulados (`src/api.js`) y el flujo sigue igual.
- **El modelo tarda:** salida del Espejo pregrabada para el mismo café.
- **Falla el portátil o la red:** vídeo de la demo grabado y listo para reproducir.
