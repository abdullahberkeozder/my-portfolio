import { useEffect, useRef } from "react";
import styled from "styled-components";

import appNavItems from "./appNavItems";
import useActiveSection, { getSectionId } from "./useActiveSection";

const NavShell = styled.nav`
  position: sticky;
  top: 1.2rem;
  z-index: 20;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(12px);
  overflow: hidden;
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
    props.$active ? "var(--color-brand-700)" : "var(--color-grey-700)"};
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-grey-0)"};
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-brand-200)" : "transparent"};
  font-size: 1.3rem;
  font-weight: 800;
  white-space: nowrap;

  @media (max-width: 860px) {
    min-width: 12.4rem;
  }

  &:hover {
    color: var(--color-brand-700);
    background: var(--color-brand-50);
    border-color: var(--color-brand-200);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-selection);
  }
`;

function AppNav() {
  const activeId = useActiveSection(appNavItems);
  const navListRef = useRef(null);
  const activeLinkRef = useRef(null);

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
    </NavShell>
  );
}

export default AppNav;
