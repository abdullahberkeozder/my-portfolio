# Orkestra A11Y Acceptance Matrix & Assistive Technology Contract

**Standard**: WCAG 2.1 Level AA
**Updated**: 22 September 2026
**Status**: Acceptance requirements; automated checks are partial evidence (`A11Y-01`).

## Evidence boundary — 22 September 2026

This is a target matrix, not a completed assistive-technology certification.
NVDA, VoiceOver, TalkBack, physical mobile keyboard, actual 400% browser zoom,
and 200% text resizing remain **not verified**. A 320 CSS-pixel viewport checks
narrow-width reflow only. Axe checks below filter serious/critical violations;
they do not establish zero violations or full WCAG AA conformance.
The classification browser test now checks Tab and Shift+Tab wrapping and
restoration to the exact search input. The wizard test checks markup/status and
the modal-open marker; it does not prove screen-reader background isolation.
Unit tests inspect selected labels and navigation data, not spoken output.
Use [current verification record](VERIFICATION-2026-09-22.md) for run results.

---

## 1. Executive Summary

This document establishes the canonical accessibility contract for Orkestra. In alignment with **P1.4 / A11Y-01**, accessibility compliance is validated not merely through automated static analysis, but through verifiable assistive technology behavioral guarantees across real user journeys:
1. **Screen Readers**: NVDA (Windows/Chrome), VoiceOver (macOS/Safari, iOS/Safari), TalkBack (Android/Chrome).
2. **Keyboard Operation**: 100% interactive surface reachable and operable without a mouse.
3. **Reflow & Zoom**: Full operational integrity at 200% text resize and 400% zoom (320px CSS viewport width) without two-dimensional scrolling.
4. **Modal Dialogs**: Strict focus trapping, initial focus placement, Escape dismissal, background tree isolation (`aria-hidden`/`inert`), and focus restoration.
5. **Dynamic Feedback**: Timely and non-intrusive status and error announcements via ARIA live regions (`role="status"`, `role="alert"`, `aria-live="assertive"`).

---

## 2. Target Assistive Technology Matrix

| Assistive Tech | Host OS | Primary Browser | Key Journey Coverage | Verification Method |
|---|---|---|---|---|
| **NVDA 2024+** | Windows 11 | Google Chrome / Edge | Request Wizard, Quote Comparison, Auth, Workspace navigation | Manual testing protocol + Axe-core |
| **VoiceOver** | macOS Sonoma / iOS 17+ | Apple Safari | Service search, dialog workflows, touch target verification | Manual testing protocol + WebKit audit |
| **TalkBack** | Android 14+ | Google Chrome Mobile | Mobile wizard, location selection, button touch targets (min 44×44px) | Mobile viewport E2E |
| **Keyboard-Only** | Any OS | Any modern browser | Focus order, focus visible, focus trap, no keyboard trap | Playwright keyboard automated tests |

---

## 3. WCAG 2.1 Level AA Verification Criteria

### 3.1. Perceivable

| Criterion | Requirement | Implementation in Orkestra | Automated Gate |
|---|---|---|---|
| **1.1.1 Non-text Content** | All non-text content has text alternatives. | Brand logos (`OrchestraLogo`), icons (`aria-hidden="true"`), image alt attributes present. | Axe-core rule `image-alt` |
| **1.3.1 Info and Relationships** | Structure and relationships conveyed through markup. | Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<footer>`, `<dialog role="dialog">`). Single `<h1>` per page. | Axe-core rule `landmark-one-main` |
| **1.4.3 Contrast (Minimum)** | Text contrast ratio ≥ 4.5:1 (3:1 for large text). | Primary cobalt text `#0a192f` on white (`14.2:1`), muted text `#475569` on white (`5.9:1`). | Axe-core rule `color-contrast` |
| **1.4.4 Resize Text** | Text scalable to 200% without loss of content. | Relative typography units (`rem`/`clamp`), responsive grid wrapping. | Playwright viewport test |
| **1.4.10 Reflow** | Content flows at 400% zoom (320px viewport) without horizontal scroll. | Container queries, flex wrap, zero fixed-width containers wider than 320px. | `tests/e2e/accessibility.spec.ts` |

### 3.2. Operable

| Criterion | Requirement | Implementation in Orkestra | Automated Gate |
|---|---|---|---|
| **2.1.1 Keyboard** | All functionality operable via keyboard. | Interactive elements use native `<button>`, `<a>`, `<input>` with standard keyboard activation. | Playwright E2E |
| **2.1.2 No Keyboard Trap** | Focus can move away from any component using standard keys. | `useModalDialog` confines focus within dialog while active, releases upon Escape or close. | `tests/e2e/accessibility.spec.ts` |
| **2.4.3 Focus Order** | Sequential navigation order preserves meaning. | DOM order strictly matches visual presentation. Dialog autofocuses initial element. | `tests/component/RequestWizard.test.tsx` |
| **2.4.7 Focus Visible** | Any keyboard operable interface has a visible focus indicator. | Unified high-contrast focus ring: `outline: 2px solid var(--action-primary, #1b4d8f); outline-offset: 2px;`. | Component style tests |
| **2.5.3 Label in Name** | Visible text label is part of accessible name. | Buttons and links contain visible text matching `aria-label` (no conflicting overriding names). | `tests/unit/a11yContract.test.ts` |

### 3.3. Understandable

| Criterion | Requirement | Implementation in Orkestra | Automated Gate |
|---|---|---|---|
| **3.1.1 Language of Page** | Default human language is identified. | `<html lang="tr">` declared on root document layout. | Root layout check |
| **3.3.1 Error Identification** | Input errors identified and described in text. | Form validation messages use `role="alert"` and descriptive Turkish copy. | Component unit tests |
| **3.3.2 Labels or Instructions** | Labels or instructions provided for user input. | All form inputs have explicit `<label>` or `aria-label` bindings. | Axe-core rule `label` |

### 3.4. Robust

| Criterion | Requirement | Implementation in Orkestra | Automated Gate |
|---|---|---|---|
| **4.1.2 Name, Role, Value** | Controls have deterministic name, role, state. | ARIA attributes (`aria-expanded`, `aria-controls`, `aria-current`, `aria-modal="true"`) synchronised with React state. | `tests/component/ProductNavigation.test.tsx` |
| **4.1.3 Status Messages** | Status messages announced via live regions without focus shift. | Status updates (`role="status"`, `aria-live="polite"`) and error alerts (`role="alert"`, `aria-live="assertive"`). | `tests/e2e/accessibility.spec.ts` |

---

## 4. Modal Dialog Accessibility Contract (`useModalDialog`)

All modal dialogs in Orkestra (`RequestWizard`, `QuoteAcceptDialog`, `WizardPendingDialog`) must adhere to the following contract:

1. **Markup**: Must have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` or accessible title.
2. **Initial Focus**: Must focus `[data-dialog-initial-focus]` or the first focusable element upon mount.
3. **Focus Cycle (Tab / Shift+Tab)**:
   - When Tab is pressed on the last focusable element, focus wraps to the first focusable element.
   - When Shift+Tab is pressed on the first focusable element, focus wraps to the last focusable element.
4. **Dismissal**: Pressing `Escape` invokes `onClose()`.
5. **Focus Restoration**: Upon unmount, focus returns to the triggering element that held focus prior to dialog activation.
6. **Background Tree Isolation**: Sibling elements in `document.body` receive `aria-hidden="true"` while the modal is open, preventing screen reader virtual cursor leakage.

---

## 5. Automated Acceptance Test Suite

Automated verification is enforced via two complementary layers:
- **Playwright E2E (`tests/e2e/accessibility.spec.ts`)**:
  - Full-page Axe-core scan across desktop (1280px), mobile (390px), tablet (820px), and wide (1920px).
  - 400% Zoom / 320px Reflow test verifying `scrollWidth <= clientWidth`.
  - Focus trap test verifying Tab key cycling and Escape key restoration.
  - Live region announcement test for wizard form errors.
- **Vitest Unit Contract (`tests/unit/a11yContract.test.ts`)**:
  - Request status badges, next-action resolver links, and navigation items satisfy WCAG 2.5.3 (Label in Name).
  - Dialog hooks enforce `aria-modal` and background tree isolation.
