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
    if (!modalStack.length) originalOverflow = document.body.style.overflow;
    modalStack.push(dialog);
    document.body.dataset.modalOpen = 'true';
    document.body.style.overflow = 'hidden';
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
      if (!dialog!.contains(document.activeElement) || document.activeElement === dialog) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
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
        delete document.body.dataset.modalOpen;
      }
      if (previouslyFocused?.isConnected) previouslyFocused.focus({preventScroll:true});
    };
  }, [active]);

  return dialogRef;
}
