"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // To avoid the hydration mismatch between SSR and client rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggle}
      style={{ padding: "10px", fontSize: "16px" }}
    >
      {theme === "dark" ? "🌙 Dark Mode" : "🌞 Light Mode"}
    </button>
  );
};

export default ThemeToggle;
