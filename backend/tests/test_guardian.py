import pytest
from fastapi.testclient import TestClient

import red
from agents import conector, guardian, modelo, preparador
from main import app
from tests.test_presentacion import BORRADOR


def test_reglas_detectan_puntuaciones_y_contactos():
    tipos = [p["tipo"] for p in guardian.revisar_reglas("Le doy un 8/10, encaje del 90 %, escribe a ana@mail.com o al 612 345 678")]
    assert tipos.count("puntuacion") == 2
    assert tipos.count("dato_sensible") == 2


def test_reglas_no_saltan_con_texto_normal():
    assert guardian.revisar_reglas("Pasaron de 300 a 1.200 seguidores. ¿Un café de 20-30 minutos?") == []


def test_rehace_una_vez_con_la_correccion(monkeypatch):
    revisiones = iter([
        guardian.GuardianSalida(problemas=[guardian.Problema(tipo="dato_inventado", fragmento="trabaja", detalle="Estudia.")]),
        guardian.GuardianSalida(problemas=[]),
    ])
    monkeypatch.setattr(guardian, "llamar_modelo", lambda texto, fuentes: next(revisiones))
    correcciones = []

    def generar(correccion):
        correcciones.append(correccion)
        return "texto"

    salida, avisos = guardian.generar_revisado(generar, str, "fuentes")
    assert avisos == []
    assert correcciones[0] is None and "trabaja" in correcciones[1]


def test_si_sigue_mal_se_muestran_los_avisos(monkeypatch):
    problema = guardian.Problema(tipo="dato_inventado", fragmento="trabaja", detalle="Estudia.")
    monkeypatch.setattr(guardian, "llamar_modelo", lambda texto, fuentes: guardian.GuardianSalida(problemas=[problema]))
    llamadas = []
    _, avisos = guardian.generar_revisado(lambda c: llamadas.append(c) or "texto", str, "fuentes")
    assert len(llamadas) == 2
    assert avisos == [problema.model_dump()]


def test_si_el_guardian_falla_lo_dice(monkeypatch):
    def falla(texto, fuentes):
        raise modelo.AgenteError("caído")

    monkeypatch.setattr(guardian, "llamar_modelo", falla)
    assert [p["tipo"] for p in guardian.revisar("texto", "fuentes")] == ["sin_revision"]


@pytest.fixture
def cliente(monkeypatch):
    red.reiniciar()
    monkeypatch.setattr(
        conector,
        "llamar_modelo",
        lambda junior, presentador, candidatos, busca, correccion=None: conector.ConectorSalida(
            propuestas=[conector.Propuesta(presentador="marta", persona_a_presentar="javier", motivo="Marketing.")]
        ),
    )
    monkeypatch.setattr(preparador, "llamar_modelo", lambda eleccion, correccion=None: BORRADOR)
    return TestClient(app)


def test_la_api_devuelve_los_avisos_y_bloquea_ediciones_con_nota(cliente, monkeypatch):
    problema = guardian.Problema(tipo="dato_inventado", fragmento="Marketing.", detalle="No consta.")
    monkeypatch.setattr(guardian, "llamar_modelo", lambda texto, fuentes: guardian.GuardianSalida(problemas=[problema]))

    r = cliente.post("/api/conector", json={"junior_id": "lucia", "busca": "Prácticas"})
    assert r.json()["avisos"] == [problema.model_dump()]
    conector_id = r.json()["thread_id"]
    cliente.post(f"/api/conector/{conector_id}/decision", json={"eleccion": "javier", "decidido_por": "Marta"})
    r = cliente.post("/api/preparador", json={"conector_thread_id": conector_id})
    thread_id = r.json()["thread_id"]
    assert r.json()["avisos"] == [problema.model_dump()]

    editado = {**BORRADOR.model_dump(), "mensaje_presentacion": "Os presento: Lucía es un 9/10."}
    r = cliente.post(f"/api/preparador/{thread_id}/decision",
                     json={"accion": "aprobar", "aprobado_por": "Marta", "borrador_editado": editado})
    assert r.status_code == 400
    assert "9/10" in r.json()["detail"]
    assert red.persona("lucia")["presentaciones_recibidas"] == 4
