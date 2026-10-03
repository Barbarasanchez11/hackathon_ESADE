import os

from dotenv import load_dotenv

load_dotenv()

# El reinicio de la demo borra todo el estado; se puede desactivar con RELEVO_DEMO=0.
MODO_DEMO = os.getenv("RELEVO_DEMO", "1") != "0"

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import red
from agents import conector, espejo, guardian, preparador
from agents.modelo import AgenteError, AprobadorNoValido

app = FastAPI(title="Relevo")
# Orígenes permitidos: los de desarrollo más los de producción (RELEVO_ORIGENES, separados por comas).
ORIGENES = ["http://localhost:5173", "http://127.0.0.1:5173"] + [
    o.strip() for o in os.getenv("RELEVO_ORIGENES", "").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENES,
    allow_methods=["*"],
    allow_headers=["*"],
)

SIN_PENDIENTE = "No hay ninguna propuesta pendiente con ese identificador."


def _errores(funcion, *args):
    """Traduce los errores de los agentes a códigos HTTP comunes."""
    try:
        return funcion(*args)
    except (espejo.SinConsentimiento, conector.DatosNoValidos, guardian.GuardianBloqueo) as e:
        raise HTTPException(400, str(e))
    except AprobadorNoValido as e:
        raise HTTPException(403, str(e))
    except KeyError:
        raise HTTPException(404, SIN_PENDIENTE)
    except AgenteError as e:
        raise HTTPException(502, str(e))


@app.post("/api/espejo")
def crear_espejo(entrada: espejo.EspejoEntrada):
    thread_id, propuesta, avisos = _errores(espejo.iniciar, entrada)
    return {"thread_id": thread_id, "propuesta": propuesta, "avisos": avisos}


@app.post("/api/espejo/{thread_id}/decision")
def decidir_espejo(thread_id: str, decision: espejo.Decision):
    return _errores(espejo.decidir, thread_id, decision)


@app.get("/api/huella/{persona}")
def ver_huella(persona: str):
    return espejo.huella(persona)


@app.delete("/api/huella/{persona}")
def borrar_huella(persona: str):
    """Derecho de supresión (RGPD art. 17): la persona puede borrar su huella entera."""
    espejo.borrar_datos(persona)
    return {"ok": True}


@app.post("/api/conector")
def crear_conector(entrada: conector.ConectorEntrada):
    thread_id, resultado = _errores(conector.iniciar, entrada)
    return {"thread_id": thread_id, **resultado}


@app.post("/api/conector/{thread_id}/decision")
def decidir_conector(thread_id: str, decision: conector.DecisionConector):
    return _errores(conector.decidir, thread_id, decision)


@app.post("/api/preparador")
def crear_preparador(entrada: preparador.PreparadorEntrada):
    thread_id, borrador, avisos = _errores(preparador.iniciar, entrada)
    return {"thread_id": thread_id, "borrador": borrador, "avisos": avisos}


@app.post("/api/preparador/{thread_id}/decision")
def decidir_preparador(thread_id: str, decision: preparador.DecisionPreparador):
    return _errores(preparador.decidir, thread_id, decision)


@app.get("/api/red/{persona_id}")
def ver_persona(persona_id: str):
    if persona_id not in red.PERSONAS:
        raise HTTPException(404, "No conocemos a esa persona en la red.")
    p = red.persona(persona_id)
    return {
        "id": p["id"],
        "nombre": p["nombre"],
        "presentaciones_recibidas": p["presentaciones_recibidas"],
        "puede_pasar_relevo": red.puede_pasar_relevo(persona_id),
        # De quien viene detrás solo se muestra lo que ha decidido compartir.
        "detras": [
            {"id": d, "nombre": red.persona(d)["nombre"], "comparte": red.persona(d)["comparte"]}
            for d in red.quien_viene_detras(persona_id)
        ],
    }


@app.post("/api/demo/reiniciar")
def reiniciar_demo():
    """Vuelve la demo al estado inicial para poder ensayarla varias veces."""
    if not MODO_DEMO:
        raise HTTPException(404, "Not Found")
    red.reiniciar()
    espejo.HUELLA.clear()
    espejo.HILOS.clear()
    preparador._USADAS.clear()
    return {"ok": True}
