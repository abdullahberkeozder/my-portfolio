import { useEffect, useState } from "react";

export function getSectionId(item) {
  return item.href.replace("#", "");
}

function useActiveSection(items) {
  const [activeId, setActiveId] = useState(getSectionId(items[0]));

  useEffect(() => {
    const sectionIds = items.map(getSectionId);
    let frameId = null;

    function updateActiveSection() {
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight;

      if (scrollBottom >= pageBottom - 8) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        frameId = null;
        return;
      }

      const checkpoint = window.scrollY + window.innerHeight * 0.35;
      let currentId = sectionIds[0];

      sectionIds.forEach((sectionId) => {
        const section = document.getElementById(sectionId);

        if (section && section.offsetTop <= checkpoint) {
          currentId = sectionId;
        }
      });

      setActiveId(currentId);
      frameId = null;
    }

    function scheduleUpdate() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateActiveSection);
    }

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [items]);

  return activeId;
}

export default useActiveSection;
