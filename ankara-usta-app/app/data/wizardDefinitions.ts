import { WizardDefinition, validateWizardDefinitions } from '../domain';
import { services } from './serviceTaxonomy';

export type { WizardDefinition, WizardQuestion } from '../domain';

const customWizardDefinitions: Record<string, WizardDefinition> = {
  'tv-duvar-montaji': {
    serviceId:'tv-duvar-montaji', intro:'Montaj kapsamını ve duvar uygunluğunu netleştirelim.',
    questions:[
      {id:'tv-size',label:'Televizyonun ekran boyutu nedir?',options:['32–49 inç','50–64 inç','65–75 inç','75 inç üzeri']},
      {id:'wall-type',label:'Montaj yapılacak duvar türü nedir?',options:['Beton / tuğla','Alçıpan','Taş / mermer','Bilmiyorum']},
      {id:'bracket',label:'TV askı aparatı hazır mı?',options:['Evet, hazır','Usta getirsin','Hangisinin uygun olduğunu bilmiyorum']},
    ],
  },
  'elektrik-arizasi': {
    serviceId:'elektrik-arizasi', intro:'Önce arızanın kapsamını ve güvenlik durumunu belirleyelim.',
    questions:[
      {id:'symptom',label:'Hangi durum yaşanıyor?',options:['Evin tamamında elektrik yok','Belirli odada elektrik yok','Sigorta sürekli atıyor','Yanık kokusu / kıvılcım var']},
      {id:'started',label:'Sorun ne zaman başladı?',options:['Şimdi / bugün','Son birkaç gün içinde','Bir süredir devam ediyor','Bilmiyorum']},
      {id:'power',label:'Şu anda ilgili hattın elektriği kapalı mı?',options:['Evet','Hayır','Nasıl kapatacağımı bilmiyorum']},
    ],
  },
  'su-kacagi': {
    serviceId:'su-kacagi', intro:'Kaçağın belirtisini ve aciliyetini keşif öncesinde netleştirelim.',
    questions:[
      {id:'sign',label:'Kaçağı nasıl fark ettiniz?',options:['Duvar / tavan ıslak','Zeminde su birikiyor','Sayaç dönmeye devam ediyor','Alt kata su sızıyor']},
      {id:'active',label:'Su akışı şu anda devam ediyor mu?',options:['Evet, aktif akıyor','Nem / damlama var','Hayır, ara sıra oluyor','Bilmiyorum']},
      {id:'valve',label:'Ana su vanasına erişebiliyor musunuz?',options:['Evet','Hayır','Yerini bilmiyorum']},
    ],
  },
  'tek-oda-boya': {
    serviceId:'tek-oda-boya', intro:'Tekliflerin aynı kapsam üzerinden hazırlanması için odayı tanımlayalım.',
    questions:[
      {id:'room-size',label:'Odanın yaklaşık büyüklüğü nedir?',options:['10 m² altı','10–20 m²','20–30 m²','30 m² üzeri']},
      {id:'surface',label:'Duvarlarda onarım gerekiyor mu?',options:['Hayır, yüzey düzgün','Küçük delik / çatlak var','Nem / kabarma var','Bilmiyorum']},
      {id:'paint',label:'Boya ve malzemeyi kim sağlayacak?',options:['Ben sağlayacağım','Usta getirsin','Tekliflerde iki seçenek de olsun']},
    ],
  },
  'bahce-kapisi': {
    serviceId:'bahce-kapisi', intro:'Onarımın kaynakla mı yoksa yeni parça ile mi yapılacağını keşifte belirleyelim.',
    questions:[
      {id:'problem',label:'Kapıdaki temel sorun nedir?',options:['Menteşe kırık / kopuk','Kapı sarktı, kapanmıyor','Kilit bölgesi hasarlı','Metal bölüm kırık / çürük']},
      {id:'material',label:'Kapının malzemesi nedir?',options:['Demir / çelik','Alüminyum','Karışık malzeme','Bilmiyorum']},
      {id:'access',label:'Keşif sırasında çalışma alanına erişim nasıl?',options:['Bahçeden kolay erişim','Apartman / site izni gerekli','Trafik veya park engeli olabilir']},
    ],
  },
  'ev-temizligi': {
    serviceId:'ev-temizligi', intro:'Süre ve ekip ihtiyacını belirlemek için evi kısaca tanımlayalım.',
    questions:[
      {id:'home-size',label:'Evin oda düzeni nedir?',options:['1+0 / 1+1','2+1','3+1','4+1 veya daha büyük']},
      {id:'frequency',label:'Nasıl bir hizmet istiyorsunuz?',options:['Tek seferlik','Haftalık','İki haftada bir','Aylık']},
      {id:'supplies',label:'Temizlik malzemeleri hazır mı?',options:['Evet, evde var','Hizmet veren getirsin','Birlikte belirleyelim']},
    ],
  },
};

export const genericWizardDefinition: Omit<WizardDefinition, 'serviceId'> = {
  intro: 'İş kapsamını birkaç kısa soruyla netleştirelim.',
  questions: [
    {id:'scope',label:'İşin mevcut durumu nedir?',options:['Yeni kurulum','Onarım / değişim','Kontrol ve değerlendirme','Bilmiyorum']},
    {id:'timing',label:'Ne zaman yapılmasını istersiniz?',options:['Mümkün olan en kısa sürede','Bu hafta','Önümüzdeki iki hafta','Tarih konusunda esneğim']},
  ],
};

export const wizardDefinitions = validateWizardDefinitions(customWizardDefinitions, services);

export function getWizardDefinition(serviceId: string): WizardDefinition {
  return wizardDefinitions[serviceId] ?? {...genericWizardDefinition, serviceId};
}
