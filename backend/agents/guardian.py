"""Agente Guardián: revisa lo que escriben los demás agentes antes de que lo vea nadie (SPEC §5.4).

Nunca modifica el contenido: señala problemas para que el agente lo rehaga o para que la persona que aprueba lo vea.
"""

import json
import re
from typing import Callable, Literal, Optional, TypeVar

from pydantic import BaseModel

from agents import modelo
from agents.modelo import AgenteError

PROMPT = modelo.cargar_prompt("guardian")

T = TypeVar("T")

Tipo = Literal["dato_inventado", "puntuacion", "dato_sensible", "sin_revision"]


class Problema(BaseModel):
    tipo: Tipo
    fragmento: str
    detalle: str


class GuardianSalida(BaseModel):
    problemas: list[Problema]


class GuardianBloqueo(AgenteError):
    pass


# Reglas fijas: no dependen del modelo y se aplican siempre, también a los textos que editan las personas.
REGLAS = [
    ("puntuacion", re.compile(r"\b\d+(?:[.,]\d+)?\s*(?:/|sobre|de)\s*(?:5|10|100)\b", re.I), "Parece una nota o puntuación."),
    ("puntuacion", re.compile(r"\b\d+(?:[.,]\d+)?\s*%"), "Parece un porcentaje sobre una persona o su encaje."),
    ("puntuacion", re.compile(r"\b(?:puntuaci[oó]n|ranking|nota (?:de|final)|calificaci[oó]n)\b", re.I), "Habla de puntuar o clasificar personas."),
    ("dato_sensible", re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "Contiene un correo electrónico."),
    ("dato_sensible", re.compile(r"(?:\+34\s?)?\b[6-9]\d{2}[\s.]?\d{3}[\s.]?\d{3}\b"), "Contiene un número de teléfono."),
]


def revisar_reglas(texto: str) -> list[dict]:
    problemas = []
    for tipo, patron, detalle in REGLAS:
        for m in patron.finditer(texto):
            problemas.append({"tipo": tipo, "fragmento": m.group(0), "detalle": detalle})
    return problemas


def llamar_modelo(texto: str, fuentes: str) -> Optional[GuardianSalida]:
    contenido = f"<fuentes>\n{fuentes}\n</fuentes>\n\n<texto>\n{texto}\n</texto>"
    return modelo.parse(PROMPT, contenido, GuardianSalida)


def revisar(texto: str, fuentes: str) -> list[dict]:
    """Reglas fijas más revisión del modelo. Si el modelo no responde, lo dice en vez de dar el texto por bueno."""
    problemas = revisar_reglas(texto)
    try:
        salida = modelo.generar_validado(lambda: llamar_modelo(texto, fuentes), "El Guardián no ha podido revisar el texto.")
        problemas += [p.model_dump() for p in salida.problemas if p.tipo != "sin_revision"]
    except AgenteError:
        problemas.append({
            "tipo": "sin_revision",
            "fragmento": "",
            "detalle": "El Guardián no ha podido revisar este texto. Léelo con atención antes de aprobarlo.",
        })
    return problemas


def como_correccion(problemas: list[dict]) -> str:
    lineas = [f"- «{p['fragmento']}»: {p['detalle']}" for p in problemas if p["tipo"] != "sin_revision"]
    return "El Guardián ha encontrado estos problemas en tu respuesta anterior. Corrígelos usando solo las fuentes:\n" + "\n".join(lineas)


def generar_revisado(generar: Callable[[Optional[str]], T], a_texto: Callable[[T], str], fuentes: str) -> tuple[T, list[dict]]:
    """Genera, revisa y, si hay problemas, rehace una vez con la corrección. Devuelve el resultado y los avisos que queden."""
    salida = generar(None)
    problemas = revisar(a_texto(salida), fuentes)
    if any(p["tipo"] != "sin_revision" for p in problemas):
        salida = generar(como_correccion(problemas))
        problemas = revisar(a_texto(salida), fuentes)
    return salida, problemas


def bloquear_si_puntua(texto: str) -> None:
    """Para textos editados por personas: solo las reglas fijas, y una puntuación bloquea el envío."""
    puntuaciones = [p for p in revisar_reglas(texto) if p["tipo"] == "puntuacion"]
    if puntuaciones:
        raise GuardianBloqueo(
            f"El Guardián ha bloqueado el envío: «{puntuaciones[0]['fragmento']}». {puntuaciones[0]['detalle']} "
            "Relevo no puntúa a las personas."
        )
