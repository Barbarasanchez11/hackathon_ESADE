// Iconos de línea del diseño (24×24, trazo actual). Siempre decorativos: el texto va al lado.
const RUTAS = {
  inicio: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  cadena: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  cafe: (
    <>
      <path d="M4 7h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 9h1a3 3 0 0 1 0 6h-1M7 3v2m4-2v2" />
    </>
  ),
  chispa: (
    <path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />
  ),
  flecha: <path d="M5 12h14m-6-6 6 6-6 6" />,
  flechaIzq: <path d="M19 12H5m6-6-6 6 6 6" />,
  escudo: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4" />,
  enviar: (
    <>
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </>
  ),
  editar: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12 4 4L19 6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-8h.01" />
    </>
  ),
  luna: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  testigo: (
    <>
      <path d="m7 18 10-12" />
      <path d="M5.8 14.7 9.3 18l8.9-10.7L14.7 4z" />
    </>
  ),
  reiniciar: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  mas: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
};

export default function Icono({ nombre, tamano = 20 }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {RUTAS[nombre]}
    </svg>
  );
}
