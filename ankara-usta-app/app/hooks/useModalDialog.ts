'use client';

import { RefObject, useEffect, useRef } from 'react';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const modalStack: HTMLElement[] = [];
let originalOverflow = '';
let originalRootOverflow = '';

export function useModalDialog<T extends HTMLElement>(active: boolean, onClose: () => void): RefObject<T | null> {
  const dialogRef = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!modalStack.length) {
      originalOverflow = document.body.style.overflow;
      originalRootOverflow = document.documentElement.style.overflow;
    }
    modalStack.push(dialog);
    document.body.dataset.modalOpen = 'true';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (!dialog.hasAttribute('aria-modal')) {
      dialog.setAttribute('aria-modal', 'true');
    }
    const siblingsToHide: HTMLElement[] = [];
    if (modalStack.length === 1) {
      Array.from(document.body.children).forEach(child => {
        if (child instanceof HTMLElement && !child.contains(dialog) && !child.hasAttribute('aria-hidden')) {
          child.setAttribute('aria-hidden', 'true');
          siblingsToHide.push(child);
        }
      });
    }
    (dialog.querySelector<HTMLElement>('[data-dialog-initial-focus]') ?? dialog).focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (modalStack.at(-1) !== dialog) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(dialog!.querySelectorAll<HTMLElement>(focusableSelector))
        .filter(element => !element.closest('[hidden],[inert],[aria-hidden="true"]') && getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden');
      if (!focusable.length) {
        event.preventDefault();
        dialog!.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!activeElement || !focusable.includes(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = modalStack.indexOf(dialog);
      if (index >= 0) modalStack.splice(index, 1);
      if (!modalStack.length) {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalRootOverflow;
        delete document.body.dataset.modalOpen;
        siblingsToHide.forEach(el => el.removeAttribute('aria-hidden'));
      }
      if (previouslyFocused?.isConnected) previouslyFocused.focus({preventScroll:true});
    };
  }, [active]);

  return dialogRef;
}
