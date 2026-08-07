import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { HiOutlineCalendarDays } from "react-icons/hi2";

import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import appNavItems from "./appNavItems";
import useActiveSection, { getSectionId } from "./useActiveSection";
import { logEvent } from "../services/apiAnalytics";
import { ANALYTICS_EVENTS } from "../analytics/events";
import {
  attachLiquidGlass,
  NAVBAR_GLASS_CONFIG,
  SWITCHER_GLASS_CONFIG,
} from "../utils/liquidGlass";

const NavShell = styled.nav`
  position: sticky;
  top: ${(props) => (props.$scrolled ? "0.4rem" : "0.8rem")};
  z-index: 30;
  border: 1px solid var(--navbar-surface-border, rgba(255, 255, 255, 0.78));
  border-radius: 999px;
  padding: ${(props) =>
    props.$scrolled
      ? "0.4rem clamp(1.2rem, 2vw, 2.4rem)"
      : "clamp(0.6rem, 1vw, 1rem) clamp(1.4rem, 2.5vw, 3rem)"};
  background: var(--navbar-surface-bg, var(--color-nav-bg));
  box-shadow: var(--navbar-surface-shadow, var(--shadow-sm));
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  min-width: 0;
  transition:
    top 0.35s cubic-bezier(0.2, 0.9, 0.22, 1),
    padding 0.35s cubic-bezier(0.2, 0.9, 0.22, 1),
    box-shadow 0.35s ease,
    background 0.35s ease,
    border-color 0.35s ease;

  @media (max-width: 980px) {
    top: 0.6rem;
    padding: 0.8rem 1.6rem;
    border-radius: var(--border-radius-sm);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
`;

const SurfaceSheen = styled.span`
  position: absolute;
  top: 0;
  left: 3.5rem;
  right: 3.5rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85) 50%, transparent);
  pointer-events: none;
  z-index: 1;

  @media (max-width: 980px) {
    display: none;
  }
`;

const NavRow = styled.div`
  min-height: ${(props) => (props.$scrolled ? "4.6rem" : "clamp(5.4rem, 6vw, 6.2rem)")};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => (props.$scrolled ? "1.2rem" : "clamp(1.4rem, 2vw, 2.8rem)")};
  min-width: 0;
  transition:
    min-height 0.35s cubic-bezier(0.2, 0.9, 0.22, 1),
    gap 0.35s cubic-bezier(0.2, 0.9, 0.22, 1);

  @media (max-width: 980px) {
    gap: 0.8rem;
    min-height: 4.8rem;
  }
`;

const BrandLink = styled.a`
  min-width: 0;
  min-height: 4.4rem;
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.4rem;
  flex-shrink: 0;
  transform: ${(props) => (props.$scrolled ? "scale(0.94)" : "scale(1)")};
  transform-origin: left center;
  transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.22, 1);

  @media (max-width: 980px) {
    transform: scale(1);
  }

  @media (max-width: 300px) {
    padding-inline: 0.2rem;

    & img {
      width: 9.6rem !important;
      height: 2.4rem !important;
    }
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 1vw, 1.2rem);
  flex-shrink: 0;
`;

const AppointmentLink = styled.a`
  min-height: ${(props) => (props.$scrolled ? "4rem" : "4.4rem")};
  border: 1px solid var(--color-brand-600);
  border-radius: 999px;
  padding: ${(props) => (props.$scrolled ? "0.6rem 1.2rem" : "0.8rem 1.4rem")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: var(--color-text-inverse);
  background: var(--color-brand-600);
  font-size: ${(props) => (props.$scrolled ? "1.25rem" : "1.3rem")};
  font-weight: 800;
  opacity: ${(props) => (props.$hidden ? 0 : 1)};
  visibility: ${(props) => (props.$hidden ? "hidden" : "visible")};
  pointer-events: ${(props) => (props.$hidden ? "none" : "auto")};
  transition:
    opacity var(--motion-standard),
    visibility var(--motion-standard),
    min-height 0.35s cubic-bezier(0.2, 0.9, 0.22, 1),
    padding 0.35s cubic-bezier(0.2, 0.9, 0.22, 1),
    font-size 0.35s ease,
    background var(--motion-fast),
    border-color var(--motion-fast);

  &:hover {
    background: var(--color-brand-700);
    border-color: var(--color-brand-700);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 980px) {
    display: none;
  }
`;

function AppNav({ ...props }) {
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeId = useActiveSection(appNavItems);
  const glassShellRef = useRef(null);
  const routeLinksRef = useRef(null);
  const indicatorRef = useRef(null);
  const snapIndicatorRef = useRef(null);
  const suppressPointerClickRef = useRef(false);

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

  useEffect(() => {
    let ticking = false;
    let currentScrolled = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (!currentScrolled && y > 100) {
          currentScrolled = true;
          setIsScrolled(true);
        } else if (currentScrolled && y < 60) {
          currentScrolled = false;
          setIsScrolled(false);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const shell = glassShellRef.current;
    if (!shell) return undefined;

    const desktopQuery = window.matchMedia("(min-width: 981px)");
    let glassController = null;

    const syncGlass = () => {
      glassController?.destroy();
      glassController = desktopQuery.matches
        ? attachLiquidGlass(shell, NAVBAR_GLASS_CONFIG)
        : null;
    };

    syncGlass();
    desktopQuery.addEventListener("change", syncGlass);
    return () => {
      desktopQuery.removeEventListener("change", syncGlass);
      glassController?.destroy();
    };
  }, []);

  useEffect(() => {
    const shell = glassShellRef.current;
    const track = routeLinksRef.current;
    const indicator = indicatorRef.current;
    if (!shell || !track || !indicator) return undefined;

    const items = Array.from(track.querySelectorAll(".nav-route-link"));
    const desktopQuery = window.matchMedia("(min-width: 981px)");
    const dragThreshold = 6;
    const overshoot = 22;
    let activeIndex = Math.max(
      0,
      items.findIndex((item) => item.classList.contains("active")),
    );
    let targetIndex = activeIndex;
    let pointerId = null;
    let pressX = 0;
    let pressY = 0;
    let pressWidth = 0;
    let dragMode = false;
    let finishTimer = null;
    let clickResetTimer = null;
    let rebuildFrame = null;
    let indicatorGlass = null;

    const trackBounds = () => track.getBoundingClientRect();

    const toLocalX = (clientX) => {
      const bounds = trackBounds();
      const scale = bounds.width > 0 ? track.clientWidth / bounds.width : 1;
      return (clientX - bounds.left) * scale;
    };

    const itemMetrics = (index) => {
      const bounds = trackBounds();
      const item = items[index] || items[0];
      if (!item) return { left: 0, width: 0, center: 0 };
      const itemBounds = item.getBoundingClientRect();
      const scale = bounds.width > 0 ? track.clientWidth / bounds.width : 1;
      const left = (itemBounds.left - bounds.left) * scale;
      const width = itemBounds.width * scale;
      return { left, width, center: left + width / 2 };
    };

    const nearestIndex = (localX) => {
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      items.forEach((item, index) => {
        const distance = Math.abs(localX - itemMetrics(index).center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    };

    const setIndicator = (left, width, animate = true) => {
      if (!animate) {
        const previousTransition = indicator.style.transition;
        indicator.style.transition = "none";
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
        indicator.getBoundingClientRect();
        indicator.style.transition = previousTransition;
        return;
      }
      indicator.style.left = `${left}px`;
      indicator.style.width = `${width}px`;
    };

    const snapToIndex = (index, animate = true) => {
      if (!items[index]) return;
      const metrics = itemMetrics(index);
      setIndicator(metrics.left, metrics.width, animate);
    };

    const syncToActiveRoute = (animate = false) => {
      const nextActiveIndex = items.findIndex((item) =>
        item.classList.contains("active"),
      );
      if (nextActiveIndex >= 0) activeIndex = nextActiveIndex;
      targetIndex = activeIndex;
      snapToIndex(activeIndex, animate);
    };

    snapIndicatorRef.current = syncToActiveRoute;

    const setGlow = (clientX, clientY, alpha) => {
      const bounds = trackBounds();
      track.style.setProperty("--gx", `${toLocalX(clientX)}px`);
      track.style.setProperty("--gy", `${clientY - bounds.top}px`);
      track.style.setProperty("--ga", String(alpha));
    };

    const queueGlassRebuild = () => {
      if (rebuildFrame !== null) return;
      rebuildFrame = window.requestAnimationFrame(() => {
        rebuildFrame = null;
        indicatorGlass?.rebuild();
      });
    };

    const beginInteraction = (clientX, clientY) => {
      window.clearTimeout(finishTimer);
      indicator.classList.add("interacting");
      shell.classList.add("engaged");
      setGlow(clientX, clientY, 0.24);
      indicatorGlass?.destroy();
      indicatorGlass = attachLiquidGlass(indicator, SWITCHER_GLASS_CONFIG);
      queueGlassRebuild();
    };

    const endInteraction = () => {
      window.clearTimeout(finishTimer);
      finishTimer = window.setTimeout(() => {
        indicator.classList.remove("interacting");
        track.classList.remove("dragging");
        shell.classList.remove("engaged");
        track.style.setProperty("--ga", "0");
        indicatorGlass?.destroy();
        indicatorGlass = null;
      }, 500);
    };

    const dragIndicator = (clientX) => {
      const localX = toLocalX(clientX);
      const width = pressWidth || itemMetrics(activeIndex).width;
      const left = Math.min(
        track.clientWidth - width + overshoot,
        Math.max(-overshoot, localX - width / 2),
      );
      indicator.style.left = `${left}px`;
      indicator.style.width = `${width}px`;
      targetIndex = nearestIndex(localX);
      queueGlassRebuild();
    };

    function clearPointerHandlers() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    }

    const finishSelection = () => {
      track.classList.remove("dragging");
      activeIndex = targetIndex;
      items.forEach((item, index) => {
        item.classList.toggle("active", index === activeIndex);
      });
      snapToIndex(activeIndex, true);
      document.activeElement?.blur();
      queueGlassRebuild();
      window.setTimeout(queueGlassRebuild, 120);
      endInteraction();
      const targetHref = appNavItems[activeIndex]?.href;
      if (targetHref && window.location.hash !== targetHref) {
        window.location.hash = targetHref;
        const sectionId = targetHref.replace("#", "");
        const targetEl = document.getElementById(sectionId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    function handlePointerMove(event) {
      if (event.pointerId !== pointerId) return;
      const horizontalDistance = Math.abs(event.clientX - pressX);
      const verticalDistance = Math.abs(event.clientY - pressY);

      if (!dragMode && (horizontalDistance > dragThreshold || verticalDistance > dragThreshold)) {
        dragMode = true;
        track.classList.add("dragging");
      }

      if (dragMode) {
        event.preventDefault();
        setGlow(event.clientX, event.clientY, 0.18);
        dragIndicator(event.clientX);
      } else {
        setGlow(event.clientX, event.clientY, 0.22);
      }
    }

    function handlePointerUp(event) {
      if (event.pointerId !== pointerId) return;
      clearPointerHandlers();
      finishSelection();
      pointerId = null;
      dragMode = false;
      window.clearTimeout(clickResetTimer);
      clickResetTimer = window.setTimeout(() => {
        suppressPointerClickRef.current = false;
      }, 0);
    }

    function handlePointerCancel(event) {
      if (event.pointerId !== pointerId) return;
      clearPointerHandlers();
      track.classList.remove("dragging");
      snapToIndex(activeIndex, true);
      endInteraction();
      pointerId = null;
      dragMode = false;
      suppressPointerClickRef.current = false;
    }

    const armPointer = (index, event) => {
      if (!desktopQuery.matches || pointerId !== null) return;
      event.preventDefault();
      event.currentTarget.focus({ preventScroll: true });
      suppressPointerClickRef.current = true;
      pointerId = event.pointerId;
      dragMode = false;
      targetIndex = index;
      pressX = event.clientX;
      pressY = event.clientY;
      pressWidth = itemMetrics(index).width;
      beginInteraction(event.clientX, event.clientY);
      window.addEventListener("pointermove", handlePointerMove, { passive: false });
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerCancel);
    };

    const pointerDownHandlers = items.map((item, index) => {
      const handler = (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        armPointer(index, event);
      };
      item.addEventListener("pointerdown", handler);
      return handler;
    });

    const handleResize = () => syncToActiveRoute(false);
    syncToActiveRoute(false);
    window.addEventListener("resize", handleResize);

    return () => {
      pointerDownHandlers.forEach((handler, index) => {
        if (items[index]) items[index].removeEventListener("pointerdown", handler);
      });
      clearPointerHandlers();
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(finishTimer);
      window.clearTimeout(clickResetTimer);
      if (rebuildFrame !== null) window.cancelAnimationFrame(rebuildFrame);
      indicatorGlass?.destroy();
      snapIndicatorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const sync = () => snapIndicatorRef.current?.(false);
    const frame = window.requestAnimationFrame(sync);
    const timer1 = window.setTimeout(sync, 60);
    const timer2 = window.setTimeout(sync, 350);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, [activeId, isScrolled]);

  function handleAppointmentClick(placement) {
    logEvent(ANALYTICS_EVENTS.NAVIGATION_CTA_CLICKED, {
      cta: "appointment",
      placement,
    });
  }

  return (
    <NavShell
      aria-label="Müşteri sayfası navigasyonu"
      $scrolled={isScrolled}
      className={isScrolled ? "scrolled" : ""}
      {...props}
    >
      <SurfaceSheen aria-hidden="true" />
      <NavRow $scrolled={isScrolled}>
        <BrandLink href="#top" $scrolled={isScrolled}>
          <BrandLogo variant="compact" size={3.2} alt="Umut Usta" />
        </BrandLink>

        <div
          ref={glassShellRef}
          className="nav-glass-shell"
          data-radius="999"
        >
          <div ref={routeLinksRef} className="nav-route-links">
            <span className="nav-pointer-glow" aria-hidden="true" />
            <span
              ref={indicatorRef}
              className="nav-glass-indicator"
              data-radius="999"
              aria-hidden="true"
            />
            {appNavItems.map((item) => {
              const sectionId = getSectionId(item);
              const isActive = sectionId === activeId;
              const Icon = item.Icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`nav-route-link${isActive ? " active" : ""}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => {
                    if (suppressPointerClickRef.current) {
                      event.preventDefault();
                      suppressPointerClickRef.current = false;
                    }
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        <NavActions>
          <AppointmentLink
            href="#appointment-calendar"
            data-nav-appointment="desktop"
            $hidden={isHeroVisible}
            $scrolled={isScrolled}
            aria-hidden={isHeroVisible}
            tabIndex={isHeroVisible ? -1 : undefined}
            onClick={() => handleAppointmentClick("desktop_nav")}>
            <HiOutlineCalendarDays aria-hidden="true" />
            Randevu Al
          </AppointmentLink>
          <ThemeToggle />
        </NavActions>
      </NavRow>
    </NavShell>
  );
}

export default AppNav;
