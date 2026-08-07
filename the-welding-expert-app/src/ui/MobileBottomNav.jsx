import { useCallback, useEffect, useRef, useState } from "react";
import appNavItems from "./appNavItems";
import useActiveSection, { getSectionId } from "./useActiveSection";

export default function MobileBottomNav() {
  const [compact, setCompact] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const navRef = useRef(null);
  const innerRef = useRef(null);
  const linkRefs = useRef([]);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const compactRef = useRef(false);

  const activeId = useActiveSection(appNavItems);

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const activeIndex = Math.max(
    0,
    appNavItems.findIndex((item) => getSectionId(item) === activeId),
  );

  const syncActiveCapsule = useCallback(() => {
    const activeEl = linkRefs.current[activeIndex];
    if (!activeEl) return;

    // Use offsetLeft/offsetWidth to get pure layout dimensions
    // ignoring parent CSS transforms (like scale(0.93) in compact mode).
    // This perfectly aligns the indicator in all states.
    const baseLeft = activeEl.offsetLeft;
    const baseWidth = activeEl.offsetWidth;

    setActiveStyle({
      left: Math.round(baseLeft + 3),
      width: Math.round(Math.max(0, baseWidth - 6)),
      opacity: 1,
    });
  }, [activeIndex]);

  useEffect(() => {
    syncActiveCapsule();
    const timer = window.setTimeout(syncActiveCapsule, 50);
    const handleResize = () => syncActiveCapsule();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(timer);
    };
  }, [syncActiveCapsule, activeId]);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;
        let shouldBeCompact = compactRef.current;

        if (delta > 4 && currentY > 60) {
          shouldBeCompact = true;
        } else if (delta < -4 || currentY <= 40) {
          shouldBeCompact = false;
        }

        if (shouldBeCompact !== compactRef.current) {
          compactRef.current = shouldBeCompact;
          setCompact(shouldBeCompact);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleFocusIn = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      const type = event.target?.type?.toLowerCase();
      if (
        tag === "textarea" ||
        tag === "select" ||
        (tag === "input" &&
          type !== "checkbox" &&
          type !== "radio" &&
          type !== "submit" &&
          type !== "button")
      ) {
        setKeyboardOpen(true);
      }
    };

    const handleFocusOut = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        setKeyboardOpen(false);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const containerClasses = [
    "mobile-bottom-nav",
    compact ? "compact" : "",
    keyboardOpen ? "keyboard-hidden" : "",
    prefersReducedMotion ? "no-motion" : "",
  ].filter(Boolean).join(" ");

  return (
    <nav
      ref={navRef}
      className={containerClasses}
      aria-label="Alt navigasyon"
      id="mobile-bottom-navigation"
    >
      <span className="mbn-glass-sheen" aria-hidden="true" />
      <div ref={innerRef} className="mbn-inner">
        <span
          className="mbn-active-capsule"
          style={{
            transform: `translate3d(${activeStyle.left}px, 0, 0)`,
            width: `${activeStyle.width}px`,
            opacity: activeStyle.opacity,
          }}
          aria-hidden="true"
        />
        {appNavItems.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.Icon;

          return (
            <a
              key={item.href}
              href={item.href}
              ref={(el) => {
                linkRefs.current[index] = el;
              }}
              className={`mbn-link${isActive ? " active" : ""}`}
              aria-label={item.label}
              aria-current={isActive ? "location" : undefined}
              onClick={() => {
                compactRef.current = false;
                setCompact(false);
              }}
            >
              <span className="mbn-icon-wrap" aria-hidden="true">
                <Icon />
              </span>
              <span className="mbn-label">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
