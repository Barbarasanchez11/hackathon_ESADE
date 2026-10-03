# Relevo

Red profesional que se hereda en cadena. El spec completo está en docs/SPEC.md: léelo antes de tocar código.

## Comandos
- Frontend: `npm run dev` (puerto 5173)
- Backend: `cd backend && uvicorn main:app --reload --port 8000`

## Principios que no se negocian
- La IA propone, el humano decide: ningún agente envía ni presenta sin aprobación.
- Sin perfiles, rankings ni puntuaciones de personas.
- Consentimiento explícito antes de grabar o procesar audio.
- Si el backend falla, el frontend usa datos simulados: la demo nunca puede romperse.

## Estructura
- `src/`: frontend.
- `backend/agents/`: agentes del producto (Preparador, Espejo, Conector, Guardián), uno por fichero, con LangGraph.
- `backend/prompts/`: un prompt por agente (`<nombre>.md`).
- `docs/`: SPEC.md (fuente de verdad) y DEMO.md (guion del pitch).

## Convenciones
- Textos de la interfaz en español, tuteo, tono directo. Botones con verbo de acción.
- Cada agente del producto: salida validada con Pydantic, nodo de aprobación humana antes de cualquier efecto, endpoint `/api/<nombre>` y fallback simulado en `src/api.js`.
- Commit después de cada paso que funcione.
