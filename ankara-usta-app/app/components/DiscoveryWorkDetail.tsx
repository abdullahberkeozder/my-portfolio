'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useModalDialog } from '../hooks/useModalDialog';

export type DiscoveryWork = {
  id: string;
  serviceId?: string;
  category?: string;
  title: string;
  image: string;
  artisanName: string;
  artisanDistrict: string;
  sceneDetails: string[];
};

type Props = {
  work: DiscoveryWork;
  serviceName: string;
  returnFocusRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onRequest: (selectedWork?: DiscoveryWork) => void;
};

export default function DiscoveryWorkDetail({ work, serviceName, returnFocusRef, onClose, onRequest }: Props) {
  const dialogRef = useModalDialog<HTMLElement>(true, onClose);

  useEffect(() => {
    const returnFocus = returnFocusRef.current;
    return () => {
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, [returnFocusRef]);

  return (
    <div className="discovery-detail-backdrop" role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="discovery-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discovery-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          data-dialog-initial-focus
          type="button"
          className="discovery-detail-close"
          aria-label="Kapat"
          onClick={onClose}
        >
          ×
        </button>

        <div className="discovery-detail-layout">
          {/* Sol sütun: Editoryal görsel anchor */}
          <div className="discovery-detail-media">
            <div className="discovery-detail-img-wrap">
              <Image
                src={work.image}
                alt={work.title}
                width={900}
                height={600}
                unoptimized
                className="discovery-detail-img"
              />
            </div>
          </div>

          {/* Sağ sütun: Editoryal içerik ve eylem */}
          <div className="discovery-detail-content">
            <div className="discovery-detail-header">
              <h2 id="discovery-detail-title" className="discovery-detail-title">{work.title}</h2>
              <p className="discovery-detail-meta">
                <span>{serviceName}</span>
                <span className="discovery-detail-sep" aria-hidden="true">·</span>
                <span>{work.artisanDistrict}</span>
              </p>
              <p className="discovery-detail-artisan">Usta profili: {work.artisanName}</p>
            </div>

            <div className="discovery-detail-details">
              <span className="discovery-detail-section-label">Fotoğrafta görülenler</span>
              <ul className="discovery-detail-materials">
                {work.sceneDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>

            <p className="discovery-detail-disclosure">
              Temsili örnek uygulama ve usta profili. Bu referans talep sihirbazına aktarılır; adımlarda dilediğin gibi düzenleyebilirsin.
            </p>

            <div className="discovery-detail-footer">
              <button
                type="button"
                className="discovery-detail-action"
                onClick={() => onRequest(work)}
                aria-label="Bu hizmet için talep oluştur"
              >
                <span>Benzerini yaptır</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

