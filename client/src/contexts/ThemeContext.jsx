import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Always start in light mode for Black Stone Interiors
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) localStorage.setItem("theme", "light");
    return savedTheme === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
