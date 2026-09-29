'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useModalDialog } from '../../hooks/useModalDialog';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: ModalSize;
  footer?: React.ReactNode;
  /** Suppress the built-in close button */
  hideClose?: boolean;
  children: React.ReactNode;
  /** Render as a bottom sheet instead of a center dialog */
  bottomSheet?: boolean;
  'aria-label'?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  footer,
  hideClose = false,
  children,
  bottomSheet = false,
  'aria-label': ariaLabel,
}: ModalProps) {
  const dialogRef = useModalDialog<HTMLDivElement>(open, onClose);

  if (!open) return null;

  if (typeof document === 'undefined') return null;

  const closeIcon = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  if (bottomSheet) {
    return createPortal(
      <>
        <div className={styles.sheetOverlay} onClick={onClose} aria-hidden="true" />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
          className={styles.sheet}
          tabIndex={-1}
          data-dialog-initial-focus
        >
          <div className={styles.dragHandle} aria-hidden="true" />
          {(title || !hideClose) && (
            <div className={styles.header}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {!hideClose && (
                <button className={styles.closeBtn} onClick={onClose} aria-label="Kapat">
                  {closeIcon}
                </button>
              )}
            </div>
          )}
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </>,
      document.body
    );
  }

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        className={[styles.dialog, styles[size]].filter(Boolean).join(' ')}
        tabIndex={-1}
        data-dialog-initial-focus
      >
        {(title || !hideClose) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {!hideClose && (
              <button className={styles.closeBtn} onClick={onClose} aria-label="Kapat">
                {closeIcon}
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
