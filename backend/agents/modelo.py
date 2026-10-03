"""Llamada al modelo común a todos los agentes del producto."""

from pathlib import Path
from typing import Callable, Optional, TypeVar

import anthropic
from pydantic import BaseModel, ValidationError

MODELO = "claude-sonnet-5-5"
CARPETA_PROMPTS = Path(__file__).parent.parent / "prompts"

T = TypeVar("T", bound=BaseModel)

_cliente: Optional[anthropic.Anthropic] = None


class AgenteError(Exception):
    pass


class AprobadorNoValido(AgenteError):
    pass


def cargar_prompt(nombre: str) -> str:
    return (CARPETA_PROMPTS / f"{nombre}.md").read_text(encoding="utf-8")


def parse(system: str, contenido: str, esquema: type[T]) -> Optional[T]:
    global _cliente
    if _cliente is None:
        _cliente = anthropic.Anthropic()
    try:
        respuesta = _cliente.beta.messages.parse(
            model=MODELO,
            max_tokens=16000,
            system=system,
            messages=[{"role": "user", "content": contenido}],
            output_format=esquema,
            output_config={"effort": "medium"},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
    except ValidationError:
        raise
    # TypeError: el SDK lo lanza si no encuentra credenciales.
    except (anthropic.AnthropicError, TypeError) as e:
        raise AgenteError("No se ha podido conectar con el modelo.") from e
    if respuesta.stop_reason == "refusal":
        raise AgenteError("El modelo no ha podido procesar esta petición.")
    return respuesta.parsed_output


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
