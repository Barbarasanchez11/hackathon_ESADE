import { useCallback, useEffect, useState } from "react";
import { reiniciarDemo, suscribirModo } from "./api.js";
import BarraInferior from "./componentes/BarraInferior.jsx";
import Cabecera from "./componentes/Cabecera.jsx";
import Bienvenida from "./pantallas/Bienvenida.jsx";
import Cafe from "./pantallas/Cafe.jsx";
import ComoFunciona from "./pantallas/ComoFunciona.jsx";
import Huella from "./pantallas/Huella.jsx";
import Inicio from "./pantallas/Inicio.jsx";
import MiCadena from "./pantallas/MiCadena.jsx";
import Presentar from "./pantallas/Presentar.jsx";

function leerTema() {
  try {
    return localStorage.getItem("relevo-tema") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export default function App() {
  const [pantalla, setPantalla] = useState("bienvenida");
  const [tema, setTema] = useState(leerTema);
  const [simulado, setSimulado] = useState(false);
  const [enCurso, setEnCurso] = useState(false);
  // Pasos de la demo completados: presentacion, cafe, relevo.
  const [hechos, setHechos] = useState(() => new Set());
  // Cambiar la clave vuelve a montar la pantalla desde cero (al reiniciar la demo).
  const [version, setVersion] = useState(0);

  useEffect(() => suscribirModo(setSimulado), []);

  const alCambiarEnCurso = useCallback((v) => setEnCurso(v), []);
  const completar = useCallback((id) => setHechos((h) => new Set(h).add(id)), []);

  function cambiarTema() {
    const nuevo = tema === "dark" ? "light" : "dark";
    setTema(nuevo);
    try {
      localStorage.setItem("relevo-tema", nuevo);
    } catch {
      // Sin almacenamiento, el tema solo dura esta sesión.
    }
  }

  function ir(destino) {
    if (destino === pantalla) return;
    if (enCurso && !window.confirm("Tienes una propuesta sin decidir. Si sales, se perderán los cambios. ¿Salir igualmente?")) return;
    setEnCurso(false);
    setPantalla(destino);
  }

  async function reiniciar() {
    if (!window.confirm("¿Reiniciar la demo? Lucía vuelve a 4 presentaciones y se borra lo que hayas hecho.")) return;
    await reiniciarDemo();
    setEnCurso(false);
    setHechos(new Set());
    setPantalla("inicio");
    setVersion((v) => v + 1);
  }

  const comunes = { onEnCurso: alCambiarEnCurso, onIr: ir };
  let contenido;
  switch (pantalla) {
    case "presentar":
      contenido = (
        <Presentar
          {...comunes}
          junior={{ id: "lucia", nombre: "Lucía" }}
          presentador={{ id: "marta", nombre: "Marta" }}
          buscaInicial="Entrar en marketing: primeras prácticas y aprender analítica de campañas."
          onEnviada={() => completar("presentacion")}
          onSalir={() => ir("inicio")}
          siguiente={{ texto: "Ir al café con Javier", onClick: () => ir("cafe") }}
        />
      );
      break;
    case "cafe":
      contenido = <Cafe {...comunes} onCompletado={() => completar("cafe")} />;
      break;
    case "huella":
      contenido = <Huella {...comunes} />;
      break;
    case "cadena":
      contenido = <MiCadena {...comunes} onCompletado={() => completar("relevo")} />;
      break;
    case "como":
      contenido = <ComoFunciona {...comunes} />;
      break;
    default:
      contenido = <Inicio {...comunes} hechos={hechos} />;
  }

  return (
    <div className={`app-shell ${tema}`}>
      <div className="phone">
        {pantalla === "bienvenida" ? (
          <div className="screen-scroll">
            <Bienvenida tema={tema} onCambiarTema={cambiarTema} onEmpezar={() => setPantalla("inicio")} />
          </div>
        ) : (
          <>
            <Cabecera
              onVolver={pantalla !== "inicio" ? () => ir("inicio") : undefined}
              onComoFunciona={() => ir("como")}
              tema={tema}
              onCambiarTema={cambiarTema}
              onReiniciar={reiniciar}
            />
            <div className="screen-scroll" key={`${pantalla}-${version}`}>
              {contenido}
            </div>
            <BarraInferior pantalla={pantalla} onIr={ir} />
            {simulado && (
              <p className="offline-pill" role="status">
                <span aria-hidden="true" /> Modo demo sin conexión
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
