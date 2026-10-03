"""Red de ejemplo de la cadena, en memoria. Datos de ejemplo de la demo."""

import copy
import json
import uuid
from pathlib import Path

_ORIGINAL = json.loads((Path(__file__).parent / "datos" / "red.json").read_text(encoding="utf-8"))

PERSONAS: dict[str, dict] = {}
CONEXIONES: set[frozenset[str]] = set()
# Cada reinicio de la demo abre una época nueva: los hilos de épocas anteriores dejan de valer.
EPOCA = 0


def nuevo_hilo() -> str:
    return f"{EPOCA}-{uuid.uuid4()}"


def hilo_vigente(thread_id: str) -> bool:
    return thread_id.startswith(f"{EPOCA}-")


def reiniciar() -> None:
    global EPOCA
    EPOCA += 1
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
    return [c for c in contactos(junior) if puede_pasar_relevo(c)]


def puede_pasar_relevo(id_: str) -> bool:
    return PERSONAS[id_]["presentaciones_recibidas"] >= 5


def quien_viene_detras(id_: str) -> list[str]:
    """Contactos que aún no han completado sus cinco presentaciones y a los que id_ puede presentar."""
    if not puede_pasar_relevo(id_):
        return []
    return [c for c in contactos(id_) if not puede_pasar_relevo(c)]


def candidatos(presentador: str, junior: str) -> list[str]:
    return [c for c in contactos(presentador) if c != junior and not se_conocen(c, junior)]


def registrar_presentacion(junior: str, presentada: str) -> int:
    CONEXIONES.add(frozenset((junior, presentada)))
    PERSONAS[junior]["presentaciones_recibidas"] += 1
    return PERSONAS[junior]["presentaciones_recibidas"]


reiniciar()
