import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from agents import espejo
from main import app

TEXTO = "Lucía: Me he preparado tres preguntas, si te parece.\nJavier: Claro."
SALIDA = espejo.EspejoSalida(
    bien=["Llevabas preguntas preparadas."],
    a_mejorar=["Cuenta antes tu proyecto."],
    evidencias=[
        espejo.Evidencia(skill="Preparación", evidencia="Preparó la conversación.", cita="Me he preparado tres preguntas"),
        espejo.Evidencia(skill="Inventada", evidencia="No está en el texto.", cita="Esto nunca se dijo"),
    ],
    siguiente_paso="Escribe a Carmen.",
)
ENTRADA = {"origen": "notas", "texto": TEXTO, "junior": "Lucía", "senior": "Javier"}


@pytest.fixture
def cliente(monkeypatch):
    espejo.HUELLA.clear()
    llamadas = []

    def falso(entrada):
        llamadas.append(entrada)
        return SALIDA

    monkeypatch.setattr(espejo, "llamar_modelo", falso)
    c = TestClient(app)
    c.llamadas = llamadas
    return c


def test_audio_sin_consentimiento_da_400(cliente):
    r = cliente.post("/api/espejo", json={**ENTRADA, "origen": "audio", "consentimiento_junior": True})
    assert r.status_code == 400
    assert cliente.llamadas == []


def test_aprobar_publica_en_la_huella_y_borra_la_transcripcion(cliente):
    r = cliente.post("/api/espejo", json=ENTRADA)
    assert r.status_code == 200
    thread_id, propuesta = r.json()["thread_id"], r.json()["propuesta"]
    assert [e["skill"] for e in propuesta["evidencias"]] == ["Preparación"]
    assert cliente.get("/api/huella/Lucía").json() == {}

    r = cliente.post(f"/api/espejo/{thread_id}/decision", json={"accion": "aprobar", "aprobado_por": "Javier"})
    assert r.json()["estado"] == "aprobado"
    huella = cliente.get("/api/huella/Lucía").json()
    assert huella["Preparación"][0]["confirmada_por"] == "Javier"

    # La transcripción no aparece en ningún punto de control del grafo.
    config = {"configurable": {"thread_id": thread_id}}
    for punto in espejo.grafo.get_state_history(config):
        assert "Javier: Claro" not in str(punto.values)


def test_solo_la_senior_puede_decidir(cliente):
    thread_id = cliente.post("/api/espejo", json=ENTRADA).json()["thread_id"]
    r = cliente.post(f"/api/espejo/{thread_id}/decision", json={"accion": "aprobar", "aprobado_por": "Marta"})
    assert r.status_code == 403
    assert cliente.get("/api/huella/Lucía").json() == {}


def test_si_el_modelo_falla_no_queda_nada_guardado(cliente, monkeypatch):
    def falla(entrada):
        raise espejo.EspejoError("caído")

    monkeypatch.setattr(espejo, "llamar_modelo", falla)
    antes = len(espejo.grafo.checkpointer.storage)
    r = cliente.post("/api/espejo", json=ENTRADA)
    assert r.status_code == 502
    assert len(espejo.grafo.checkpointer.storage) == antes


def test_aprobar_con_edicion_usa_la_version_corregida(cliente):
    thread_id = cliente.post("/api/espejo", json=ENTRADA).json()["thread_id"]
    editada = {**SALIDA.model_dump(), "evidencias": [], "siguiente_paso": "Termina el curso."}
    r = cliente.post(f"/api/espejo/{thread_id}/decision",
                     json={"accion": "aprobar", "aprobado_por": "Javier", "propuesta_editada": editada})
    assert r.json()["feedback"]["siguiente_paso"] == "Termina el curso."
    assert cliente.get("/api/huella/Lucía").json() == {}


def test_descartar_no_toca_la_huella(cliente):
    thread_id = cliente.post("/api/espejo", json=ENTRADA).json()["thread_id"]
    r = cliente.post(f"/api/espejo/{thread_id}/decision", json={"accion": "descartar", "aprobado_por": "Javier"})
    assert r.json() == {"estado": "descartado", "feedback": None}
    assert cliente.get("/api/huella/Lucía").json() == {}


def test_no_se_puede_decidir_dos_veces(cliente):
    thread_id = cliente.post("/api/espejo", json=ENTRADA).json()["thread_id"]
    cliente.post(f"/api/espejo/{thread_id}/decision", json={"accion": "aprobar", "aprobado_por": "Javier"})
    r = cliente.post(f"/api/espejo/{thread_id}/decision", json={"accion": "aprobar", "aprobado_por": "Javier"})
    assert r.status_code == 404


def test_salida_no_valida_reintenta_una_vez(monkeypatch):
    llamadas = []

    def falla(entrada):
        llamadas.append(1)
        raise ValidationError.from_exception_data("EspejoSalida", [])

    monkeypatch.setattr(espejo, "llamar_modelo", falla)
    with pytest.raises(espejo.EspejoError):
        espejo.generar_feedback(espejo.EspejoEntrada(**ENTRADA))
    assert len(llamadas) == 2
