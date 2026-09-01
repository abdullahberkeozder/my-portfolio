import { Service } from './serviceTaxonomy';

export type ServiceSafetyGuidance = {
  title: string;
  body: string;
};

export const packageScopePreview = {
  included: [
    'Talep fişinde seçtiğiniz standart hizmet işçiliği',
    'Hizmet verenin işi yapmak için kullandığı temel ekipman',
    'İş sonunda kapsamın sizinle birlikte kontrol edilmesi',
  ],
  excluded: [
    'Ürün, yedek parça ve sarf malzemesi bedelleri',
    'Talep fişinde yer almayan ek işler',
    'İş sırasında ortaya çıkan gizli hasar veya ek onarım',
  ],
} as const;

const safetyGuidanceByServiceId: Record<string, ServiceSafetyGuidance> = {
  'elektrik-arizasi': {
    title: 'Önce can güvenliği',
    body: 'Yanık kokusu, kıvılcım, duman veya ısınan kablo varsa alana ve elektrik panosuna dokunmayın. Yangın ya da can güvenliği riski varsa 112’yi arayın.',
  },
  'su-kacagi': {
    title: 'Hasarı büyütmeden önce',
    body: 'Su güvenli biçimde kesilebiliyorsa ana vanayı kapatın. Sayaç veya tesisata müdahale etmeyin; kontrol edilemeyen akışta bina yönetimine ve ilgili su idaresine haber verin.',
  },
};

export function getServiceSafetyGuidance(service?: Service | null) {
  return service ? safetyGuidanceByServiceId[service.id] : undefined;
}
