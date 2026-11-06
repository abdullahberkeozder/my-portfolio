'use client';

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { resolveProfessionalMilestone } from '../domain/professionalMilestones';
import styles from './professionalMilestoneBadge.module.css';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ProfessionalMilestoneBadgeProps {
  count: number | string | null;
  professionalName: string;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

const VIEWPORT_MARGIN = 16;
const TRIGGER_GAP = 4;
const DEFAULT_PANEL_WIDTH = 272;
const DEFAULT_PANEL_HEIGHT = 130;

export default function ProfessionalMilestoneBadge({
  count,
  professionalName,
  className = '',
  align = 'center',
}: ProfessionalMilestoneBadgeProps) {
  const milestone = resolveProfessionalMilestone(count);
  const [isOpen, setIsOpen] = useState(false);
  const [panelCoords, setPanelCoords] = useState<{ top: number; left: number }>({
    top: VIEWPORT_MARGIN,
    left: VIEWPORT_MARGIN,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const generatedId = useId().replace(/:/g, '');
  const panelId = `professional-milestone-${generatedId}`;
  const titleId = `${panelId}-title`;

  const close = useCallback((returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const computePosition = useCallback(() => {
    if (!triggerRef.current || typeof window === 'undefined') return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const panelEl = panelRef.current;
    const panelRect = panelEl?.getBoundingClientRect();
    const panelWidth = panelRect?.width && panelRect.width > 0
      ? panelRect.width
      : Math.min(DEFAULT_PANEL_WIDTH, Math.max(0, viewportWidth - VIEWPORT_MARGIN * 2));
    const panelHeight = panelRect?.height && panelRect.height > 0
      ? panelRect.height
      : DEFAULT_PANEL_HEIGHT;

    let desiredLeft: number;
    if (align === 'start') {
      desiredLeft = rect.left;
    } else if (align === 'end') {
      desiredLeft = rect.right - panelWidth;
    } else {
      desiredLeft = rect.left + (rect.width - panelWidth) / 2;
    }

    const minLeft = VIEWPORT_MARGIN;
    const maxLeft = Math.max(VIEWPORT_MARGIN, viewportWidth - panelWidth - VIEWPORT_MARGIN);
    const clampedLeft = Math.min(Math.max(minLeft, desiredLeft), maxLeft);

    const fitsBelow = rect.bottom + TRIGGER_GAP + panelHeight <= viewportHeight - VIEWPORT_MARGIN;
    const fitsAbove = rect.top - TRIGGER_GAP - panelHeight >= VIEWPORT_MARGIN;

    let desiredTop: number;
    if (fitsBelow) {
      desiredTop = rect.bottom + TRIGGER_GAP;
    } else if (fitsAbove) {
      desiredTop = rect.top - TRIGGER_GAP - panelHeight;
    } else {
      const spaceBelow = viewportHeight - VIEWPORT_MARGIN - (rect.bottom + TRIGGER_GAP);
      const spaceAbove = (rect.top - TRIGGER_GAP) - VIEWPORT_MARGIN;
      if (spaceAbove > spaceBelow) {
        desiredTop = rect.top - TRIGGER_GAP - panelHeight;
      } else {
        desiredTop = rect.bottom + TRIGGER_GAP;
      }
    }

    const minTop = VIEWPORT_MARGIN;
    const maxTop = Math.max(VIEWPORT_MARGIN, viewportHeight - panelHeight - VIEWPORT_MARGIN);
    const clampedTop = Math.min(Math.max(minTop, desiredTop), maxTop);

    setPanelCoords({
      top: Math.round(clampedTop),
      left: Math.round(clampedLeft),
    });
  }, [align]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;
    computePosition();
  }, [isOpen, computePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      close(false);
    };

    const handleScroll = () => {
      close(false);
    };

    const handleResize = () => {
      close(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [close, isOpen]);

  if (!milestone) return null;

  const alignClass = align === 'start'
    ? styles.alignStart
    : align === 'end'
      ? styles.alignEnd
      : '';

  const panelStyle: CSSProperties = {
    top: `${panelCoords.top}px`,
    left: `${panelCoords.left}px`,
  };

  const panelNode = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-labelledby={titleId}
          className={`${styles.panel} ${alignClass}`.trim()}
          style={panelStyle}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === 'Escape') {
              event.preventDefault();
              close(true);
            }
          }}
        >
          <div className={styles.panelHeader}>
            <strong id={titleId}>{milestone.label}</strong>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Kilometre taşı açıklamasını kapat"
              onClick={(event) => {
                event.stopPropagation();
                close(true);
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === 'Escape') {
                  event.preventDefault();
                  close(true);
                }
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p>{milestone.explanation}</p>
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${className}`.trim()}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onFocus={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault();
          close(true);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-label={`${professionalName}: ${milestone.label}, ayrıntıları ${isOpen ? 'kapat' : 'aç'}`}
        title={milestone.label}
        onClick={(event) => {
          event.stopPropagation();
          toggleOpen();
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span className={styles.plate} aria-hidden="true">{milestone.threshold}</span>
      </button>

      {panelNode}
    </div>
  );
}
