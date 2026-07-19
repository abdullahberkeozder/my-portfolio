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
  overflow-x: hidden;
}

body {
  font-family: var(--font-family-sans);
  font-synthesis: none;
  color: var(--color-grey-700);

  min-height: 100vh;
  line-height: var(--line-height-body);
  font-size: var(--font-size-md);
  overflow-x: hidden;
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



`;

export default GlobalStyles;
