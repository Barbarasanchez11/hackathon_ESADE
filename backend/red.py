"""Red de ejemplo de la cadena, en memoria. Datos de ejemplo de la demo."""

import copy
import json
from pathlib import Path

_ORIGINAL = json.loads((Path(__file__).parent / "datos" / "red.json").read_text(encoding="utf-8"))

PERSONAS: dict[str, dict] = {}
CONEXIONES: set[frozenset[str]] = set()


def reiniciar() -> None:
    datos = copy.deepcopy(_ORIGINAL)
    PERSONAS.clear()
    PERSONAS.update({p["id"]: p for p in datos["personas"]})
    CONEXIONES.clear()
    CONEXIONES.update(frozenset(par) for par in datos["conexiones"])


def persona(id_: str) -> dict:
    return PERSONAS[id_]


def se_conocen(a: str, b: str) -> bool:
    return frozenset((a, b)) in CONEXIONES


def contactos(id_: str) -> list[str]:
    return sorted(otro for par in CONEXIONES if id_ in par for otro in par if otro != id_)


def relevos_de(junior: str) -> list[str]:
    """Quién puede presentar a la junior: sus contactos que ya han pasado por la cadena."""
    return [c for c in contactos(junior) if PERSONAS[c]["presentaciones_recibidas"] >= 5]


def candidatos(presentador: str, junior: str) -> list[str]:
    return [c for c in contactos(presentador) if c != junior and not se_conocen(c, junior)]


def registrar_presentacion(junior: str, presentada: str) -> int:
    CONEXIONES.add(frozenset((junior, presentada)))
    PERSONAS[junior]["presentaciones_recibidas"] += 1
    return PERSONAS[junior]["presentaciones_recibidas"]


reiniciar()
