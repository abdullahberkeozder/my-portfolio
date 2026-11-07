import { useEffect, useState } from "react";
import styled from "styled-components";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

const THEME_TRANSITION_MS = 320;

const ToggleContainer = styled.button`
  width: 4.4rem;
  min-width: 4.4rem;
  height: 4.4rem;
  padding: 0;
  border: 1px solid var(--color-control-border);
  border-radius: var(--border-radius-sm);
  display: inline-grid;
  place-items: center;
  align-items: center;
  color: var(--color-text-muted);
  background: var(--color-control-bg);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    border-color var(--motion-base) var(--ease-standard),
    background-color var(--motion-base) var(--ease-standard);

  &:hover {
    border-color: var(--color-control-border-hover);
    color: var(--color-control-active-text);
    background: var(--color-control-active-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => (
    document.documentElement.classList.contains("dark-mode")
  ));

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.add("theme-transitioning");
    document.documentElement.classList.toggle("dark-mode", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");

    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, THEME_TRANSITION_MS);
  }

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const nextDark = document.documentElement.classList.contains("dark-mode");
      setIsDark((currentDark) => (currentDark === nextDark ? currentDark : nextDark));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ToggleContainer
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}
      title={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}>
      {isDark
        ? <HiOutlineSun aria-hidden="true" />
        : <HiOutlineMoon aria-hidden="true" />}
    </ToggleContainer>
  );
}

export default ThemeToggle;
