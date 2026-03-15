import { Button } from "react-bootstrap";
import { useTheme } from "../theme/useTheme.jsx";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button variant="outline-light" size="sm" onClick={toggleTheme} className="theme-toggle">
      {isDark ? "Light Mode ☀" : "Dark Mode 🌙"}
    </Button>
  );
}

export default ThemeToggle;
