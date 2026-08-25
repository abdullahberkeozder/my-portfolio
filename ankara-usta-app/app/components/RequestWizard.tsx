'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { Service, serviceCategories } from '../data/serviceTaxonomy';
import { WizardQuestion, wizardDefinitions } from '../data/wizardDefinitions';

type Props = { service: Service; onClose: () => void };

const districts=['Çankaya','Keçiören','Yenimahalle','Etimesgut','Mamak','Sincan','Altındağ','Gölbaşı','Pursaklar'];
const resultContent={
  package:{eyebrow:'PAKET HİZMET',title:'Doğrudan randevuya uygun',copy:'Kapsamınız standart bir işe karşılık geliyor. Sonraki aşamada uygun zamanları ve doğrulanmış hizmet verenleri görebileceksiniz.',cta:'Uygun zamanları gör'},
  quote:{eyebrow:'TEKLİF MODELİ',title:'Karşılaştırılabilir teklifler alın',copy:'Talebiniz aynı kapsam özetiyle uygun ustalara iletilecek. İşçilik, malzeme, süre ve hariç kapsam alanlarını yan yana karşılaştırabileceksiniz.',cta:'Teklif talebi oluştur'},
  inspection:{eyebrow:'KEŞİF MODELİ',title:'Önce uzman değerlendirmesi gerekli',copy:'Fiyat ve uygulama yöntemi yerinde incelemeye bağlı. Talebiniz keşif yapabilen uygun ustalarla eşleştirilecek.',cta:'Keşif talebi oluştur'},
};

const genericQuestions: WizardQuestion[]=[
  {id:'scope',label:'İşin mevcut durumu nedir?',options:['Yeni kurulum','Onarım / değişim','Kontrol ve değerlendirme','Bilmiyorum']},
  {id:'timing',label:'Ne zaman yapılmasını istersiniz?',options:['Mümkün olan en kısa sürede','Bu hafta','Önümüzdeki iki hafta','Tarih konusunda esneğim']},
];

export default function RequestWizard({service,onClose}:Props){
  const definition=wizardDefinitions[service.id];
  const questions=definition?.questions ?? genericQuestions;
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [fileCount,setFileCount]=useState(0);
  const [district,setDistrict]=useState('');
  const [neighborhood,setNeighborhood]=useState('');
  const [timing,setTiming]=useState('Bu hafta');
  const category=serviceCategories.find(item=>item.id===service.categoryId);
  const result=resultContent[service.deliveryModel];
  const scopeComplete=questions.every(question=>answers[question.id]);
  const locationComplete=Boolean(district&&neighborhood.trim());
  const summary=useMemo(()=>questions.map(question=>({label:question.label,value:answers[question.id]})),[answers,questions]);

  function filesChanged(event:ChangeEvent<HTMLInputElement>){setFileCount(event.target.files?.length ?? 0)}

  return <div className="dialog-backdrop wizard-backdrop" role="presentation" onClick={onClose}><section className="request-dialog wizard-dialog" role="dialog" aria-modal="true" aria-labelledby="wizard-title" onClick={event=>event.stopPropagation()}><button className="dialog-close" onClick={onClose} aria-label="Kapat">×</button><div className="wizard-progress" aria-label={`Adım ${step+1} / 4`}><span style={{width:`${((step+1)/4)*100}%`}}/></div><p className="wizard-step">ADIM {step+1} / 4 · {category?.name}</p>
    {step===0&&<><h2 id="wizard-title">{service.name}</h2><p>{definition?.intro ?? 'İş kapsamını birkaç kısa soruyla netleştirelim.'}</p><div className="wizard-questions">{questions.map(question=><fieldset key={question.id}><legend>{question.label}</legend>{question.options.map(option=><label className={answers[question.id]===option?'checked':''} key={option}><input type="radio" name={question.id} value={option} checked={answers[question.id]===option} onChange={()=>setAnswers(current=>({...current,[question.id]:option}))}/><span>{option}</span></label>)}</fieldset>)}</div><div className="wizard-actions"><button className="dialog-primary" disabled={!scopeComplete} onClick={()=>setStep(1)} type="button">Görsellere devam et</button></div></>}
    {step===1&&<><h2 id="wizard-title">Fotoğraf veya video ekleyin</h2><p>Görseller ustanın kapsamı daha doğru anlamasına yardımcı olur. Kişisel bilgi veya insan yüzü içermemesine dikkat edin.</p><label className="upload-zone"><input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" multiple onChange={filesChanged}/><b>Dosya seçin veya buraya bırakın</b><span>JPG, PNG, WebP veya MP4 · Bu prototipte dosyalar sunucuya gönderilmez.</span>{fileCount>0&&<strong>{fileCount} dosya seçildi</strong>}</label><div className="wizard-actions"><button className="wizard-secondary" onClick={()=>setStep(0)} type="button">Geri</button><button className="dialog-primary" onClick={()=>setStep(2)} type="button">Konuma devam et</button></div></>}
    {step===2&&<><h2 id="wizard-title">İş nerede ve ne zaman?</h2><p>Bu aşamada yalnızca yaklaşık konum alınır. Açık adres, usta seçilmeden paylaşılmaz.</p><div className="location-grid"><label>İlçe<select value={district} onChange={event=>setDistrict(event.target.value)}><option value="">İlçe seçin</option>{districts.map(item=><option key={item}>{item}</option>)}</select></label><label>Mahalle<input value={neighborhood} onChange={event=>setNeighborhood(event.target.value)} placeholder="Mahalle adı"/></label><label>Tercih edilen zaman<select value={timing} onChange={event=>setTiming(event.target.value)}><option>Bugün / acil</option><option>Bu hafta</option><option>Önümüzdeki iki hafta</option><option>Tarih konusunda esneğim</option></select></label></div><div className="wizard-actions"><button className="wizard-secondary" onClick={()=>setStep(1)} type="button">Geri</button><button className="dialog-primary" disabled={!locationComplete} onClick={()=>setStep(3)} type="button">Kapsamı incele</button></div></>}
    {step===3&&<><span className="result-eyebrow">{result.eyebrow}</span><h2 id="wizard-title">{result.title}</h2><p>{result.copy}</p><div className="scope-summary"><h3>Kapsam özeti</h3><div><span>Hizmet</span><b>{service.name}</b></div>{summary.map(item=><div key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}<div><span>Yaklaşık konum</span><b>{neighborhood}, {district}</b></div><div><span>Zaman</span><b>{timing}</b></div><div><span>Görsel</span><b>{fileCount?`${fileCount} dosya`:'Eklenmedi'}</b></div></div><div className="wizard-actions"><button className="wizard-secondary" onClick={()=>setStep(2)} type="button">Düzenle</button><button className="dialog-primary" type="button">{result.cta}</button></div></>}
  </section></div>;
}
