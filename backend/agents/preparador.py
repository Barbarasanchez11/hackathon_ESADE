"""Agente Preparador: redacta la presentación y las fichas; el relevo la aprueba antes de enviar (SPEC §5.1)."""

import json
from typing import Literal, Optional, TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from pydantic import BaseModel

import red
from agents import conector, modelo
from agents.modelo import AprobadorNoValido

PROMPT = modelo.cargar_prompt("preparador")


class PreparadorEntrada(BaseModel):
    conector_thread_id: str


class FichaJunior(BaseModel):
    sobre_la_persona: str
    preguntas_sugeridas: list[str]
    que_evitar: list[str]


class FichaSenior(BaseModel):
    sobre_la_persona: str
    en_que_puede_ayudar: str


class PreparadorSalida(BaseModel):
    mensaje_presentacion: str
    ficha_para_junior: FichaJunior
    ficha_para_senior: FichaSenior


class DecisionPreparador(BaseModel):
    accion: Literal["aprobar", "descartar"]
    aprobado_por: str
    borrador_editado: Optional[PreparadorSalida] = None


class Estado(TypedDict, total=False):
    junior: str
    presentador: str
    persona: str
    borrador: dict
    enviado: dict
    estado: str


# Cada elección del Conector se prepara una sola vez.
_USADAS: set[str] = set()


def llamar_modelo(eleccion: dict) -> Optional[PreparadorSalida]:
    datos = {
        "relevo": conector._perfil(eleccion["presentador"]),
        "junior": conector._perfil(eleccion["junior"]),
        "persona_a_presentar": conector._perfil(eleccion["persona_a_presentar"]),
        "lo_que_busca_la_junior": eleccion["busca"],
        "motivo_del_conector": eleccion["motivo"],
    }
    return modelo.parse(PROMPT, json.dumps(datos, ensure_ascii=False, indent=2), PreparadorSalida)


def aprobacion_relevo(estado: Estado) -> Command:
    decision = DecisionPreparador(**interrupt({"borrador": estado["borrador"]}))
    if decision.accion == "descartar":
        return Command(goto=END, update={"estado": "descartado"})
    final = decision.borrador_editado or PreparadorSalida(**estado["borrador"])
    return Command(goto="enviar", update={"enviado": final.model_dump()})


def enviar(estado: Estado) -> Estado:
    # Para la demo el envío se simula: queda registrada la presentación en la red.
    red.registrar_presentacion(estado["junior"], estado["persona"])
    return {"estado": "enviado"}


def _construir_grafo():
    g = StateGraph(Estado)
    g.add_node("aprobacion_relevo", aprobacion_relevo, destinations=("enviar", END))
    g.add_node("enviar", enviar)
    g.add_edge(START, "aprobacion_relevo")
    g.add_edge("enviar", END)
    return g.compile(checkpointer=InMemorySaver())


grafo = _construir_grafo()


def iniciar(entrada: PreparadorEntrada) -> tuple[str, dict]:
    if entrada.conector_thread_id in _USADAS:
        raise KeyError(entrada.conector_thread_id)
    eleccion = conector.eleccion_de(entrada.conector_thread_id)
    borrador = modelo.generar_validado(
        lambda: llamar_modelo(eleccion), "El Preparador no ha devuelto un borrador válido."
    ).model_dump()
    _USADAS.add(entrada.conector_thread_id)

    thread_id = red.nuevo_hilo()
    config = {"configurable": {"thread_id": thread_id}}
    grafo.invoke(
        {
            "junior": eleccion["junior"],
            "presentador": eleccion["presentador"],
            "persona": eleccion["persona_a_presentar"],
            "borrador": borrador,
            "estado": "pendiente",
        },
        config,
    )
    return thread_id, borrador


def decidir(thread_id: str, decision: DecisionPreparador) -> dict:
    if not red.hilo_vigente(thread_id):
        raise KeyError(thread_id)
    config = {"configurable": {"thread_id": thread_id}}
    estado = grafo.get_state(config)
    if estado.next != ("aprobacion_relevo",):
        raise KeyError(thread_id)
    if not conector.es_la_persona(decision.aprobado_por, estado.values["presentador"]):
        raise AprobadorNoValido("Solo quien presenta puede aprobar y enviar la presentación.")
    grafo.invoke(Command(resume=decision.model_dump()), config)
    valores = grafo.get_state(config).values
    # El contador de la junior no se devuelve: es suyo y quien presenta no lo necesita (SPEC §7).
    return {"estado": valores["estado"]}
