import pytest

from agents import guardian


@pytest.fixture(autouse=True)
def guardian_sin_problemas(monkeypatch):
    """Por defecto el Guardián no encuentra nada; los tests del Guardián lo cambian."""
    monkeypatch.setattr(guardian, "llamar_modelo", lambda texto, fuentes: guardian.GuardianSalida(problemas=[]))
