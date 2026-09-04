import type { RequestStatus } from './models';

export type RequestJourneyStage = {
  id: 'request' | 'matching' | 'quote' | 'job';
  label: string;
  state: 'complete' | 'current' | 'upcoming';
};

const stageIndex: Record<Exclude<RequestStatus, 'cancelled' | 'expired' | 'draft'>, number> = {
  submitted: 1,
  matching: 1,
  quotes_received: 2,
  provider_selected: 3,
};

export function requestJourney(status: RequestStatus): RequestJourneyStage[] {
  const current = status === 'draft' ? 0 : status === 'cancelled' || status === 'expired' ? -1 : stageIndex[status];
  return ['Talep', 'Usta yanıtı', 'Teklif kararı', 'İş'].map((label, index) => ({
    id: (['request', 'matching', 'quote', 'job'] as const)[index],
    label,
    state: current < 0 ? 'upcoming' : index < current ? 'complete' : index === current ? 'current' : 'upcoming',
  }));
}

export function requestNextStep(status: RequestStatus, quoteCount: number) {
  if (status === 'draft') return { title: 'Talebi tamamlayın', description: 'Eksik kapsam ve konum bilgilerini tamamlayıp talebi gönderin.' };
  if (status === 'submitted' || status === 'matching') return {
    title: 'Usta yanıtı bekleniyor',
    description: 'Uygun ve doğrulanmış ustalar kapsamınızı inceliyor. Yeni teklif geldiğinde bu alan güncellenir.',
  };
  if (status === 'quotes_received') return {
    title: quoteCount ? `${quoteCount} güncel teklifi değerlendirin` : 'Teklifleri değerlendirin',
    description: 'Kapsam, toplam bedel, süre ve garanti koşullarını karşılaştırın. Kabulden önce ustayla ayrıntıları netleştirebilirsiniz.',
  };
  if (status === 'provider_selected') return {
    title: 'Usta seçildi',
    description: 'Kabul edilen koşullar sabitlendi. Randevu, mesajlar ve iş durumu artık iş odasında yönetilir.',
  };
  if (status === 'cancelled') return { title: 'Talep iptal edildi', description: 'Bu talep yeni teklif veya işlem kabul etmiyor.' };
  return { title: 'Talebin süresi doldu', description: 'Bu talep yeni teklif kabul etmiyor. İhtiyaç sürüyorsa yeni bir talep oluşturun.' };
}
