from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agents import espejo

app = FastAPI(title="Relevo")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/espejo")
def crear_espejo(entrada: espejo.EspejoEntrada):
    try:
        thread_id, propuesta = espejo.iniciar(entrada)
    except espejo.SinConsentimiento as e:
        raise HTTPException(400, str(e))
    except espejo.EspejoError as e:
        raise HTTPException(502, str(e))
    return {"thread_id": thread_id, "propuesta": propuesta}


@app.post("/api/espejo/{thread_id}/decision")
def decidir_espejo(thread_id: str, decision: espejo.Decision):
    try:
        return espejo.decidir(thread_id, decision)
    except espejo.AprobadorNoValido as e:
        raise HTTPException(403, str(e))
    except KeyError:
        raise HTTPException(404, "No hay ninguna propuesta pendiente con ese identificador.")


@app.get("/api/huella/{persona}")
def ver_huella(persona: str):
    return espejo.huella(persona)
