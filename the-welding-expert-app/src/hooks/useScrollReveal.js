import { useLayoutEffect } from "react";

function useScrollReveal() {
  useLayoutEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    document.documentElement.classList.add("motion-ready");

    const observer =
      !reduceMotion && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
              });
            },
            { rootMargin: "0px 0px -8%", threshold: 0.08 },
          )
        : null;

    function register(element) {
      if (element.dataset.revealRegistered) return;
      element.dataset.revealRegistered = "true";

      if (reduceMotion || !observer) {
        element.classList.add("is-revealed");
        return;
      }

      observer.observe(element);
    }

    elements.forEach(register);

    const mutations = new MutationObserver(() => {
      document.querySelectorAll("[data-reveal]").forEach(register);
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
}

export default useScrollReveal;
