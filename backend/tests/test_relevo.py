import pytest
from fastapi.testclient import TestClient

import red
from agents import conector, espejo, preparador
from main import app
from tests.test_presentacion import BORRADOR


@pytest.fixture
def cliente(monkeypatch):
    red.reiniciar()
    preparador._USADAS.clear()

    # Propone a todos los candidatos que recibe y a alguien de fuera de la red de quien presenta.
    def propuestas(junior, presentador, candidatos, busca):
        return conector.ConectorSalida(propuestas=[
            conector.Propuesta(presentador=presentador, persona_a_presentar=c, motivo="Motivo.")
            for c in [*candidatos, "lucia"]
        ])

    monkeypatch.setattr(conector, "llamar_modelo", propuestas)
    monkeypatch.setattr(preparador, "llamar_modelo", lambda eleccion: BORRADOR)
    return TestClient(app)


def _presentar(cliente, junior, presentador, persona, por):
    r = cliente.post("/api/conector", json={"junior_id": junior, "busca": "Prácticas", "presentador_id": presentador})
    assert r.status_code == 200, r.text
    conector_id = r.json()["thread_id"]
    cliente.post(f"/api/conector/{conector_id}/decision", json={"eleccion": persona, "decidido_por": por})
    thread_id = cliente.post("/api/preparador", json={"conector_thread_id": conector_id}).json()["thread_id"]
    return cliente.post(f"/api/preparador/{thread_id}/decision", json={"accion": "aprobar", "aprobado_por": por})


def test_con_cuatro_presentaciones_aun_no_hay_relevo(cliente):
    nadia = cliente.get("/api/red/nadia").json()
    assert nadia["puede_pasar_relevo"] is False
    assert nadia["detras"] == []
    r = cliente.post("/api/conector", json={"junior_id": "iker", "busca": "Prácticas", "presentador_id": "nadia"})
    assert r.status_code == 400


def test_pasar_el_relevo_a_iker(cliente):
    assert _presentar(cliente, "nadia", "marta", "javier", "Marta").json()["presentaciones_recibidas"] == 5

    nadia = cliente.get("/api/red/nadia").json()
    assert nadia["puede_pasar_relevo"] is True
    assert [d["id"] for d in nadia["detras"]] == ["iker"]
    assert "presentaciones_recibidas" not in nadia["detras"][0]

    r = cliente.post("/api/conector", json={"junior_id": "iker", "busca": "Prácticas", "presentador_id": "nadia"})
    # Solo contactos de Nadia: Lucía no lo es.
    assert [p["persona_a_presentar"] for p in r.json()["propuestas"]] == ["javier", "marta"]

    thread_id = r.json()["thread_id"]
    r_otra = cliente.post(f"/api/conector/{thread_id}/decision", json={"eleccion": "marta", "decidido_por": "Marta"})
    assert r_otra.status_code == 403

    r = _presentar(cliente, "iker", "nadia", "marta", "Nadia")
    assert r.json() == {"estado": "enviado", "presentaciones_recibidas": 1}


def test_reiniciar_la_demo(cliente):
    _presentar(cliente, "nadia", "marta", "javier", "Marta")
    espejo.HUELLA["nadia"] = [{"skill": "x"}]
    assert cliente.post("/api/demo/reiniciar").json() == {"ok": True}
    assert cliente.get("/api/red/nadia").json()["presentaciones_recibidas"] == 4
    assert espejo.HUELLA == {}
    assert not red.se_conocen("nadia", "javier")
