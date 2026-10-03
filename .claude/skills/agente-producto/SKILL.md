---
name: agente-producto
description: Cómo construir o modificar un agente del producto Relevo (Preparador, Espejo, Conector, Guardián) en el backend con LangGraph.
---

Cada agente es un grafo de LangGraph en backend/agents/<nombre>.py con:
1. Un nodo que llama al modelo con un prompt en backend/prompts/<nombre>.md.
2. Salida validada con un modelo de Pydantic; si no valida, reintenta una vez.
3. Un nodo de aprobación humana antes de cualquier efecto (enviar, presentar).
4. Un endpoint en FastAPI en /api/<nombre> y un fallback simulado en src/api.js.

La entrada, la salida JSON y quién aprueba cada agente están en docs/SPEC.md, sección 5. Respétalos.

Nunca: decidir por una persona, puntuar a nadie, guardar audio sin consentimiento.
