"""Agente Conector: propone a quién puede presentar el relevo a la persona junior (SPEC §5.3)."""

import json
import uuid
from typing import Optional, TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from pydantic import BaseModel

import red
from agents import modelo
from agents.modelo import AgenteError, AprobadorNoValido

PROMPT = modelo.cargar_prompt("conector")


class ConectorEntrada(BaseModel):
    junior_id: str
    busca: str


class Propuesta(BaseModel):
    presentador: str
    persona_a_presentar: str
    motivo: str


# Sin campos numéricos: el Conector no puede puntuar el encaje.
class ConectorSalida(BaseModel):
    propuestas: list[Propuesta]


class DecisionConector(BaseModel):
    eleccion: Optional[str] = None
    decidido_por: str


class DatosNoValidos(AgenteError):
    pass


class Estado(TypedDict, total=False):
    junior: str
    presentador: str
    busca: str
    propuestas: list[dict]
    eleccion: Optional[dict]
    estado: str


def _perfil(id_: str) -> dict:
    # Al modelo solo le llega lo que cada persona ha decidido compartir.
    p = red.persona(id_)
    return {"id": p["id"], "nombre": p["nombre"], **p["comparte"]}


def llamar_modelo(junior: str, presentador: str, candidatos: list[str], busca: str) -> Optional[ConectorSalida]:
    datos = {
        "junior": _perfil(junior),
        "busca": busca,
        "relevo": _perfil(presentador),
        "candidatos": [_perfil(c) for c in candidatos],
    }
    return modelo.parse(PROMPT, json.dumps(datos, ensure_ascii=False, indent=2), ConectorSalida)


def filtrar(salida: ConectorSalida, presentador: str, candidatos: list[str]) -> list[dict]:
    """Solo conexiones reales, sin repetir, en orden alfabético para que no parezca un ranking."""
    vistas: set[str] = set()
    propuestas = []
    for p in salida.propuestas:
        if p.presentador != presentador or p.persona_a_presentar not in candidatos or p.persona_a_presentar in vistas:
            continue
        vistas.add(p.persona_a_presentar)
        propuestas.append({
            **p.model_dump(),
            "presentador_nombre": red.persona(presentador)["nombre"],
            "persona_nombre": red.persona(p.persona_a_presentar)["nombre"],
        })
    return sorted(propuestas, key=lambda p: p["persona_nombre"])


def elegir(estado: Estado) -> Estado:
    decision = DecisionConector(**interrupt({"propuestas": estado["propuestas"]}))
    if decision.eleccion is None:
        return {"eleccion": None, "estado": "sin_presentacion"}
    eleccion = next(p for p in estado["propuestas"] if p["persona_a_presentar"] == decision.eleccion)
    return {"eleccion": {**eleccion, "junior": estado["junior"], "busca": estado["busca"]}, "estado": "elegida"}


def _construir_grafo():
    g = StateGraph(Estado)
    g.add_node("elegir", elegir)
    g.add_edge(START, "elegir")
    g.add_edge("elegir", END)
    return g.compile(checkpointer=InMemorySaver())


grafo = _construir_grafo()


def es_la_persona(texto: str, id_: str) -> bool:
    texto = texto.strip().lower()
    return texto in (id_, red.persona(id_)["nombre"].lower())


def iniciar(entrada: ConectorEntrada) -> tuple[str, dict]:
    if entrada.junior_id not in red.PERSONAS:
        raise DatosNoValidos("No conocemos a esa persona en la red.")
    if not entrada.busca.strip():
        raise DatosNoValidos("Cuéntanos qué busca la persona.")
    relevos = red.relevos_de(entrada.junior_id)
    if not relevos:
        raise DatosNoValidos("Esta persona todavía no tiene un relevo que pueda presentarla.")
    presentador = relevos[0]
    candidatos = red.candidatos(presentador, entrada.junior_id)
    salida = modelo.generar_validado(
        lambda: llamar_modelo(entrada.junior_id, presentador, candidatos, entrada.busca),
        "El Conector no ha devuelto propuestas válidas.",
    )
    propuestas = filtrar(salida, presentador, candidatos)

    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}
    grafo.invoke(
        {"junior": entrada.junior_id, "presentador": presentador, "busca": entrada.busca, "propuestas": propuestas, "estado": "pendiente"},
        config,
    )
    return thread_id, {"presentador": red.persona(presentador)["nombre"], "propuestas": propuestas}


def decidir(thread_id: str, decision: DecisionConector) -> dict:
    config = {"configurable": {"thread_id": thread_id}}
    estado = grafo.get_state(config)
    if estado.next != ("elegir",):
        raise KeyError(thread_id)
    valores = estado.values
    if not es_la_persona(decision.decidido_por, valores["presentador"]):
        raise AprobadorNoValido("Solo quien presenta puede decidir a quién presentar.")
    if decision.eleccion is not None and decision.eleccion not in {p["persona_a_presentar"] for p in valores["propuestas"]}:
        raise DatosNoValidos("Esa persona no está entre las propuestas.")
    grafo.invoke(Command(resume=decision.model_dump()), config)
    final = grafo.get_state(config).values
    return {"estado": final["estado"], "eleccion": final.get("eleccion")}


def eleccion_de(thread_id: str) -> dict:
    """La propuesta que eligió el presentador, guardada en el servidor."""
    valores = grafo.get_state({"configurable": {"thread_id": thread_id}}).values
    if valores.get("estado") != "elegida":
        raise KeyError(thread_id)
    return valores["eleccion"]
