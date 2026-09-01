import { Service, ServiceCategory, validateServiceCatalog } from '../domain';

export type { DeliveryModel, Service, ServiceCategory } from '../domain';

export const serviceCategories: ServiceCategory[] = [
  {id:'montaj',name:'Montaj',slug:'mobilya-montaj',icon:'⌂',title:'Mobilya & montaj',description:['Mobilya, TV, perde ve raf işlerini güvenle tamamlatın.','Standart kapsamı netleştirin, uygun zaman tercihinizi talebe ekleyin.']},
  {id:'elektrik',name:'Elektrik',slug:'elektrik',icon:'⚡',title:'Elektrik',description:['Arızadan yeni kuruluma doğrulanmış elektrik ustaları.','Kapsam, gerekli malzeme ve güvenlik notları kayıt altında.']},
  {id:'tesisat',name:'Tesisat',slug:'su-tesisati',icon:'●',title:'Su tesisatı',description:['Kaçak, gider ve armatür işleri için yerel uzmanlar.','Acil durum veya keşif gereksinimini önceden belirleyin.']},
  {id:'boya-tadilat',name:'Boya & tadilat',slug:'boya-kucuk-tadilat',icon:'▧',title:'Boya & küçük tadilat',description:['Küçük yüzeylerden oda boyamaya net iş kapsamı.','Alan, boya türü ve hazırlık ihtiyacı baştan belli olsun.']},
  {id:'kaynak-demir',name:'Kaynak & kapı',slug:'kaynak-demir-kapi',icon:'⌗',title:'Kaynak, demir & kapı',description:['Kapı, korkuluk ve metal onarımları için uzman ustalar.','Yeni imalatlarda önce keşif, onarımda net teklif.']},
  {id:'temizlik',name:'Temizlik',slug:'temizlik',icon:'✦',title:'Ev & iş sonrası temizlik',description:['Gündelik, detaylı ve tadilat sonrası temizlik desteği.','Alan, ekip, süre ve temizlik malzemeleri baştan netleşsin.']},
];

export const services: Service[] = [
  {id:'mobilya-kurulumu',categoryId:'montaj',name:'Mobilya Kurulumu',slug:'mobilya-kurulumu',aliases:['dolap kurulumu','masa montajı','ikea kurulumu'],deliveryModel:'package',popularRank:1},
  {id:'tv-duvar-montaji',categoryId:'montaj',name:'TV Duvar Montajı',slug:'tv-duvar-montaji',aliases:['televizyon asma','tv askı aparatı'],deliveryModel:'package',popularRank:7},
  {id:'kornis-perde-montaji',categoryId:'montaj',name:'Korniş Montajı',slug:'kornis-perde-montaji',aliases:['perde rayı','korniş takma'],deliveryModel:'package'},
  {id:'raf-tablo-montaji',categoryId:'montaj',name:'Raf veya Tablo Montajı',slug:'raf-tablo-montaji',aliases:['duvara raf','tablo asma'],deliveryModel:'package',popularRank:8},
  {id:'avize-montaji',categoryId:'montaj',name:'Avize Montajı',slug:'avize-montaji',aliases:['lamba takma','aydınlatma montajı'],deliveryModel:'package'},
  {id:'elektrik-arizasi',categoryId:'elektrik',name:'Elektrik Arızası',slug:'elektrik-arizasi',aliases:['elektrik yok','kısa devre'],deliveryModel:'inspection',popularRank:4},
  {id:'priz-anahtar',categoryId:'elektrik',name:'Priz ve Anahtar Değişimi',slug:'priz-anahtar-degisimi',aliases:['priz bozuk','anahtar değişimi'],deliveryModel:'package'},
  {id:'sigorta-pano',categoryId:'elektrik',name:'Sigorta ve Pano Kontrolü',slug:'sigorta-pano-kontrolu',aliases:['sigorta atıyor','kaçak akım rölesi'],deliveryModel:'inspection'},
  {id:'elektrik-hatti',categoryId:'elektrik',name:'Elektrik Hattı Kurulumu',slug:'elektrik-hatti-kurulumu',aliases:['yeni hat çekme','kablo döşeme'],deliveryModel:'quote'},
  {id:'su-kacagi',categoryId:'tesisat',name:'Su Kaçağı Tespiti',slug:'su-kacagi-tespiti',aliases:['duvar ıslanıyor','tavandan su geliyor'],deliveryModel:'inspection'},
  {id:'musluk-degisimi',categoryId:'tesisat',name:'Musluk Değişimi',slug:'musluk-batarya-degisimi',aliases:['musluk damlatıyor','batarya değişimi'],deliveryModel:'package',popularRank:3},
  {id:'gider-acma',categoryId:'tesisat',name:'Gider Açma',slug:'gider-acma',aliases:['lavabo tıkalı','su gitmiyor'],deliveryModel:'package'},
  {id:'klozet-rezervuar',categoryId:'tesisat',name:'Klozet ve Rezervuar Onarımı',slug:'klozet-rezervuar-onarimi',aliases:['sifon bozuk','klozet montajı'],deliveryModel:'quote'},
  {id:'tesisat-onarim',categoryId:'tesisat',name:'Küçük Tesisat Onarımı',slug:'kucuk-tesisat-onarimi',aliases:['boru sızdırıyor','vana değişimi'],deliveryModel:'quote'},
  {id:'tek-oda-boya',categoryId:'boya-tadilat',name:'Tek Oda Boya',slug:'tek-oda-boya',aliases:['oda boyatma','duvar boyası'],deliveryModel:'quote',popularRank:2},
  {id:'duvar-alci',categoryId:'boya-tadilat',name:'Duvar ve Alçı Onarımı',slug:'duvar-alci-onarimi',aliases:['duvar deliği','alçı sıva'],deliveryModel:'quote'},
  {id:'fayans-onarimi',categoryId:'boya-tadilat',name:'Fayans Onarımı',slug:'fayans-onarimi',aliases:['kırık fayans','seramik değişimi'],deliveryModel:'quote'},
  {id:'silikon-yenileme',categoryId:'boya-tadilat',name:'Silikon Yenileme',slug:'silikon-yenileme',aliases:['banyo silikonu','duşakabin silikon'],deliveryModel:'package'},
  {id:'bahce-kapisi',categoryId:'kaynak-demir',name:'Bahçe Kapısı Onarımı',slug:'bahce-kapisi-onarimi',aliases:['demir kapı bozuk','kapı kaynağı'],deliveryModel:'inspection',popularRank:9},
  {id:'korkuluk',categoryId:'kaynak-demir',name:'Korkuluk Onarımı',slug:'korkuluk-onarimi',aliases:['balkon demiri','korkuluk kaynağı'],deliveryModel:'inspection'},
  {id:'metal-kapi-mentese',categoryId:'kaynak-demir',name:'Metal Kapı ve Menteşe Onarımı',slug:'metal-kapi-mentese-onarimi',aliases:['menteşe koptu','demir kapı sarktı'],deliveryModel:'quote'},
  {id:'ozel-demir-imalati',categoryId:'kaynak-demir',name:'Özel Demir İmalatı',slug:'ozel-demir-imalati',aliases:['demir imalat','özel kaynak işi'],deliveryModel:'inspection',popularRank:5},
  {id:'ev-temizligi',categoryId:'temizlik',name:'Ev Temizliği',slug:'ev-temizligi',aliases:['gündelikçi','ev temizletme','haftalık temizlik'],deliveryModel:'package',popularRank:6},
  {id:'detayli-temizlik',categoryId:'temizlik',name:'Detaylı Ev Temizliği',slug:'detayli-ev-temizligi',aliases:['dip köşe temizlik','bahar temizliği','boş daire temizliği'],deliveryModel:'quote'},
  {id:'tadilat-sonrasi-temizlik',categoryId:'temizlik',name:'Tadilat Sonrası Temizlik',slug:'tadilat-sonrasi-temizlik',aliases:['inşaat temizliği','boya sonrası temizlik','moloz tozu temizliği'],deliveryModel:'quote'},
  {id:'cam-temizligi',categoryId:'temizlik',name:'Cam Temizliği',slug:'cam-temizligi',aliases:['pencere temizliği','balkon camı temizliği','cam silme'],deliveryModel:'package'},
];

validateServiceCatalog(serviceCategories, services);

export const servicesByCategory = (categoryId: string) => services.filter((service) => service.categoryId === categoryId);
export const popularServices = services.filter((service) => service.popularRank).sort((a,b) => (a.popularRank ?? 99) - (b.popularRank ?? 99));
