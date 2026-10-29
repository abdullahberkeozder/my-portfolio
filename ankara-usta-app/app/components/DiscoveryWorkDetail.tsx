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
  materials: string[];
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
          {/* Sol sütun: Büyük zanaatkar görseli */}
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
            <p className="discovery-detail-tagline">
              <span>{serviceName}</span>
              <span className="discovery-detail-dot">·</span>
              <span>{work.artisanDistrict}</span>
            </p>
          </div>

          {/* Sağ sütun: Editoryal içerik, usta kimliği ve eylem köprüsü */}
          <div className="discovery-detail-content">
            <div className="discovery-detail-header">
              <span className="discovery-detail-kicker">Zanaatkar Portfolyosu</span>
              <h2 id="discovery-detail-title">{work.title}</h2>
            </div>

            <div className="discovery-detail-artisan-chip">
              <span className="discovery-detail-avatar" aria-hidden="true">
                {work.artisanName.charAt(0)}
              </span>
              <div className="discovery-detail-artisan-meta">
                <strong>{work.artisanName}</strong>
                <span>{work.artisanDistrict} bölgesi · Doğrulanmış usta</span>
              </div>
            </div>

            <p className="discovery-detail-subtext">
              {work.artisanName} tarafından tamamlanan örnek uygulama.
            </p>

            <div className="discovery-detail-scope-block">
              <span className="discovery-detail-scope-heading">İşçilik & Malzeme Detayları</span>
              <ul className="discovery-detail-materials">
                {work.materials.map((material) => (
                  <li key={material}>{material}</li>
                ))}
              </ul>
            </div>

            <div className="discovery-detail-trust-card">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p>
                Temsili örnek uygulama. Seçtiğin bu referans talep sihirbazına eklenecektir; adımlarda dilediğin gibi değiştirebilir veya kaldırabilirsin.
              </p>
            </div>

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

