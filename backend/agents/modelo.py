"""Llamada al modelo común a todos los agentes del producto (Groq)."""

import json
import os
from pathlib import Path
from typing import Callable, Optional, TypeVar

import groq
from pydantic import BaseModel, ValidationError

# GPT-OSS 120B admite salida JSON con esquema estricto en Groq. Se puede cambiar con GROQ_MODEL.
MODELO = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
CARPETA_PROMPTS = Path(__file__).parent.parent / "prompts"

T = TypeVar("T", bound=BaseModel)

_cliente: Optional[groq.Groq] = None


class AgenteError(Exception):
    pass


class AprobadorNoValido(AgenteError):
    pass


def cargar_prompt(nombre: str) -> str:
    return (CARPETA_PROMPTS / f"{nombre}.md").read_text(encoding="utf-8")


def esquema_estricto(esquema: type[BaseModel]) -> dict:
    """JSON Schema de Pydantic adaptado al modo estricto de Groq: sin $ref, sin títulos y sin campos extra."""
    original = esquema.model_json_schema()
    definiciones = original.pop("$defs", {})

    def limpiar(nodo):
        if isinstance(nodo, dict):
            if "$ref" in nodo:
                return limpiar(definiciones[nodo["$ref"].split("/")[-1]])
            nodo = {k: limpiar(v) for k, v in nodo.items() if k != "title"}
            if nodo.get("type") == "object":
                nodo["additionalProperties"] = False
                nodo["required"] = list(nodo.get("properties", {}))
            return nodo
        if isinstance(nodo, list):
            return [limpiar(x) for x in nodo]
        return nodo

    return limpiar(original)


def parse(system: str, contenido: str, esquema: type[T]) -> Optional[T]:
    global _cliente
    try:
        if _cliente is None:
            _cliente = groq.Groq()  # Lee GROQ_API_KEY del entorno.
        respuesta = _cliente.chat.completions.create(
            model=MODELO,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": contenido}],
            response_format={
                "type": "json_schema",
                "json_schema": {"name": esquema.__name__, "strict": True, "schema": esquema_estricto(esquema)},
            },
        )
    except groq.GroqError as e:
        raise AgenteError("No se ha podido conectar con el modelo.") from e
    eleccion = respuesta.choices[0]
    if eleccion.finish_reason == "length" or not eleccion.message.content:
        return None
    try:
        return esquema.model_validate(json.loads(eleccion.message.content))
    except json.JSONDecodeError:
        return None


def generar_validado(llamada: Callable[[], Optional[T]], error: str) -> T:
    """Ejecuta la llamada; si la salida no valida, reintenta una vez."""
    for _ in range(2):
        try:
            salida = llamada()
        except ValidationError:
            continue
        if salida is not None:
            return salida
    raise AgenteError(error)
