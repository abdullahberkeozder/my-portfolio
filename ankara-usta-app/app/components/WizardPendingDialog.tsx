'use client';
import type {ReactNode} from 'react';
import {useModalDialog} from '../hooks/useModalDialog';
import styles from './wizardPendingDialog.module.css';

// The account boundary may not render the question wizard yet. Keep every
// prerequisite in a visible, dismissible modal rather than the landing flow.
export default function WizardPendingDialog({serviceName,onClose,children}:{serviceName:string;onClose:()=>void;children:ReactNode}) {
  const ref=useModalDialog<HTMLElement>(true,onClose);
  return <div className={styles.backdrop} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section ref={ref} role="dialog" aria-modal="true" aria-label={`${serviceName} — Talebe devam et`} tabIndex={-1} className={styles.dialog}>
      <header className={styles.header}><strong>{serviceName}</strong><button type="button" data-dialog-initial-focus onClick={onClose}>Kapat</button></header>
      <div className={styles.content}>{children}</div>
    </section>
  </div>;
}
