import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";

import appNavItems from "./appNavItems";

import useActiveSection, { getSectionId } from "./useActiveSection";

const NavShell = styled.nav`
  position: sticky;
  top: 0.8rem;
  z-index: 20;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 0.8rem 1.6rem;
  background: var(--color-nav-bg);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(12px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;

  @media (max-width: 640px) {
    top: 0.4rem;
    padding: 0.6rem 1rem;
    border-radius: var(--border-radius-sm);
    gap: 1rem;
  }
`;

const NavList = styled.ul`
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scroll-snap-type: x proximity;
  overscroll-behavior-inline: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavItem = styled.li`
  flex: 1 1 0;
  min-width: 0;

  @media (max-width: 860px) {
    flex: 0 0 auto;
    scroll-snap-align: center;
  }
`;

const NavLink = styled.a`
  width: 100%;
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  padding: 0.9rem 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  color: ${(props) =>
    props.$active ? "var(--color-grey-900)" : "var(--color-grey-700)"};
  background: var(--color-grey-0);
  border: 1px solid transparent;
  box-shadow: ${(props) =>
    props.$active ? "inset 0 -3px 0 var(--color-action-primary)" : "none"};
  font-size: 1.3rem;
  font-weight: 800;
  white-space: nowrap;

  @media (max-width: 860px) {
    min-width: 12.4rem;
  }

  &:hover {
    color: var(--color-selection-strong);
    background: var(--color-selection-soft);
    border-color: var(--color-selection-border);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: ${(props) =>
      props.$active ? "var(--color-selection-strong)" : "var(--color-grey-500)"};
  }
`;

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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;

  & svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const ToggleLabel = styled.span`
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 1;
  transform: translateY(0.5px);

  color: ${(props) => (props.$active ? (props.$isDark ? "#ffffff" : "#0369a1") : (props.$isDark ? "#4338ca" : "#93c5fd"))};
`;


function AppNav() {
  const activeId = useActiveSection(appNavItems);
  const navListRef = useRef(null);
  const activeLinkRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark-mode");
  });

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }

  useEffect(() => {
    if (!window.matchMedia("(max-width: 860px)").matches) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const navList = navListRef.current;
    const activeLink = activeLinkRef.current;

    if (!navList || !activeLink) return;

    const targetScrollLeft =
      activeLink.offsetLeft - (navList.clientWidth - activeLink.offsetWidth) / 2;

    navList.scrollTo({
      left: targetScrollLeft,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeId]);

  return (
    <NavShell aria-label="Sayfa bölümleri">
      <NavList ref={navListRef}>
        {appNavItems.map((item) => {
          const sectionId = getSectionId(item);
          const isActive = sectionId === activeId;

          return (
            <NavItem key={item.href}>
              <NavLink
                href={item.href}
                ref={isActive ? activeLinkRef : null}
                $active={isActive}
                aria-current={isActive ? "location" : undefined}>
                <item.Icon />
                <span>{item.label}</span>
              </NavLink>
            </NavItem>
          );
        })}
      </NavList>
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

    </NavShell>
  );
}


export default AppNav;
