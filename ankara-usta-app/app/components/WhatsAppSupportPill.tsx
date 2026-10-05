'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ANKARA_PILOT_SUPPORT, buildWhatsAppSupportUrl } from '../lib/pilotSupport';
import styles from './whatsAppSupportPill.module.css';

export interface WhatsAppSupportPillProps {
  customCategory?: 'general' | 'customer_request' | 'artisan_support' | 'job_sos' | 'dispute_coordination';
  district?: string;
  jobId?: string;
  requestId?: string;
}

export default function WhatsAppSupportPill({
  customCategory = 'general',
  district,
  jobId,
  requestId,
}: WhatsAppSupportPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const whatsAppUrl = buildWhatsAppSupportUrl({
    category: customCategory,
    district,
    jobId,
    requestId,
  });

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleBtnRef.current?.focus();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <aside
      ref={containerRef}
      className={styles.supportPillWrapper}
      role="region"
      aria-label="Ankara Saha Destek ve Yardım İstasyonu"
    >
      {/* Expanded Quick Support Card */}
      {isOpen && (
        <div
          className={styles.supportCardMenu}
          role="dialog"
          aria-modal="false"
          aria-label="Saha Destek Menüsü"
        >
          <div className={styles.supportCardHeader}>
            <div className={styles.supportHeaderTitleRow}>
              <span className={styles.liveIndicatorDot} aria-hidden="true" />
              <span className={styles.supportCardTitle}>Ankara Pilot Saha Destek</span>
            </div>
            <button
              type="button"
              className={styles.supportCloseBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Pencereyi kapat"
            >
              ✕
            </button>
          </div>

          <p className={styles.supportCardDesc}>
            Ankara’nın 9 pilot ilçesinde talepleriniz, usta başvurularınız ve iş koordinasyonu için canlı destek alın.
          </p>

          <div className={styles.supportHoursBadge}>
            <span>🕒 Hafta içi: {ANKARA_PILOT_SUPPORT.operatingHours.weekdays}</span>
            <span>Cumartesi: {ANKARA_PILOT_SUPPORT.operatingHours.saturday}</span>
          </div>

          <div className={styles.supportActionsList}>
            {/* Primary WhatsApp Action */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.supportWhatsAppCta}
            >
              <span className={styles.whatsAppIcon} aria-hidden="true">💬</span>
              <div className={styles.ctaTextCol}>
                <span className={styles.ctaPrimaryLabel}>WhatsApp Saha Hattı</span>
                <span className={styles.ctaSubLabel}>{ANKARA_PILOT_SUPPORT.phoneDisplay}</span>
              </div>
            </a>

            {/* Direct Phone Call */}
            <a
              href={`tel:${ANKARA_PILOT_SUPPORT.phoneTel}`}
              className={styles.supportSecondaryLink}
            >
              <span aria-hidden="true">📞</span>
              <span>Doğrudan Ara: {ANKARA_PILOT_SUPPORT.phoneDisplay}</span>
            </a>

            {/* Help & Process Guide Link */}
            <Link
              href="/yardim"
              className={styles.supportSecondaryLink}
              onClick={() => setIsOpen(false)}
            >
              <span aria-hidden="true">📖</span>
              <span>Yardım & Süreç Rehberi</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Capsule */}
      <button
        ref={toggleBtnRef}
        type="button"
        className={`${styles.floatingCapsuleBtn} ${isOpen ? styles.floatingCapsuleBtnActive : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Destek menüsünü daralt' : 'Ankara Saha Destek ve Yardım menüsünü aç'}
      >
        <span className={styles.capsuleIcon} aria-hidden="true">
          {isOpen ? '✕' : '💬'}
        </span>
        <span className={styles.capsuleText}>Saha Destek & Yardım</span>
        <span className={styles.capsuleLiveDot} title="Pilot Koordinatörlüğü Aktif" />
      </button>
    </aside>
  );
}
