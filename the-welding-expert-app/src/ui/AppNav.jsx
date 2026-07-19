import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  HiOutlineBars3,
  HiOutlineCalendarDays,
  HiOutlineXMark,
} from "react-icons/hi2";

import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import appNavItems from "./appNavItems";
import useActiveSection, { getSectionId } from "./useActiveSection";
import { logEvent } from "../services/apiAnalytics";
import { ANALYTICS_EVENTS } from "../analytics/events";

const NavShell = styled.nav`
  position: sticky;
  top: 0.8rem;
  z-index: 30;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 0.8rem 1rem;
  background: var(--color-nav-bg);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(16px);
`;

const NavRow = styled.div`
  min-height: 5.2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 1.6rem;

  @media (max-width: 820px) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.8rem;
  }
`;

const BrandLink = styled.a`
  min-width: 0;
  min-height: 4.4rem;
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.4rem;

  @media (max-width: 300px) {
    padding-inline: 0.2rem;

    & img {
      width: 9.6rem !important;
      height: 2.4rem !important;
    }
  }
`;

const NavList = styled.ul`
  min-width: 0;
  display: flex;
  justify-content: center;
  gap: 0.2rem;

  @media (max-width: 820px) {
    display: none;
  }
`;

const NavLink = styled.a`
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: ${(props) =>
    props.$active ? "var(--color-grey-900)" : "var(--color-grey-600)"};
  background: ${(props) =>
    props.$active ? "var(--color-selection-soft)" : "transparent"};
  font-size: 1.3rem;
  font-weight: 800;
  white-space: nowrap;

  &:hover {
    color: var(--color-selection-strong);
    background: var(--color-selection-soft);
  }

  & svg {
    width: 1.7rem;
    height: 1.7rem;
  }
`;

const NavActions = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const AppointmentLink = styled.a`
  min-height: 4.4rem;
  border: 1px solid var(--color-brand-600);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: var(--color-text-inverse);
  background: var(--color-brand-600);
  font-size: 1.3rem;
  font-weight: 800;
  opacity: ${(props) => (props.$hidden ? 0 : 1)};
  visibility: ${(props) => (props.$hidden ? "hidden" : "visible")};
  pointer-events: ${(props) => (props.$hidden ? "none" : "auto")};
  transition: opacity var(--motion-standard), visibility var(--motion-standard),
    background var(--motion-fast), border-color var(--motion-fast);

  &:hover {
    background: var(--color-brand-700);
    border-color: var(--color-brand-700);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 820px) {
    display: none;
  }
`;

const DesktopTheme = styled.div`
  display: contents;

  @media (max-width: 820px) {
    display: none;
  }
`;

const MenuButton = styled.button`
  width: 4.4rem;
  height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  display: none;
  place-items: center;
  color: var(--color-grey-800);
  background: var(--color-grey-0);

  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }

  @media (max-width: 820px) {
    display: grid;
  }
`;

const MobilePanel = styled.div`
  display: none;

  @media (max-width: 820px) {
    display: ${(props) => (props.$open ? "grid" : "none")};
    gap: 0.6rem;
    border-top: 1px solid var(--color-grey-100);
    padding: 1rem 0.4rem 0.4rem;
  }
`;

const MobileNavLink = styled(NavLink)`
  width: 100%;
  justify-content: flex-start;
  padding-inline: 1.2rem;
`;

const MobileAppointmentLink = styled(AppointmentLink)`
  display: inline-flex;
  width: 100%;
  margin-top: 0.4rem;

  @media (max-width: 820px) {
    display: inline-flex;
  }
`;

const MobileUtility = styled.div`
  display: none;

  @media (max-width: 820px) {
    min-height: 4.8rem;
    padding: 0.4rem 1.2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    color: var(--color-grey-600);
    font-size: 1.3rem;
    font-weight: 700;
  }
`;

function AppNav({ ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const activeId = useActiveSection(appNavItems);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.intersectionRatio >= 0.08),
      { threshold: 0.08 },
    );
    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  function handleAppointmentClick(placement) {
    setIsOpen(false);
    logEvent(ANALYTICS_EVENTS.NAVIGATION_CTA_CLICKED, {
      cta: "appointment",
      placement,
    });
  }

  return (
    <NavShell aria-label="Müşteri sayfası" {...props}>
      <NavRow>
        <BrandLink href="#top">
          <BrandLogo variant="compact" size={3.2} alt="Umut Usta" />
        </BrandLink>

        <NavList data-customer-nav-list="true">
          {appNavItems.map((item) => {
            const sectionId = getSectionId(item);
            const isActive = sectionId === activeId;

            return (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  $active={isActive}
                  aria-current={isActive ? "location" : undefined}>
                  <item.Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </NavList>

        <NavActions>
          <AppointmentLink
            href="#appointment-calendar"
            data-nav-appointment="desktop"
            $hidden={isHeroVisible}
            aria-hidden={isHeroVisible}
            tabIndex={isHeroVisible ? -1 : undefined}
            onClick={() => handleAppointmentClick("desktop_nav")}>
            <HiOutlineCalendarDays aria-hidden="true" />
            Randevu Al
          </AppointmentLink>
          <DesktopTheme>
            <ThemeToggle />
          </DesktopTheme>
          <MenuButton
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-customer-menu"
            aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setIsOpen((open) => !open)}>
            {isOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
          </MenuButton>
        </NavActions>
      </NavRow>

      <MobilePanel id="mobile-customer-menu" $open={isOpen}>
        {appNavItems.map((item) => {
          const sectionId = getSectionId(item);
          const isActive = sectionId === activeId;

          return (
            <MobileNavLink
              key={item.href}
              href={item.href}
              $active={isActive}
              aria-current={isActive ? "location" : undefined}
              onClick={() => setIsOpen(false)}>
              <item.Icon aria-hidden="true" />
              <span>{item.label}</span>
            </MobileNavLink>
          );
        })}
        <MobileUtility>
          <span>Görünüm</span>
          <ThemeToggle />
        </MobileUtility>
        <MobileAppointmentLink
          href="#appointment-calendar"
          onClick={() => handleAppointmentClick("mobile_menu")}>
          <HiOutlineCalendarDays aria-hidden="true" />
          Randevu Al
        </MobileAppointmentLink>
      </MobilePanel>
    </NavShell>
  );
}

export default AppNav;
