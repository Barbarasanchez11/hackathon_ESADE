# Relevo

**La red que no heredaste, te la pasan.** Red profesional que se hereda en cadena: alguien que ya te conoce (tu *relevo*) te presenta a personas de su red, aprendes de cada café con un feedback que revisa la persona con la que hablaste y, cuando recibes cinco presentaciones, pasas el relevo a quien viene detrás.

Proyecto del hackathon de ESADE. La especificación está en [`docs/SPEC.md`](docs/SPEC.md) y el guion de la demo en [`docs/DEMO.md`](docs/DEMO.md).

## Cómo funciona por dentro
- **Frontend:** React + Vite (`src/`). Si el backend no responde, pasa a un modo demo con datos de ejemplo y lo avisa.
- **Backend:** FastAPI + LangGraph (`backend/`), con cuatro agentes y aprobación humana en cada paso:
  - **Conector:** propone a quién presentar, solo entre contactos reales.
  - **Preparador:** redacta la presentación y las fichas.
  - **Espejo:** convierte el café en feedback con citas literales, sin notas ni emociones.
  - **Guardián:** revisa todo lo anterior para que no invente datos ni puntúe a nadie.
- **Modelo:** Groq (`openai/gpt-oss-120b`; el Guardián usa `gpt-oss-20b`).

## Arrancarlo en local
1. Crea `.env` en la raíz con tu clave de Groq: `GROQ_API_KEY=...` (está en `.gitignore`).
2. Backend:
   ```bash
   cd backend
   python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
   .venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
3. Frontend, en otra terminal:
   ```bash
   npm install
   npm run dev   # http://localhost:5173
   ```
4. Tests del backend: `cd backend && .venv/bin/python -m pytest`

## Despliegue
- **Solo frontend (versión demo pública, sin backend):** en Vercel, importa el repositorio y añade la variable `VITE_SOLO_DEMO=1`. La app arranca con los datos de ejemplo y lo indica en pantalla.
- **Backend en Render:** *New → Blueprint* con este repositorio (usa `render.yaml`). En el panel, añade `GROQ_API_KEY` y `RELEVO_ORIGENES` (la URL de Vercel).
- **Frontend en Vercel:** importa el repositorio (Vite, raíz del proyecto) y añade la variable `VITE_API_URL` con la URL de Render.

## Principios que no se negocian
- La IA propone, el humano decide: ningún agente envía nada sin aprobación.
- Sin perfiles, rankings ni puntuaciones de personas.
- Cumplimiento de la Ley de IA y del RGPD: ver la sección 10 de la especificación.
