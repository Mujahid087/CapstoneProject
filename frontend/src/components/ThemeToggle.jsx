import { useTheme } from "../theme/useTheme.jsx";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-icon theme-toggle-icon-sun" aria-hidden="true">☀</span>
        <span className="theme-toggle-thumb" />
        <span className="theme-toggle-icon theme-toggle-icon-moon" aria-hidden="true">🌙</span>
      </span>
      <span className="theme-toggle-label">{isDark ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}

export default ThemeToggle;
