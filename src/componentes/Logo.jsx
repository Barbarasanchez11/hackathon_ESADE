// La palabra «relevo» con un testigo de carrera de relevos.
export default function Logo() {
  return (
    <span className="logo">
      <svg className="logo-testigo" viewBox="0 0 48 24" aria-hidden="true" focusable="false">
        <rect x="2" y="6" width="40" height="12" rx="6" transform="rotate(-12 24 12)" />
        <line x1="14" y1="6" x2="17" y2="18" />
        <line x1="26" y1="4" x2="29" y2="16" />
      </svg>
      relevo
    </span>
  );
}
