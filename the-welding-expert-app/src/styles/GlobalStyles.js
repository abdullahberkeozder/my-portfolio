import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
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

  /* Industrial steel blue */
  --color-brand-50: #f1f7fa;
  --color-brand-100: #e1eef4;
  --color-brand-200: #bad6e3;
  --color-brand-500: #2f7fa3;
  --color-brand-600: #176b91;
  --color-brand-700: #125675;
  --color-brand-800: #0e435c;
  --color-brand-900: #0b3448;

  /* Grey */
  --color-grey-0: #fff;
  --color-grey-50: #f5f6f7;
  --color-grey-100: #eceff1;
  --color-grey-200: #d8dde2;
  --color-grey-300: #c3cbd1;
  --color-grey-400: #929da5;
  --color-grey-500: #6b767d;
  --color-grey-600: #4f5d66;
  --color-grey-700: #37444c;
  --color-grey-800: #28343d;
  --color-grey-900: #172026;

  --color-blue-100: #e0f2fe;
  --color-blue-700: #0369a1;
  --color-green-100: #dcfce7;
  --color-green-700: #2e7d4f;
  --color-green-800: #23633e;
  --color-yellow-100: #fef9c3;
  --color-yellow-700: #a16207;
  --color-silver-100: #e5e7eb;
  --color-silver-700: #374151;
  --color-red-100: #fee2e2;
  --color-red-50: #fff4f2;
  --color-red-700: #b42318;
  --color-red-800: #8f1c14;

  /* Welding brand and inverse surfaces */
  --color-accent-50: #fffbeb;
  --color-accent-400: #f4c430;
  --color-accent-500: #dfaf16;
  --color-rust-700: #92400e;
  --color-surface-dark: #111518;
  --color-surface-steel: #28343d;
  --color-text-inverse: #f9fafb;
  --color-text-inverse-muted: #d1d5db;

  /* Semantic color roles */
  --color-action-primary: var(--color-accent-400);
  --color-action-primary-hover: var(--color-accent-500);
  --color-selection: var(--color-brand-600);
  --color-selection-strong: var(--color-brand-800);
  --color-selection-soft: var(--color-brand-50);
  --color-selection-border: var(--color-brand-200);
  --color-focus-ring: var(--color-brand-600);
  --color-status-available: var(--color-green-700);
  --color-status-warning-bg: var(--color-yellow-100);
  --color-status-warning-text: var(--color-yellow-700);
  --color-status-danger-bg: var(--color-red-50);
  --color-channel-whatsapp: #16a34a;

  --backdrop-color: rgba(255, 255, 255, 0.1);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.12);

  --border-radius-tiny: 3px;
  --border-radius-sm: 5px;
  --border-radius-md: 7px;
  --border-radius-lg: 9px;

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

  /* Creating animations for dark mode */
  transition: background-color 0.3s, border 0.3s;
}

html {
  font-size: 62.5%;
  scroll-behavior: smooth;
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

/*
FOR DARK MODE

--color-grey-0: #18212f;
--color-grey-50: #111827;
--color-grey-100: #1f2937;
--color-grey-200: #374151;
--color-grey-300: #4b5563;
--color-grey-400: #6b7280;
--color-grey-500: #9ca3af;
--color-grey-600: #d1d5db;
--color-grey-700: #e5e7eb;
--color-grey-800: #f3f4f6;
--color-grey-900: #f9fafb;

--color-blue-100: #075985;
--color-blue-700: #e0f2fe;
--color-green-100: #166534;
--color-green-700: #dcfce7;
--color-yellow-100: #854d0e;
--color-yellow-700: #fef9c3;
--color-silver-100: #374151;
--color-silver-700: #f3f4f6;
--color-red-100: #fee2e2;
--color-red-700: #b91c1c;
--color-red-800: #991b1b;

--backdrop-color: rgba(0, 0, 0, 0.3);

--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.3);
--shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.4);

--image-grayscale: 10%;
--image-opacity: 90%;
*/
`;

export default GlobalStyles;
