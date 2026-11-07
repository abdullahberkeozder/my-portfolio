import { createGlobalStyle } from "styled-components";
import plusJakartaLatin from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2";
import plusJakartaLatinExt from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-wght-normal.woff2";

const GlobalStyles = createGlobalStyle`

@font-face {
  font-family: "Plus Jakarta Sans Variable";
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url(${plusJakartaLatinExt}) format("woff2-variations");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

@font-face {
  font-family: "Plus Jakarta Sans Variable";
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url(${plusJakartaLatin}) format("woff2-variations");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@property --color-grey-50 {
  syntax: '<color>';
  inherits: true;
  initial-value: #fbfbf9;
}
@property --color-grey-0 {
  syntax: '<color>';
  inherits: true;
  initial-value: #fff;
}
@property --color-hero-grad-start {
  syntax: '<color>';
  inherits: true;
  initial-value: #fbfbf9;
}
@property --color-hero-grad-middle {
  syntax: '<color>';
  inherits: true;
  initial-value: rgba(251, 251, 249, 0.95);
}
@property --color-hero-grad-end {
  syntax: '<color>';
  inherits: true;
  initial-value: rgba(251, 251, 249, 0.15);
}

:root {

  /* Typography */
  --font-family-sans: "Plus Jakarta Sans Variable", "Plus Jakarta Sans", Arial, sans-serif;
  --font-size-2xs: 1.1rem;
  --font-size-xs: 1.2rem;
  --font-size-sm: 1.3rem;
  --font-size-body: 1.4rem;
  --font-size-base: 1.5rem;
  --font-size-md: 1.6rem;
  --font-size-lead: 1.7rem;
  --font-size-lg: 1.8rem;
  --font-size-title: 2rem;
  --font-size-xl: 2.4rem;
  --font-size-heading: 2.8rem;
  --font-size-page-title: 3rem;
  --font-size-display: 4rem;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  --line-height-tight: 1.15;
  --line-height-body: 1.6;

  /* Motion system */
  --motion-fast: 140ms;
  --motion-base: 200ms;
  --motion-slow: 320ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);

  /* Quiet Craft source palette */
  --color-ink-950: #181a18;
  --color-ink-850: #292b29;
  --color-steel-700: #555953;
  --color-steel-600: #676b65;
  --color-steel-400: #9a9e97;
  --color-bone-100: #f7f6f2;
  --color-paper-0: #ffffff;
  --color-line-200: #dddcd5;
  --color-copper-50: #faf1eb;
  --color-copper-100: #f4e4da;
  --color-copper-200: #e3b99f;
  --color-copper-500: #c56a37;
  --color-copper-700: #8f4021;
  --color-copper-800: #6f2e17;
  --color-copper-900: #461c0e;

  /* Legacy aliases remain until customer components migrate in PUX-2/3. */
  --color-brand-50: var(--color-copper-50);
  --color-brand-100: var(--color-copper-100);
  --color-brand-200: var(--color-copper-200);
  --color-brand-500: var(--color-copper-500);
  --color-brand-600: var(--color-copper-700);
  --color-brand-700: var(--color-copper-800);
  --color-brand-800: var(--color-copper-900);
  --color-brand-900: #2b1008;

  /* Warm neutral compatibility scale */
  --color-grey-0: var(--color-paper-0);
  --color-grey-50: var(--color-bone-100);
  --color-grey-50-rgb: 247, 246, 242;
  --color-grey-100: #efeee9;
  --color-grey-200: var(--color-line-200);
  --color-grey-300: #c5c5bd;
  --color-grey-400: var(--color-steel-400);
  --color-grey-500: #676b65;
  --color-grey-600: var(--color-steel-600);
  --color-grey-700: var(--color-steel-700);
  --color-grey-800: var(--color-ink-850);
  --color-grey-900: var(--color-ink-950);

  --color-blue-100: #e0f2fe;
  --color-blue-700: #0369a1;
  --color-green-100: #e8f5e9;
  --color-green-700: #0b6c43;
  --color-green-800: #075936;
  --color-yellow-100: #fffbeb;
  --color-yellow-700: #854d0e; /* Accessible dark amber */
  --color-silver-100: #e4e4db;
  --color-silver-700: #43433d;
  --color-red-100: #fee2e2;
  --color-red-50: #fff4f2;
  --color-red-700: #b42318;
  --color-red-800: #8f1c14;

  /* Semantic surfaces, text and compatibility accents */
  --color-page-bg: var(--color-bone-100);
  --color-surface-raised: var(--color-paper-0);
  --color-surface-subtle: #efeee9;
  --color-border-subtle: var(--color-line-200);
  --color-text-primary: var(--color-ink-950);
  --color-text-body: var(--color-steel-700);
  --color-text-muted: var(--color-steel-600);
  --color-accent-50: var(--color-copper-50);
  --color-accent-400: var(--color-copper-500);
  --color-accent-500: var(--color-copper-700);
  --color-rust-700: var(--color-copper-800);
  --color-surface-dark: var(--color-ink-950);
  --color-surface-steel: var(--color-ink-850);
  --color-logo-surface: var(--color-bone-100);
  --color-text-inverse: var(--color-bone-100);
  --color-text-inverse-muted: #c5c5bd;
  --color-control-bg: #efeee9;
  --color-control-active-bg: var(--color-paper-0);
  --color-control-active-text: var(--color-ink-950);
  --color-control-border: var(--color-line-200);
  --color-control-border-hover: #b8b7af;
  --brand-logo-filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.28));

  /* Semantic color roles */
  --color-action-primary: var(--color-brand-600);
  --color-action-primary-hover: var(--color-brand-700);
  --color-action-success: var(--color-green-700);
  --color-action-success-hover: var(--color-green-800);
  --color-selection: var(--color-brand-600);
  --color-selection-strong: var(--color-brand-800);
  --color-selection-soft: var(--color-brand-50);
  --color-selection-border: var(--color-brand-200);
  --color-focus-ring: var(--color-brand-600);
  --color-status-success-bg: var(--color-green-100);
  --color-status-success-text: var(--color-green-700);
  --color-status-available: var(--color-status-success-text);
  --color-status-warning-bg: var(--color-yellow-100);
  --color-status-warning-text: var(--color-yellow-700);
  --color-status-danger-bg: var(--color-red-50);
  --color-channel-whatsapp: #15803d;

  --backdrop-color: rgba(37, 35, 33, 0.14);
  --color-nav-bg: rgba(255, 255, 255, 0.94);
  --navbar-surface-bg: radial-gradient(900px 200px at 50% -50%, rgba(255, 255, 255, 0.92), transparent 70%), rgba(243, 246, 244, 0.76);
  --navbar-surface-border: rgba(255, 255, 255, 0.78);
  --navbar-surface-shadow: 0 16px 36px -8px rgba(24, 26, 24, 0.14), 0 4px 12px -2px rgba(24, 26, 24, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(24, 26, 24, 0.04);
  --glass-nav-bg: rgba(240, 243, 241, 0.76);
  --glass-nav-border: rgba(255, 255, 255, 0.82);
  --glass-nav-shadow: 0 14px 34px -6px rgba(24, 26, 24, 0.18), 0 4px 12px -2px rgba(24, 26, 24, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.95);
  --glass-indicator-bg: rgba(255, 255, 255, 0.26);
  --glass-indicator-border: rgba(255, 255, 255, 0.65);
  --glass-indicator-shadow: 0 4px 14px rgba(24, 26, 24, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.75), inset 0 -1px 1px rgba(255, 255, 255, 0.15);
  --glass-hover-bg: rgba(255, 255, 255, 0.12);
  --glass-hover-border: rgba(255, 255, 255, 0.35);
  --glass-hover-shadow: 0 4px 12px rgba(24, 26, 24, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.4);
  --glass-sheen: linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.02) 100%);

  --color-hero-grad-start: #fbfbf9;
  --color-hero-grad-middle: rgba(251, 251, 249, 0.95);
  --color-hero-grad-end: rgba(251, 251, 249, 0.15);



  --shadow-sm: 0 1px 2px rgba(24, 26, 24, 0.06);
  --shadow-md: 0 8px 24px rgba(24, 26, 24, 0.07), 0 2px 6px rgba(24, 26, 24, 0.04);
  --shadow-lg: 0 16px 40px rgba(24, 26, 24, 0.12), 0 4px 10px rgba(24, 26, 24, 0.06);
  --shadow-sticky: 0 -4px 24px rgba(24, 26, 24, 0.08);

  --radius-control: 4px;
  --radius-component: 8px;
  --radius-overlay: 12px;

  --border-radius-tiny: 4px;
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;

  /* For dark mode */
  --image-grayscale: 0;
  --image-opacity: 100%;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

/* Short cross-dissolve used only while the theme toggle is active. */
html.theme-transitioning *,
html.theme-transitioning *::before,
html.theme-transitioning *::after {
  transition: background-color var(--motion-slow) var(--ease-standard) !important,
              color var(--motion-slow) var(--ease-standard) !important,
              border-color var(--motion-slow) var(--ease-standard) !important,
              box-shadow var(--motion-slow) var(--ease-standard) !important,
              fill var(--motion-slow) var(--ease-standard) !important,
              stroke var(--motion-slow) var(--ease-standard) !important;
}

@keyframes premium-reveal {
  from {
    opacity: 0;
    transform: translateY(1.2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes route-enter {
  from {
    opacity: 0;
    transform: translateY(0.8rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: no-preference) {
  html.motion-ready [data-reveal] {
    opacity: 0;
  }

  html.motion-ready [data-reveal].is-revealed {
    animation: premium-reveal var(--motion-slow) var(--ease-out) both;
  }

  [data-route-surface] {
    animation: route-enter var(--motion-slow) var(--ease-out) both;
  }
}

html {
  font-size: 62.5%;
  scroll-behavior: smooth;
  overflow-x: clip;
}

body {
  font-family: var(--font-family-sans);
  font-synthesis: none;
  color: var(--color-grey-700);

  min-height: 100vh;
  line-height: var(--line-height-body);
  font-size: var(--font-size-md);
  overflow-x: clip;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

input,
button,
select {
  min-height: 4.4rem;
}

button {
  cursor: pointer;
}

*:disabled {
  cursor: not-allowed;
}

select:disabled,
input:disabled {
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);
}

input:focus-visible,
button:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

a:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--border-radius-tiny);
}

/* Parent selector, finally 😃 */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

@media (forced-colors: active) {
  input,
  button,
  textarea,
  select,
  summary,
  a {
    forced-color-adjust: auto;
  }

  input,
  button,
  textarea,
  select {
    border-color: ButtonText;
  }

  input:focus-visible,
  button:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  a:focus-visible,
  summary:focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 3px;
  }

  [aria-current="step"],
  [aria-pressed="true"],
  [aria-checked="true"] {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
  hyphens: auto;
}

img {
  display: block;
  max-width: 100%;

  /* For dark mode */
  filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
}

html.dark-mode {
    --color-grey-0: #242724;
    --color-grey-50: var(--color-ink-950);
    --color-grey-50-rgb: 24, 26, 24;
    --color-grey-100: var(--color-ink-850);
    --color-grey-200: #3d403c;
    --color-grey-300: var(--color-steel-700);
    --color-grey-400: #777b74;
    --color-grey-500: #a6aaa3;
    --color-grey-600: #c5c8c1;
    --color-grey-700: #d9dbd5;
    --color-grey-800: #ecece7;
    --color-grey-900: var(--color-bone-100);

    --color-brand-50: rgba(197, 106, 55, 0.16);
    --color-brand-100: rgba(197, 106, 55, 0.24);
    --color-brand-200: #a65b35;
    --color-brand-500: var(--color-copper-500);
    --color-brand-600: #a9502a;
    --color-brand-700: var(--color-copper-500);
    --color-brand-800: #d89369;
    --color-brand-900: #f1c4aa;

    --color-blue-100: #243e46;
    --color-blue-700: #b9dce5;
    --color-green-100: #123d2b;
    --color-green-700: #90d6af;
    --color-green-800: #bde8cf;
    --color-yellow-100: #4a3619;
    --color-yellow-700: #f3d89d;
    --color-silver-100: #3d403c;
    --color-silver-700: #ecece7;
    --color-red-100: #542321;
    --color-red-50: #3a1b19;
    --color-red-700: #f1aaa4;
    --color-red-800: #ffd7d3;

    --color-page-bg: var(--color-ink-950);
    --color-surface-raised: #242724;
    --color-surface-subtle: var(--color-ink-850);
    --color-border-subtle: #3d403c;
    --color-text-primary: var(--color-bone-100);
    --color-text-body: #d9dbd5;
    --color-text-muted: #a6aaa3;
    --color-logo-surface: #242724;
    --color-control-bg: var(--color-ink-850);
    --color-control-active-bg: #3d403c;
    --color-control-active-text: var(--color-bone-100);
    --color-control-border: #4a4e48;
    --color-control-border-hover: #777b74;
    --brand-logo-filter: grayscale(1) brightness(0) invert(0.94) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.34));

    --color-action-primary: var(--color-brand-600);
    --color-action-primary-hover: var(--color-brand-700);
    --color-action-success: #11633f;
    --color-action-success-hover: #18754c;
    --color-status-success-bg: var(--color-green-100);
    --color-status-success-text: var(--color-green-700);
    --color-status-available: var(--color-status-success-text);
    --color-status-warning-bg: var(--color-yellow-100);
    --color-status-warning-text: var(--color-yellow-700);
    --color-status-danger-bg: var(--color-red-100);
    --color-channel-whatsapp: #128044;

    --backdrop-color: rgba(9, 10, 9, 0.68);
    --color-nav-bg: rgba(24, 26, 24, 0.94);
    --navbar-surface-bg: radial-gradient(900px 200px at 50% -50%, rgba(62, 66, 61, 0.48), transparent 70%), rgba(22, 24, 22, 0.78);
    --navbar-surface-border: rgba(255, 255, 255, 0.16);
    --navbar-surface-shadow: 0 18px 40px -8px rgba(0, 0, 0, 0.55), 0 4px 14px -2px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.18), inset 0 -1px 1px rgba(0, 0, 0, 0.25);
    --glass-nav-bg: rgba(26, 28, 26, 0.8);
    --glass-nav-border: rgba(255, 255, 255, 0.16);
    --glass-nav-shadow: 0 14px 36px -6px rgba(0, 0, 0, 0.52), 0 4px 12px -2px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.12);
    --glass-indicator-bg: rgba(62, 66, 61, 0.85);
    --glass-indicator-border: rgba(255, 255, 255, 0.22);
    --glass-indicator-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.2);
    --glass-hover-bg: rgba(62, 66, 61, 0.55);
    --glass-hover-border: rgba(255, 255, 255, 0.18);
    --glass-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15);
    --glass-sheen: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.01) 100%);
    --color-hero-grad-start: #181a18;
    --color-hero-grad-middle: rgba(24, 26, 24, 0.95);
    --color-hero-grad-end: rgba(24, 26, 24, 0.18);

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.34);
    --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.32), 0 2px 6px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.42), 0 4px 10px rgba(0, 0, 0, 0.24);
    --shadow-sticky: 0 -4px 24px rgba(0, 0, 0, 0.28);

    --image-grayscale: 6%;
    --image-opacity: 92%;
  }

  /* ─── Liquid Glass Global & Mobile Bottom Nav Styles ──────────────────────── */
  .liquid-glass-definitions {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 0;
    height: 0;
    pointer-events: none;
  }
  .liquid-glass-layer,
  .nav-pointer-glow {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: inherit;
    pointer-events: none;
  }
  .nav-pointer-glow {
    clip-path: inset(0 round 999px);
    background: radial-gradient(
      240px 150px at var(--gx, 50%) var(--gy, 50%),
      rgba(216, 147, 105, var(--ga, 0)) 0%,
      rgba(216, 147, 105, 0) 74%
    );
    transition: background 0.18s ease;
  }
  .nav-glass-indicator {
    position: absolute;
    z-index: 6;
    top: 0.6rem;
    left: 0.8rem;
    width: 10rem;
    height: 5.2rem;
    border-radius: 999px;
    background: var(--glass-indicator-bg);
    border: 1px solid var(--glass-indicator-border);
    box-shadow: var(--glass-indicator-shadow);
    transform-origin: center;
    will-change: left, width, transform;
    transition:
      left 0.24s cubic-bezier(0.2, 0.9, 0.22, 1),
      width 0.24s cubic-bezier(0.2, 0.9, 0.22, 1),
      top 0.32s cubic-bezier(0.2, 0.9, 0.22, 1),
      height 0.32s cubic-bezier(0.2, 0.9, 0.22, 1),
      transform 0.25s ease,
      background-color 0.25s ease,
      box-shadow 0.25s ease;
    pointer-events: none;
  }
  .nav-glass-indicator.interacting {
    z-index: 999;
    transform: scale(1.08);
  }
  .nav-route-links.dragging .nav-glass-indicator {
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease;
  }
  .nav-route-link {
    position: relative;
    z-index: 8;
    min-height: 4.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.6rem 1.4rem;
    border-radius: 999px;
    color: var(--color-grey-600);
    font-size: clamp(1.25rem, 1.05vw, 1.35rem);
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    text-decoration: none;
    transition:
      color 0.2s ease,
      min-height 0.32s cubic-bezier(0.2, 0.9, 0.22, 1),
      padding 0.32s cubic-bezier(0.2, 0.9, 0.22, 1),
      gap 0.32s ease,
      font-size 0.32s ease;
    touch-action: none;
    cursor: pointer;
  }
  .nav-route-link::before {
    content: "";
    position: absolute;
    inset: 0.4rem 0.2rem;
    border-radius: 999px;
    background: var(--glass-hover-bg);
    border: 1px solid var(--glass-hover-border);
    box-shadow: var(--glass-hover-shadow);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    transform: scale(0.95);
    transition:
      opacity 0.22s cubic-bezier(0.2, 0.9, 0.22, 1),
      transform 0.22s cubic-bezier(0.2, 0.9, 0.22, 1),
      border-color 0.22s ease;
    pointer-events: none;
    z-index: -1;
  }
  @media (hover: hover) {
    .nav-route-link:not(.active):hover::before {
      opacity: 1;
      transform: scale(1);
    }
  }
  .nav-route-link svg {
    width: 1.8rem;
    height: 1.8rem;
    flex-shrink: 0;
    stroke-width: 1.8px;
    transition: width 0.32s ease, height 0.32s ease;
  }
  .nav-route-link.active, .nav-route-link:hover {
    color: var(--color-grey-900);
  }
  .nav-route-link.active {
    font-weight: 800;
  }
  .nav-route-link:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }
  .nav-glass-shell {
    position: relative;
    width: min(62rem, calc(100vw - 34rem));
    height: 6.4rem;
    flex: 0 0 auto;
    overflow: visible;
    border-radius: 999px;
    background: var(--glass-nav-bg);
    border: 1px solid var(--glass-nav-border);
    box-shadow: var(--glass-nav-shadow);
    backdrop-filter: blur(16px);
    transition:
      height 0.32s cubic-bezier(0.2, 0.9, 0.22, 1),
      transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.32s ease;
  }
  .nav-glass-shell.engaged {
    transform: scale(1.02);
  }
  .nav-route-links {
    --gx: 50%;
    --gy: 50%;
    --ga: 0;
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.8rem;
    border-radius: 999px;
    transition: padding 0.32s cubic-bezier(0.2, 0.9, 0.22, 1), gap 0.32s ease;
  }
  .scrolled .nav-glass-shell {
    height: 5.2rem;
    box-shadow: 0 8px 22px -6px rgba(24, 26, 24, 0.14), 0 2px 8px -2px rgba(24, 26, 24, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.85);
  }
  .scrolled .nav-route-links {
    padding: 0.4rem 0.6rem;
    gap: 0.2rem;
  }
  .scrolled .nav-route-link {
    min-height: 4.2rem;
    padding: 0.4rem 1rem;
    gap: 0.5rem;
    font-size: clamp(1.15rem, 1vw, 1.25rem);
  }
  .scrolled .nav-route-link svg {
    width: 1.6rem;
    height: 1.6rem;
  }
  .scrolled .nav-glass-indicator {
    top: 0.5rem;
    left: 0.6rem;
    background: rgba(255, 255, 255, 0.34);
    border-color: rgba(255, 255, 255, 0.85);
    box-shadow: 0 4px 12px rgba(24, 26, 24, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.2);
    height: 4.2rem;
  }

  @media (max-width: 980px) {
    .nav-glass-shell {
      display: none !important;
    }
  }

  /* ─── Liquid Glass Mobile Bottom Navigation ──────────────────────── */
  .mobile-bottom-nav {
    display: none;
    position: fixed;
    left: 50%;
    bottom: calc(1.4rem + env(safe-area-inset-bottom, 0px));
    transform: translate3d(-50%, 0, 0) scale(1);
    width: min(calc(100vw - 2.8rem), 44rem);
    z-index: 900;
    border-radius: 999px;
    background: var(--glass-nav-bg);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border: 1px solid var(--glass-nav-border);
    box-shadow: var(--glass-nav-shadow);
    transition:
      transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.28s ease;
    will-change: transform, opacity;
    overflow: hidden;
  }
  @media (max-width: 980px) {
    .mobile-bottom-nav {
      display: flex;
      flex-direction: column;
    }
  }
  @supports not (backdrop-filter: blur(1px)) {
    .mobile-bottom-nav {
      background: var(--color-nav-bg);
    }
  }
  .mobile-bottom-nav.no-motion,
  .mobile-bottom-nav.no-motion * {
    transition: none !important;
  }
  .mobile-bottom-nav.compact {
    transform: translate3d(-50%, 0.6rem, 0) scale(0.93);
    opacity: 0.9;
    box-shadow: var(--shadow-md);
  }
  .mobile-bottom-nav.keyboard-hidden {
    opacity: 0 !important;
    pointer-events: none !important;
    transform: translate3d(-50%, 150%, 0) !important;
  }
  .mbn-glass-sheen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 48%;
    background: var(--glass-sheen);
    border-radius: 999px 999px 0 0;
    pointer-events: none;
    z-index: 0;
  }
  .mbn-inner {
    position: relative;
    display: flex;
    align-items: stretch;
    height: 6.2rem;
    padding: 0 0.4rem;
    transition: height 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .mobile-bottom-nav.compact .mbn-inner {
    height: 4.8rem;
  }
  .mbn-active-capsule {
    position: absolute;
    top: 0.5rem;
    bottom: 0.5rem;
    left: 0;
    z-index: 1;
    border-radius: 999px;
    background: var(--glass-indicator-bg);
    border: 1px solid var(--glass-indicator-border);
    box-shadow: var(--glass-indicator-shadow);
    pointer-events: none;
    transition:
      transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
      width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
      top 0.28s ease,
      bottom 0.28s ease,
      opacity 0.22s ease;
    will-change: transform, width;
  }
  .mobile-bottom-nav.compact .mbn-active-capsule {
    top: 0.4rem;
    bottom: 0.4rem;
    box-shadow: var(--shadow-sm);
  }
  .mbn-link {
    position: relative;
    z-index: 2;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    min-width: 0;
    min-height: 4.4rem;
    padding: 0.5rem 0.2rem;
    border: 0;
    background: none;
    color: var(--color-grey-500);
    text-decoration: none;
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    transition: color 0.22s ease, transform 0.16s ease, filter 0.16s ease;
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) and (pointer: fine) {
    .mbn-link:hover {
      color: var(--color-grey-800);
    }
  }
  .mbn-link.active {
    color: var(--color-grey-900);
    font-weight: 800;
  }
  .mbn-link:active {
    transform: scale(0.92);
    filter: brightness(1.08);
  }
  .mbn-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.6rem;
    height: 2.6rem;
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .mbn-icon-wrap svg {
    width: 2rem;
    height: 2rem;
    stroke-width: 1.8px;
  }
  .mbn-link.active .mbn-icon-wrap svg {
    stroke-width: 2.3px;
  }
  .mbn-label {
    font-size: 1.15rem;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    transition: opacity 0.22s ease, transform 0.22s ease, max-height 0.22s ease;
    max-height: 1.6rem;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .mobile-bottom-nav.compact .mbn-link {
    gap: 0;
  }
  .mobile-bottom-nav.compact .mbn-label {
    opacity: 0;
    max-height: 0;
    transform: scale(0.8) translateY(0.4rem);
  }
`;

export default GlobalStyles;
