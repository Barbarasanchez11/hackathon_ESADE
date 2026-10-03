# Relevo — Especificación

> Fuente de verdad del producto. Si algo del código contradice este documento, manda este documento.
> Base: docs/fase-entender.pdf (tendencias, competencia e insights, 3 oct 2026).
>
> Leyenda: lo que no lleva marca sale de la fase Entender.
> **[PENDIENTE]** = falta decidir. Todo lo demás está validado por el equipo (3 oct 2026).

## 1. Problema y reto

La IA ha devaluado la candidatura y ha encarecido la confianza. La recomendación humana vuelve a ser la vía principal para entrar, justo cuando la Gen Z menos sabe usarla. Además, desaparecen los puestos de entrada, que era donde se aprendía y se hacía red.

La demanda existe y la oferta también: la mayoría de millennials y Gen X ayudaría a alguien que empieza. Falta un puente que elimine el «pedir favores».

**Tres datos clave**
1. Los candidatos con un contacto interno tienen **6,7 veces más** probabilidades de ser contratados (Clever CV, Axios, HC Mag).
2. El **61%** de la Gen Z no construye red por miedo a molestar, a ser juzgado o a parecer poco auténtico; el 71% dice que nadie le enseñó (HC Mag / LinkedIn).
3. En España, el **21,8%** de los jóvenes consiguió su primer empleo por contactos personales o familiares, por delante de los portales de empleo (17,8%) (Infobae).

Dato de apoyo: en las ocupaciones más expuestas a la IA, las ofertas de nivel inicial bajaron del 29% al 10% entre 2021 y 2026 (Indeed Hiring Lab).

**Hueco que ningún competidor cubre** (LinkedIn, Handshake, ADPList, redes sociales): todos obligan al joven a dar el primer paso hacia un desconocido. Ninguno organiza presentaciones cálidas, da feedback después del contacto, tiene un mecanismo de reciprocidad ni prioriza a quien no hereda red.

## 2. User-persona: Lucía

**Lucía · 23 años · Primeros pasos profesionales.** Segmento 1: **sin red heredada** (primera generación universitaria, FP, becas).

- **Objetivo:** acceder a su primera oportunidad profesional y construir una red propia.
- **Frustración:** sabe que los contactos importan, pero no tiene una red heredada y le incomoda pedir ayuda a desconocidos.
- **Comportamiento:** busca oportunidades y consejo online y observa perfiles profesionales, pero rara vez inicia conversaciones.
- **Pensamiento:** «¿Por qué iba esta persona a responderme a mí?».
- **Necesidad profunda:** sentirse legitimada y segura al acceder a personas que puedan ayudarla a avanzar.
- **Insight clave:** «No me falta talento. Me falta alguien que me abra la primera puerta».

Lo que Relevo cambia para ella: no tiene que escribir a nadie en frío. La red le llega a través de su relevo, que la presenta con su propia credibilidad; eso responde a su «¿por qué iba a responderme?» y a su necesidad de sentirse legitimada.

Del análisis de segmentos (fase Entender), que se mantiene:
- **Jobs:** conseguir unas primeras prácticas o empleo en su sector; entender cómo funciona ese mundo por dentro.
- **Gains:** que alguien con credibilidad responda por ella; saber qué decir y qué no; avanzar sin sentirse en deuda.

Estudia el último curso de ADE con beca y quiere entrar en marketing.

Segmento secundario: emprendedora en fase inicial («si no llegas presentada, no existes»), que cubre a los emprendedores que pide el briefing. Fuera del foco de la demo.

## 3. Concepto

Relevo convierte la presentación de confianza en el centro de la experiencia, y hace que quien la recibe la devuelva.

- **Cadena de relevos:** cada contacto llega como una presentación de alguien que conoce a las dos personas. La red llega a Lucía a través de su relevo; ella nunca escribe en frío. Las cadenas las inician empresas o instituciones con impacto social, con prioridad de acceso para quien no tiene red heredada.
- **Regla de cinco presentaciones:** quien recibe cinco presentaciones pasa el relevo y presenta a la siguiente persona. Es el motor de crecimiento de la red (reciprocidad), y permite avanzar sin sentirse en deuda. Confirmado por el equipo: cinco.
- **Senior relativo:** el senior no tiene que ser alguien con mucha experiencia, sino alguien que va solo un paso por delante. Lo sugiere el insight «consejo de alguien solo un paso por delante». Lucía, tras sus cinco presentaciones, ya es senior relativa para quien viene detrás.

**Quién inicia las cadenas:** empresas que apuestan por acompañar y dar oportunidades a nuevo talento. Abierto a cualquiera que cumpla ese compromiso, no a una sola institución.

## 4. Flujos de usuario

Formato: el usuario hace → el sistema hace → resultado.

### 4.1 Recibir una presentación
- **El usuario hace:** Lucía indica qué busca (sector, tipo de primer paso). Su relevo, la persona que la presenta, ve una posible conexión.
- **El sistema hace:** el Conector propone a quién presentar a Lucía dentro de la cadena. El Preparador redacta la presentación y una ficha para que Lucía sepa con quién va a hablar y qué preguntar.
- **Resultado:** el relevo revisa la propuesta y la aprueba, edita o descarta. Solo si la aprueba se envía. Lucía recibe la presentación sin haber pedido nada.

### 4.2 El café con feedback
- **El usuario hace:** Lucía tiene la conversación con la persona senior. Si las dos dan su consentimiento, se graba el audio; si no, Lucía escribe unas notas.
- **El sistema hace:** el Espejo genera feedback concreto sobre la conversación: qué salió bien, qué mejorar y evidencias de skills.
- **Resultado:** la persona senior revisa y corrige el feedback antes de que llegue a Lucía. Las evidencias aprobadas se suman a la huella de Lucía.

### 4.3 Pasar el relevo
- **El usuario hace:** Lucía llega a cinco presentaciones recibidas.
- **El sistema hace:** Relevo le avisa de que ya puede pasar el relevo, y el Conector le propone a alguien que va un paso por detrás.
- **Resultado:** Lucía decide si presenta y a quién. La cadena crece.

## 5. Agentes del producto

Para cada agente: entrada, salida (JSON), quién aprueba y qué no puede hacer nunca. Todos siguen la skill agente-producto.

Papel y salidas validados por el equipo el 3 oct 2026.

### 5.1 Preparador
Prepara la presentación y a las dos personas para la conversación.
- **Entrada:** perfiles de las dos personas (lo que cada una ha decidido compartir) y el motivo de la presentación.
- **Salida:**
  ```json
  {
    "mensaje_presentacion": "string",
    "ficha_para_junior": { "sobre_la_persona": "string", "preguntas_sugeridas": ["string"], "que_evitar": ["string"] },
    "ficha_para_senior": { "sobre_la_persona": "string", "en_que_puede_ayudar": "string" }
  }
  ```
- **Aprueba:** el relevo, la persona que presenta, antes de enviar el mensaje.
- **Nunca:** enviar la presentación por su cuenta; inventar datos de nadie.

### 5.2 Espejo
Convierte cada conversación en aprendizaje.
- **Entrada:** transcripción del audio (solo con consentimiento de las dos personas) o notas de Lucía.
- **Salida:**
  ```json
  {
    "bien": ["string"],
    "a_mejorar": ["string"],
    "evidencias": [{ "skill": "string", "evidencia": "string", "cita": "string" }],
    "siguiente_paso": "string"
  }
  ```
- **Aprueba:** la persona senior, que corrige el feedback antes de que llegue a Lucía.
- **Nunca:** puntuar a la persona ni dar una nota; procesar audio sin consentimiento; conservar el audio después de transcribirlo.

### 5.3 Conector
Propone quién puede presentar a quién dentro de la cadena.
- **Entrada:** lo que busca la persona y la red de la cadena (quién conoce a quién).
- **Salida:**
  ```json
  {
    "propuestas": [{ "presentador": "id", "persona_a_presentar": "id", "motivo": "string" }]
  }
  ```
- **Aprueba:** el presentador, que decide si hace la presentación.
- **Nunca:** ordenar personas por valía ni mostrar porcentajes de encaje. La lista se basa en motivos, no en puntuaciones; dar prioridad a quien no tiene red heredada es una regla de acceso, no una nota.

### 5.4 Guardián
Revisa lo que escriben el Conector, el Preparador y el Espejo antes de que lo vea nadie. Nunca modifica el contenido.
- **Entrada:** el texto generado y sus fuentes (lo que comparte cada persona, lo que busca la junior, el motivo del Conector o la transcripción del café).
- **Cómo revisa:**
  1. Reglas fijas, siempre activas: notas, porcentajes, rankings, correos y teléfonos.
  2. Revisión con el modelo: afirmaciones sobre personas que no salen de las fuentes.
- **Qué hace con lo que encuentra:**
  - Si hay problemas, el agente rehace su respuesta una vez con la corrección.
  - Si siguen, la persona que aprueba ve los avisos («El Guardián te pide que revises esto»).
  - Si el Guardián no puede revisar, lo dice («Sin revisar»), en vez de dar el texto por bueno.
  - En los textos que editan las personas aplica solo las reglas fijas, y una puntuación bloquea el envío (400).
- **Salida:**
  ```json
  { "avisos": [{ "tipo": "dato_inventado | puntuacion | dato_sensible | sin_revision", "fragmento": "string", "detalle": "string" }] }
  ```
- **Nunca:** modificar el contenido por su cuenta; dejar pasar nada sin aprobación humana.

## 6. Evaluación de skills

Huella de evidencias: cada skill se respalda con evidencias concretas de conversaciones reales (qué skill, qué pasó, quién lo confirmó y cuándo). Sin ranking ni puntuación global.

Formato de una evidencia: `{ skill, evidencia, cita, confirmada_por, fecha }`. Solo entra en la huella si la persona senior la ha confirmado. Se muestra como una lista de evidencias agrupadas por skill, nunca como nota, barra o porcentaje.

## 7. Restricciones

- La IA nunca envía ni presenta nada sin aprobación humana.
- Consentimiento explícito de las dos personas para grabar o procesar audio.
- Nada de puntuar personas para contratación: ni rankings, ni notas, ni porcentajes de encaje.
- Cada persona decide qué datos comparte en la cadena.
- Cumplimiento de la Ley de IA y del RGPD: ver la sección 10.

## 8. Fuera de alcance (hackathon)

- Autenticación real.
- Pagos.
- App móvil.

## 9. Criterios de éxito de la demo

- [ ] Lucía recibe una presentación sin haber escrito a nadie, y se ve el paso de aprobación del relevo.
- [ ] El Espejo genera feedback real de un café de ejemplo, y la persona senior lo corrige antes de que llegue a Lucía.
- [ ] Se ve la huella de evidencias, sin ninguna puntuación.
- [ ] Lucía llega a cinco presentaciones y pasa el relevo.
- [ ] La demo funciona aunque el backend esté caído (datos simulados).

## Preguntas abiertas
- [PENDIENTE] Sin autenticación, la huella (`GET /api/huella/{persona}`) es visible para cualquiera y se identifica por el nombre. Aceptable para la demo, no para un piloto.
- [PENDIENTE] Sin autenticación, la interfaz rellena quién decide (el presentador, la senior). El backend comprueba el nombre, pero no puede saber quién ha pulsado el botón.
- Persona principal: segmento 1 (sin red heredada), Lucía. Decidido.
- ¿Podemos hacer entrevistas rápidas en el hackathon para validar el miedo a pedir?

## 10. Cumplimiento: Ley de IA y RGPD

> Análisis de encaje para el producto, no asesoramiento jurídico. Estado a 3 oct 2026.

### Clasificación según la Ley de IA
- **Relevo no es un sistema de selección de personal.** El Anexo III, punto 4 (empleo), considera de alto riesgo los sistemas para contratar o seleccionar: anuncios dirigidos, filtrado de candidaturas o evaluación de candidatos. Relevo facilita presentaciones entre personas para que hagan red. No decide ni filtra candidaturas, y ninguna empresa lo usa para evaluar a nadie.
- **Línea roja de diseño:** si la huella o las propuestas se ofrecieran a empleadores para seleccionar o comparar personas, Relevo pasaría a ser de alto riesgo. Además, al haber elaboración de perfiles, no podría acogerse a la excepción del art. 6.3. Por eso:
  - La huella es de la persona y no se comparte con reclutadores.
  - No hay rankings ni puntuaciones (§7).
  - Las evidencias las confirma una persona.
- **Calendario:** el Omnibus digital sobre IA (en vigor desde el 27 jul 2026) retrasa las obligaciones de alto riesgo del Anexo III al 2 dic 2027. Las prohibiciones del art. 5 se aplican desde el 2 feb 2025 y la transparencia del art. 50 desde el 2 ago 2026.

### Ley de IA: requisito → cómo lo cumple Relevo
| Requisito | Cómo lo cumple Relevo | Estado |
|---|---|---|
| Art. 5.1.f: prohibido reconocer emociones en el trabajo y en centros educativos | El Espejo trabaja solo con texto (transcripción o notas), nunca con la voz. El prompt le prohíbe deducir emociones, estados de ánimo o personalidad, y el Guardián lo marca si aparece. | Hecho |
| Art. 50: transparencia con las personas | Toda propuesta se muestra como «generada con IA», y la vista «¿Cómo funciona?» explica qué hace cada agente. | Hecho |
| Supervisión humana (buena práctica alineada con el art. 14) | Ningún agente envía nada: quien presenta o la persona senior aprueba, edita o descarta cada propuesta. | Hecho |
| Art. 4: alfabetización en IA | Guía breve para relevos y seniors (qué hace la IA, cómo revisar una propuesta). | Pendiente |

### RGPD: requisito → cómo lo cumple Relevo
| Requisito | Cómo lo cumple Relevo | Estado |
|---|---|---|
| Base jurídica (art. 6.1.a) | Consentimiento: cada persona decide qué comparte. El audio necesita el consentimiento explícito de las dos personas. | Hecho (demo) |
| Minimización (art. 5.1.c) | Al modelo solo llega `comparte`. La transcripción no se guarda tras generar la propuesta. El audio nunca se almacena. | Hecho |
| Decisiones automatizadas (art. 22) | No hay ninguna: todo efecto lo aprueba una persona. | Hecho |
| Categorías especiales (art. 9) | Los prompts las prohíben y el Guardián las señala. | Hecho |
| Derechos de acceso y supresión (arts. 15 y 17) | `GET /api/huella/{persona}` y `DELETE /api/huella/{persona}`. Falta exponer la supresión en la interfaz. | Parcial |
| Transferencias internacionales (cap. V) | Groq procesa en EE. UU. Su DPA incorpora las SCC de la UE. Hay que aceptar el DPA y activar *zero data retention* en la consola de Groq. | Pendiente (configuración) |
| Información (art. 13) | Aviso de privacidad claro antes del primer uso. | Pendiente |
| Evaluación de impacto (art. 35) | Probablemente obligatoria antes de un piloto: se evalúan aspectos personales de gente joven con tecnología nueva. | Pendiente (antes del piloto) |
| Seguridad (art. 32) | Sin autenticación en la demo (§8). Imprescindible antes de un piloto. | Pendiente (piloto) |

Fuentes: Ley de IA (Reglamento UE 2024/1689) y Omnibus digital sobre IA; RGPD (Reglamento UE 2016/679); documentación legal de GroqCloud (DPA y «Your Data in GroqCloud»).

