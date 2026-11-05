import type { RequestStatus } from './models';

export type RequestStatusMeta = {
  label: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';
  description: string;
};

export const requestStatusDictionary: Record<RequestStatus | 'completed', RequestStatusMeta> = {
  draft: { label: 'Taslak', tone: 'neutral', description: 'Talep henüz gönderilmedi.' },
  submitted: { label: 'Gönderildi', tone: 'info', description: 'Talebiniz uygun ustalara iletiliyor.' },
  matching: { label: 'Usta aranıyor', tone: 'accent', description: 'Talebiniz için uygun ustalar eşleştiriliyor.' },
  quotes_received: { label: 'Teklifler hazır', tone: 'success', description: 'Karşılaştırmanız için teklifler geldi.' },
  provider_selected: { label: 'Usta seçildi', tone: 'success', description: 'Seçtiğiniz usta ile iş akışı başlatıldı.' },
  completed: { label: 'Tamamlandı', tone: 'success', description: 'İş tamamlandı ve onaylandı.' },
  cancelled: { label: 'İptal edildi', tone: 'danger', description: 'Bu talep iptal edildi.' },
  expired: { label: 'Süresi doldu', tone: 'warning', description: 'Bu talebin aktif süresi doldu.' },
};

