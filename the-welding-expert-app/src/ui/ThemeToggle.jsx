import { useEffect, useState } from "react";
import styled from "styled-components";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";

const ToggleContainer = styled.button`
  background: ${(props) => (props.$isDark ? "#1e1b4b" : "#e0f2fe")};
  border: 1px solid ${(props) => (props.$isDark ? "#312e81" : "#bae6fd")};
  width: 8.8rem;
  height: 3.2rem;
  border-radius: 9999px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.8rem;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: ${(props) => (props.$isDark ? "#4338ca" : "#7dd3fc")};
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }
`;

const ToggleHandle = styled.div`
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background: ${(props) => (props.$isDark ? "linear-gradient(135deg, #e2e8f0, #94a3b8)" : "linear-gradient(135deg, #facc15, #f59e0b)")};
  position: absolute;
  top: 0.2rem;
  left: ${(props) => (props.$isDark ? "5.8rem" : "0.2rem")};
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;

  & svg {
    width: 1.4rem;
    height: 1.4rem;
    transform: rotate(${(props) => (props.$isDark ? "360deg" : "0deg")});
    transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const ToggleLabel = styled.span`
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 1;
  transform: translateY(0.5px);

  color: ${(props) => (props.$active ? (props.$isDark ? "#ffffff" : "#0369a1") : (props.$isDark ? "#4338ca" : "#93c5fd"))};
`;

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark-mode");
  });

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);

    // Add transitioning class to trigger 1.5s melting-snow cross dissolve transitions
    document.documentElement.classList.add("theme-transitioning");

    if (nextDark) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }

    // Snappy transitions are restored immediately after the 1.5s transition concludes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 1500);
  }

  // Ensure that state is in sync with documentElement updates
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isCurrentlyDark = document.documentElement.classList.contains("dark-mode");
      if (isCurrentlyDark !== isDark) {
        setIsDark(isCurrentlyDark);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [isDark]);

  return (
    <ToggleContainer
      onClick={toggleTheme}
      $isDark={isDark}
      aria-label={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}
      title={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}>
      <ToggleLabel $isDark={isDark} $active={!isDark}>Açık</ToggleLabel>
      <ToggleLabel $isDark={isDark} $active={isDark}>Koyu</ToggleLabel>
      <ToggleHandle $isDark={isDark}>
        {isDark ? <HiOutlineMoon /> : <HiOutlineSun />}
      </ToggleHandle>
    </ToggleContainer>
  );
}

export default ThemeToggle;
