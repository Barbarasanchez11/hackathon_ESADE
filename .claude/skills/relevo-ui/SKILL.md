---
name: relevo-ui
description: Guía de estilo de la interfaz de Relevo (textos, tono, componentes y accesibilidad). Úsala al crear o modificar pantallas o textos del frontend.
---

## Textos
- En español, tuteo, tono directo y cálido. Frases cortas.
- Los botones dicen la acción: "Aprobar y enviar", no "OK".
- Cuando la IA propone algo, dilo: "Propuesta de Relevo, revísala antes de enviar".
- Nunca mostrar puntuaciones, porcentajes de "encaje" ni rankings de personas.

## Aprobación humana
- Toda acción con efecto externo (enviar, presentar) muestra primero la propuesta y un botón explícito de aprobación, con opción de editar o descartar.

## Accesibilidad
- Contraste mínimo AA, foco visible y navegación con teclado.
- Etiquetas en todos los campos; texto alternativo en imágenes.

## Visual: estilo «Energía»
Pensado para gente joven. Todos los colores son tokens en `src/index.css`, redefinidos para modo oscuro; nunca escribas un color suelto en un componente.
- Paleta: fondo crema `--fondo`, tinta `--tinta`, violeta `--violeta` (acción activa, progreso), lima `--lima` (botón principal, elección), rosa y cian solo para avatares.
- Tipografía: Bricolage Grotesque para titulares y botones; DM Sans para el texto. Van empaquetadas con @fontsource para que la demo funcione sin conexión.
- Tarjetas: borde de 2px de color tinta, esquinas de 16-18px y sombra dura desplazada (`6px 6px 0`). El botón principal es lima con sombra; al pulsarlo se hunde.
- Componentes en `src/componentes/`: `Logo`, `Avatar` (el color sale solo del id, nunca de ningún valor), `CadenaProgreso` (el progreso de la propia persona, nunca una comparación), `Celebracion`, `Titulo`, `ListaEditable`.
- Animaciones cortas, siempre desactivadas con `prefers-reduced-motion`.
- Comprueba el contraste AA de cualquier color nuevo en claro y en oscuro antes de usarlo.
- En móvil (≤520px): márgenes laterales de 16px, botones a todo el ancho y nada de scroll horizontal.
