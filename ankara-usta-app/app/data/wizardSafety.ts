export type WizardSafetyGuidance = {
  level: 'urgent' | 'warning';
  title: string;
  instruction: string;
};

export function getWizardSafetyGuidance(
  serviceId: string,
  answers: Record<string, string>,
): WizardSafetyGuidance | null {
  if (serviceId === 'elektrik-arizasi' && answers.symptom === 'Yanık kokusu / kıvılcım var') {
    return {
      level: 'urgent',
      title: 'Önce alanı güvenli hale getirin',
      instruction: 'Güvenliyse ana şalteri kapatın, kıvılcım olan bölgeye dokunmayın. Yangın veya yoğun duman varsa 112’yi arayın.',
    };
  }
  if (serviceId === 'elektrik-arizasi' && answers.power === 'Hayır') {
    return {
      level: 'warning',
      title: 'Enerjili hatta müdahale etmeyin',
      instruction: 'Usta gelene kadar priz, pano veya açık kablolara dokunmayın. Güvenliyse ilgili sigortayı kapatın.',
    };
  }
  if (serviceId === 'su-kacagi' && answers.active === 'Evet, aktif akıyor') {
    return {
      level: 'urgent',
      title: 'Su akışını mümkünse durdurun',
      instruction: 'Ana vanaya güvenle erişebiliyorsanız kapatın. Su elektrik tesisatına ulaşıyorsa bölgeye yaklaşmayın ve acil destek isteyin.',
    };
  }
  return null;
}
