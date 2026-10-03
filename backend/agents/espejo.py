"""Agente Espejo: convierte un café en feedback que la persona senior aprueba (SPEC §5.2)."""

import re
import uuid
from datetime import date
from pathlib import Path
from typing import Literal, Optional, TypedDict

import anthropic
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from pydantic import BaseModel, ValidationError

MODELO = "claude-sonnet-5-5"
PROMPT = (Path(__file__).parent.parent / "prompts" / "espejo.md").read_text(encoding="utf-8")


class EspejoEntrada(BaseModel):
    origen: Literal["audio", "notas"]
    texto: str
    junior: str
    senior: str
    consentimiento_junior: bool = False
    consentimiento_senior: bool = False


class Evidencia(BaseModel):
    skill: str
    evidencia: str
    cita: str


# Sin campos numéricos: el Espejo no puede devolver una nota.
class EspejoSalida(BaseModel):
    bien: list[str]
    a_mejorar: list[str]
    evidencias: list[Evidencia]
    siguiente_paso: str


class Decision(BaseModel):
    accion: Literal["aprobar", "descartar"]
    aprobado_por: str
    propuesta_editada: Optional[EspejoSalida] = None


class EspejoError(Exception):
    pass


class SinConsentimiento(EspejoError):
    pass


class Estado(TypedDict, total=False):
    entrada: dict
    propuesta: dict
    feedback: dict
    estado: str


# Huella de evidencias en memoria: persona -> lista de evidencias confirmadas.
HUELLA: dict[str, list[dict]] = {}

_cliente: Optional[anthropic.Anthropic] = None


def consentimiento_ok(entrada: EspejoEntrada) -> bool:
    if entrada.origen == "notas":
        return True
    return entrada.consentimiento_junior and entrada.consentimiento_senior


def _normalizar(texto: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[\"'«»“”]", "", texto)).strip().lower()


def quitar_citas_no_literales(salida: EspejoSalida, texto: str) -> EspejoSalida:
    """Una evidencia solo vale si su cita aparece tal cual en la transcripción."""
    fuente = _normalizar(texto)
    evidencias = [e for e in salida.evidencias if _normalizar(e.cita) and _normalizar(e.cita) in fuente]
    return salida.model_copy(update={"evidencias": evidencias})


def llamar_modelo(entrada: EspejoEntrada) -> Optional[EspejoSalida]:
    global _cliente
    if _cliente is None:
        _cliente = anthropic.Anthropic()
    respuesta = _cliente.beta.messages.parse(
        model=MODELO,
        max_tokens=16000,
        system=PROMPT,
        messages=[{
            "role": "user",
            "content": (
                f"Persona junior: {entrada.junior}\nPersona senior: {entrada.senior}\n\n"
                f"<transcripcion>\n{entrada.texto}\n</transcripcion>"
            ),
        }],
        output_format=EspejoSalida,
        output_config={"effort": "medium"},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )
    if respuesta.stop_reason == "refusal":
        raise EspejoError("El modelo no ha podido procesar esta conversación.")
    return respuesta.parsed_output


def generar_feedback(entrada: EspejoEntrada) -> EspejoSalida:
    """Llama al modelo; si la salida no valida, reintenta una vez."""
    for _ in range(2):
        try:
            salida = llamar_modelo(entrada)
        except ValidationError:
            continue
        if salida is not None:
            return quitar_citas_no_literales(salida, entrada.texto)
    raise EspejoError("El Espejo no ha devuelto un feedback válido.")


# --- Nodos del grafo ---

def comprobar_consentimiento(estado: Estado) -> Estado:
    if not consentimiento_ok(EspejoEntrada(**estado["entrada"])):
        raise SinConsentimiento("Falta el consentimiento de las dos personas para usar el audio.")
    return {}


def generar(estado: Estado) -> Estado:
    entrada = EspejoEntrada(**estado["entrada"])
    propuesta = generar_feedback(entrada)
    # La transcripción no se conserva una vez generada la propuesta.
    return {"propuesta": propuesta.model_dump(), "entrada": {**estado["entrada"], "texto": ""}, "estado": "pendiente"}


def aprobacion_senior(estado: Estado) -> Command:
    decision = Decision(**interrupt({"propuesta": estado["propuesta"]}))
    if decision.accion == "descartar":
        return Command(goto=END, update={"estado": "descartado"})
    final = decision.propuesta_editada or EspejoSalida(**estado["propuesta"])
    return Command(goto="publicar", update={"feedback": {**final.model_dump(), "aprobado_por": decision.aprobado_por}})


def publicar(estado: Estado) -> Estado:
    feedback = estado["feedback"]
    persona = estado["entrada"]["junior"].lower()
    hoy = date.today().isoformat()
    HUELLA.setdefault(persona, []).extend(
        {**e, "confirmada_por": feedback["aprobado_por"], "fecha": hoy} for e in feedback["evidencias"]
    )
    return {"estado": "aprobado"}


def _construir_grafo():
    g = StateGraph(Estado)
    g.add_node("comprobar_consentimiento", comprobar_consentimiento)
    g.add_node("generar", generar)
    g.add_node("aprobacion_senior", aprobacion_senior, destinations=("publicar", END))
    g.add_node("publicar", publicar)
    g.add_edge(START, "comprobar_consentimiento")
    g.add_edge("comprobar_consentimiento", "generar")
    g.add_edge("generar", "aprobacion_senior")
    g.add_edge("publicar", END)
    return g.compile(checkpointer=InMemorySaver())


grafo = _construir_grafo()


# --- API del agente ---

def iniciar(entrada: EspejoEntrada) -> tuple[str, dict]:
    if not consentimiento_ok(entrada):
        raise SinConsentimiento("Falta el consentimiento de las dos personas para usar el audio.")
    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}
    grafo.invoke({"entrada": entrada.model_dump()}, config)
    return thread_id, grafo.get_state(config).values["propuesta"]


def decidir(thread_id: str, decision: Decision) -> dict:
    config = {"configurable": {"thread_id": thread_id}}
    if grafo.get_state(config).next != ("aprobacion_senior",):
        raise KeyError(thread_id)
    grafo.invoke(Command(resume=decision.model_dump()), config)
    valores = grafo.get_state(config).values
    return {"estado": valores["estado"], "feedback": valores.get("feedback")}


def huella(persona: str) -> dict[str, list[dict]]:
    agrupada: dict[str, list[dict]] = {}
    for e in HUELLA.get(persona.lower(), []):
        agrupada.setdefault(e["skill"], []).append(e)
    return agrupada
