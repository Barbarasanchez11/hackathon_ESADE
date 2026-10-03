# Relevo

Red profesional que se hereda en cadena. El spec completo está en @docs/SPEC.md.

## Comandos
- Frontend: `npm run dev` (puerto 5173)
- Backend: `cd backend && uvicorn main:app --reload --port 8000`

## Principios que no se negocian
- La IA propone, el humano decide: ningún agente envía ni presenta sin aprobación.
- Sin perfiles, rankings ni puntuaciones de personas.
- Si el backend falla, el frontend usa datos simulados: la demo nunca puede romperse.

## Convenciones
- Textos de la interfaz en español, tono directo. Estilo: usa la skill relevo-ui.
- Agentes del producto (Preparador, Espejo, Conector, Guardián) en backend/agents/, uno por fichero. Usa la skill agente-producto.
- Los subagentes de .claude/agents/ son ayudantes de desarrollo, no agentes del producto. No mezclarlos.
- Antes de cerrar un cambio en backend/agents/, pasa el subagente revisor-ia-responsable. Antes de cerrar un cambio de interfaz, pasa revisor-ui.
