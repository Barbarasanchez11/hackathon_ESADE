import pytest
from fastapi.testclient import TestClient

import red
from agents import conector, preparador
from main import app

BORRADOR = preparador.PreparadorSalida(
    mensaje_presentacion="Hola, Javier y Nadia: os presento.",
    ficha_para_junior=preparador.FichaJunior(
        sobre_la_persona="Javier lleva marketing.", preguntas_sugeridas=["¿Qué hace alguien en su primer año?"], que_evitar=["Pedir trabajo directamente."]
    ),
    ficha_para_senior=preparador.FichaSenior(sobre_la_persona="Nadia estudia ADE.", en_que_puede_ayudar="Contarle cómo es el sector."),
)


@pytest.fixture
def cliente(monkeypatch):
    red.reiniciar()
    preparador._USADAS.clear()

    def propuestas_falsas(junior, presentador, candidatos, busca):
        return conector.ConectorSalida(propuestas=[
            conector.Propuesta(presentador="marta", persona_a_presentar="sofia", motivo="Datos."),
            conector.Propuesta(presentador="marta", persona_a_presentar="javier", motivo="Marketing."),
            conector.Propuesta(presentador="marta", persona_a_presentar="lucia", motivo="No la conoce Marta."),
            conector.Propuesta(presentador="marta", persona_a_presentar="inventada", motivo="No existe."),
        ])

    monkeypatch.setattr(conector, "llamar_modelo", propuestas_falsas)
    monkeypatch.setattr(preparador, "llamar_modelo", lambda eleccion: BORRADOR)
    return TestClient(app)


def _conector(cliente):
    return cliente.post("/api/conector", json={"junior_id": "nadia", "busca": "Prácticas de marketing"}).json()


def _elegir(cliente, eleccion="javier", por="Marta"):
    r = _conector(cliente)
    cliente.post(f"/api/conector/{r['thread_id']}/decision", json={"eleccion": eleccion, "decidido_por": por})
    return r["thread_id"]


def test_solo_conexiones_reales_y_en_orden_alfabetico(cliente):
    r = _conector(cliente)
    assert r["presentador"] == "Marta"
    assert [p["persona_nombre"] for p in r["propuestas"]] == ["Javier", "Sofía"]


def test_persona_sin_relevo_da_400(cliente):
    r = cliente.post("/api/conector", json={"junior_id": "iker", "busca": "Prácticas"})
    assert r.status_code == 400


def test_solo_decide_quien_presenta(cliente):
    thread_id = _conector(cliente)["thread_id"]
    r = cliente.post(f"/api/conector/{thread_id}/decision", json={"eleccion": "javier", "decidido_por": "Nadia"})
    assert r.status_code == 403


def test_no_se_puede_elegir_fuera_de_las_propuestas(cliente):
    thread_id = _conector(cliente)["thread_id"]
    r = cliente.post(f"/api/conector/{thread_id}/decision", json={"eleccion": "daniel", "decidido_por": "Marta"})
    assert r.status_code == 400


def test_preparador_usa_la_eleccion_del_servidor_y_aprobar_suma_una(cliente):
    conector_id = _elegir(cliente)
    r = cliente.post("/api/preparador", json={"conector_thread_id": conector_id})
    assert r.status_code == 200
    thread_id = r.json()["thread_id"]
    assert preparador.grafo.get_state({"configurable": {"thread_id": thread_id}}).values["persona"] == "javier"

    r = cliente.post(f"/api/preparador/{thread_id}/decision", json={"accion": "aprobar", "aprobado_por": "Marta"})
    assert r.json() == {"estado": "enviado", "presentaciones_recibidas": 5}
    assert red.se_conocen("nadia", "javier")


def test_descartar_no_suma(cliente):
    thread_id = cliente.post("/api/preparador", json={"conector_thread_id": _elegir(cliente)}).json()["thread_id"]
    r = cliente.post(f"/api/preparador/{thread_id}/decision", json={"accion": "descartar", "aprobado_por": "Marta"})
    assert r.json()["estado"] == "descartado"
    assert cliente.get("/api/red/nadia").json()["presentaciones_recibidas"] == 4


def test_solo_aprueba_quien_presenta(cliente):
    thread_id = cliente.post("/api/preparador", json={"conector_thread_id": _elegir(cliente)}).json()["thread_id"]
    r = cliente.post(f"/api/preparador/{thread_id}/decision", json={"accion": "aprobar", "aprobado_por": "Javier"})
    assert r.status_code == 403
    assert cliente.get("/api/red/nadia").json()["presentaciones_recibidas"] == 4


def test_sin_eleccion_no_hay_preparador(cliente):
    conector_id = _elegir(cliente, eleccion=None)
    assert cliente.post("/api/preparador", json={"conector_thread_id": conector_id}).status_code == 404


def test_cada_eleccion_se_prepara_una_vez(cliente):
    conector_id = _elegir(cliente)
    assert cliente.post("/api/preparador", json={"conector_thread_id": conector_id}).status_code == 200
    assert cliente.post("/api/preparador", json={"conector_thread_id": conector_id}).status_code == 404
