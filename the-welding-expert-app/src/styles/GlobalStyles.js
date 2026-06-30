import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`

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
  --font-family-sans: "Poppins", sans-serif;
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

  /* TaskRabbit Green Skala */
  --color-brand-50: #e8f5e9;
  --color-brand-100: #c8e6c9;
  --color-brand-200: #a5d6a7;
  --color-brand-500: #4caf50;
  --color-brand-600: #0d8050;
  --color-brand-700: #0b6c43;
  --color-brand-800: #085434;
  --color-brand-900: #053722;

  /* Warm Greys */
  --color-grey-0: #fff;
  --color-grey-50: #fbfbf9;
  --color-grey-50-rgb: 251, 251, 249;
  --color-grey-100: #f2f2ee;
  --color-grey-200: #e4e4db;
  --color-grey-300: #cfcfc3;
  --color-grey-400: #a3a398;
  --color-grey-500: #7c7c72;
  --color-grey-600: #5e5e56;
  --color-grey-700: #43433d;
  --color-grey-800: #2a2a26;
  --color-grey-900: #1c1c1a;

  --color-blue-100: #e0f2fe;
  --color-blue-700: #0369a1;
  --color-green-100: #e8f5e9;
  --color-green-700: #0d8050;
  --color-green-800: #0b6c43;
  --color-yellow-100: #fffbeb;
  --color-yellow-700: #854d0e; /* Accessible dark amber */
  --color-silver-100: #e4e4db;
  --color-silver-700: #43433d;
  --color-red-100: #fee2e2;
  --color-red-50: #fff4f2;
  --color-red-700: #b42318;
  --color-red-800: #8f1c14;

  /* Accent and surfaces */
  --color-accent-50: #fffbf0;
  --color-accent-400: #f28b24;
  --color-accent-500: #9a3412; /* Accessible dark rust/orange */
  --color-rust-700: #a0522d;
  --color-surface-dark: #1b3b2b;
  --color-surface-steel: #2a2a26;
  --color-text-inverse: #fbfbf9;
  --color-text-inverse-muted: #cfcfc3;

  /* Semantic color roles */
  --color-action-primary: var(--color-brand-600);
  --color-action-primary-hover: var(--color-brand-700);
  --color-selection: var(--color-brand-600);
  --color-selection-strong: var(--color-brand-800);
  --color-selection-soft: var(--color-brand-50);
  --color-selection-border: var(--color-brand-200);
  --color-focus-ring: var(--color-brand-600);
  --color-status-available: var(--color-brand-700);
  --color-status-warning-bg: var(--color-yellow-100);
  --color-status-warning-text: var(--color-yellow-700);
  --color-status-danger-bg: var(--color-red-50);
  --color-channel-whatsapp: #16a34a;

  --backdrop-color: rgba(27, 59, 43, 0.1);
  --color-nav-bg: rgba(255, 255, 255, 0.94);

  --color-hero-grad-start: #fbfbf9;
  --color-hero-grad-middle: rgba(251, 251, 249, 0.95);
  --color-hero-grad-end: rgba(251, 251, 249, 0.15);



  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0px 6px 20px rgba(27, 59, 43, 0.04), 0px 2px 8px rgba(27, 59, 43, 0.02);
  --shadow-lg: 0px 12px 32px rgba(27, 59, 43, 0.08), 0px 4px 12px rgba(27, 59, 43, 0.04);

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

/* Premium, smooth melting-snow cross dissolve theme transition active during theme toggle */
html.theme-transitioning *,
html.theme-transitioning *::before,
html.theme-transitioning *::after {
  transition: background-color 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important,
              color 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important,
              border-color 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important,
              box-shadow 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important,
              fill 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important,
              stroke 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

html {
  font-size: 62.5%;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

@media (max-width: 380px) {
  html {
    font-size: 58.5%;
  }
}

body {
  font-family: var(--font-family-sans);
  color: var(--color-grey-700);

  transition: color 0.3s, background-color 0.3s;
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

input:focus,
button:focus,
textarea:focus,
select:focus {
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

    --color-grey-0: #18212f;
    --color-grey-50: #111827;
    --color-grey-50-rgb: 17, 24, 39;
    --color-grey-100: #1f2937;
    --color-grey-200: #374151;
    --color-grey-300: #4b5563;
    --color-grey-400: #6b7280;
    --color-grey-500: #9ca3af;
    --color-grey-600: #d1d5db;
    --color-grey-700: #e5e7eb;
    --color-grey-800: #f3f4f6;
    --color-grey-900: #f9fafb;

    --color-brand-50: rgba(16, 185, 129, 0.15); /* Beautiful transparent dark green */
    --color-brand-100: rgba(16, 185, 129, 0.25);
    --color-brand-200: #34d399; /* Bright mint green */
    --color-brand-500: #10b981; /* Vibrant emerald */
    --color-brand-600: #10b981;
    --color-brand-700: #059669;
    --color-brand-800: #047857;
    --color-brand-900: #064e3b;

    --color-blue-100: #075985;
    --color-blue-700: #e0f2fe;
    --color-green-100: #064e3b;
    --color-green-700: #86efac;
    --color-yellow-100: #78350f; /* Dark amber background */
    --color-yellow-700: #fef3c7; /* Light yellow text */
    --color-silver-100: #374151;
    --color-silver-700: #f3f4f6;
    --color-red-100: #7f1d1d; /* Accessible dark red bg */
    --color-red-50: #450a0a;
    --color-red-700: #fca5a5; /* Accessible light red text */
    --color-red-800: #fee2e2;

    /* Semantic color roles */
    --color-action-primary: var(--color-brand-600);
    --color-action-primary-hover: var(--color-brand-700);
    --color-status-available: #86efac; /* Light green text */
    --color-status-warning-bg: var(--color-yellow-100);
    --color-status-warning-text: var(--color-yellow-700);
    --color-status-danger-bg: var(--color-red-100);
    --color-channel-whatsapp: #10b981;

    --backdrop-color: rgba(0, 0, 0, 0.5);
    --color-nav-bg: rgba(24, 33, 47, 0.94);

    --color-hero-grad-start: #111827;
    --color-hero-grad-middle: rgba(17, 24, 39, 0.95);
    --color-hero-grad-end: rgba(17, 24, 39, 0.15);


    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.4);

    --image-grayscale: 10%;
    --image-opacity: 90%;
  }



`;

export default GlobalStyles;
