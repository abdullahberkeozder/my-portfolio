from pathlib import Path
import json, csv, html, hashlib

P=Path(__file__).parent
H=json.loads((P/'hallmark-inventory.json').read_text(encoding='utf-8-sig'))
B=json.loads((P/'benchmark-inventory.json').read_text(encoding='utf-8-sig'))
notes='''Soğuk zemin, hizalı veri satırları, küçük vurgu|Bölge dizininde satır hizası|Veri tablosunu hero yapmak
Piksel tipografi ve koyu konser programı|Tek baskın eylem|Oyun salonu kimliği
Parfüm nesnesi, sıcak zemin, serif ve paspartu|Nesne çevresinde bilinçli boşluk|Bej ve serifin otomatik lüks reçetesi olması
Sıcak ses arayüzü ve dokunsal kontrol yüzeyi|Tutarlı ışık yönü|Hizmet aramada cihaz simülasyonu
Mimari fotoğraf üzerinde teknik çizgiler|Tek eksende hizalama|Her yere proje çizimi ve ölçü etiketi
Sıkıştırılmış başlık ve güçlü yatay kurallar|Fotoğraf ile başlık arasındaki kontrast|Afiş gibi bağıran büyük harfler
Siyah beyaz konser görseli ve sert çerçeveler|Sınırların bilinçli ritmi|Agresif köşeli görünümü aynen aktarmak
Kırmızı-sarı ürün kompozisyonu|Tek fotoğraf konusuna bağlı renk|Yüksek doygunluk ve etiket kalabalığı
Açık zeminde mavi ağ diyagramı|Sakin ikincil kontroller|Teknik şemayı dekor olarak eklemek
Koyu laboratuvar/veri ekranı|Karşılaştırılabilir satırların düzeni|Terminal yoğunluğunu tüketiciye taşımak
Krem zeminde fatura nesneleri|Birbiriyle tutarlı yumuşak gölgeler|Yeni fiş metaforu ve iç içe kartlar
Geniş siyah beyaz fotoğraf, karanlık alt alan|Fotoğrafın odak noktası ve boşluğu|Tüm uygulamayı karartmak
Pastel üç boyutlu ilaç kutuları|Konusu belli ürün fotoğrafı|Oyuncak hissi veren 3D nesneler
Ufuk fotoğrafından koyu zemine geçiş|Birleşen ışık ve ton alanı|Arama üzerine tekrar cam panel yığmak
Repair başlığı, tamir fotoğrafı, çizgili editoryal liste|İşin yapılışını gösteren fotoğraf ve kutusuz satırlar|Dar afiş fontunu bütün başlıklara taşımak
Beton fotoğrafı, koyu blok ve turuncu vurgu|Malzemenin net kadrajı|Endüstriyel sertliği ev hizmetine dayatmak
Arazi çizgileri ve kayıt düzeni|İçeriğe özgü görsel motif|Harita çizgilerini her yüzeye basmak
Yeşil, meyve fotoğrafı, açık zemin ve listeler|Yeşilin sınırlı kullanımı|Gıda kimliği ve kanıtsız büyük rakamlar
İsviçre arşivini çağrıştıran büyük yazı ve renk düzlemleri|Ortak hizalama ekseni|Kırmızı-mavi bloklarla sayfayı parçalamak
Limon makrosu, kırmızı vurgu, baskı hissi|Malzeme yakın planı|Tüm arayüze noktalı baskı filtresi
Yeşil manzara ve koyu yeşil devam alanı|Fotoğraf ile palet ilişkisi|Yeşil üstüne okunması zor yeşil yazı
Çocuk kitabı, bahçe ve renkli kartlar|Kendine özgü konu bütünlüğü|Çocuksu çizim ve etiketler
Sade araç kütüphanesi, arama ve ince çizgili liste|Az yüzeyle belirgin kontrol hiyerarşisi|Üyelik kartını hizmet kartına çevirmek
Fırın/atölye fotoğrafı, koyu sıcak ton|Malzeme ve üretim anı|Her yeri ağır ve karanlık yapmak
Dokuma fotoğrafı ve süreç görüntüleri|Dokuyu fotoğrafın içinde bırakmak|Sayfa geneline yapay kumaş/gren katmanı
Koyu altyapı diyagramı ve pembe vurgu|Tekrar eden elemanlarda ölçü tutarlılığı|SaaS altyapı estetiği
Büyük siyah-krem-kırmızı manifesto|Az unsurla güçlü odak|Hizmet sitesini politik afiş gibi yapmak
Lacivert ürün ekranı ve ince geometrik başlık|Tonlar arasında disiplin|İnce yazılı teknik ürün kimliği
Gazete sütunları, kent fotoğrafı, serif|Bölümleri kutu yerine tipografiyle ayırmak|Resmî sicil/gazete kimliğine dönüşmek
Bant fotoğrafı, büyük yazı ve renkli bilet|Tek baskın fotoğraf|Bilet ve festival görsel dili
Eğik yayın fotoğrafı ve sarı etiket|Malzemeye bağlı renk seçimi|Rastgele dönük kartlar
Kayak fotoğrafı, mavi-beyaz ve güçlü başlık|Fotoğraflarda benzer ışık|Spor afişi tonu
Koyu mavi manzara ve ses kontrolleri|Az ve sakin vurgu|Uyku uygulaması görünümü
Uydu makrosu, siyah alan ve turuncu detay|Nesne için kesintisiz geniş alan|Teknik istatistik bölümleri eklemek
Pembe-mavi baskı ve doku|Tek bir görsel üretim tekniği|Duotone ve grenle premium taklidi
Şişe/armut fotoğrafı ve sıcak ışık geçişi|Konunun çevresinde ışıkla boşluk oluşturmak|Altın parlama efektleri
Yazı karakteri örnekleri ve büyük serif|Harf/satır oranlarının bilinçli seçimi|Serif eşittir premium varsayımı
Koyu şarap fotoğrafı ve fiyat yüzeyi|Sınırlı renk ailesi|Yiyecek/içecek atmosferi
Lacivert koşucu fotoğrafı ve sarı|Tekrarlanan fotoğraf kadrajları|Spor performans göstergeleri
Yeşil meyve fotoğrafı, kompakt form, büyük fiyat|Fotoğraf ile aksiyon renginin ilişkisi|Doğrulanmamış fiyatı dekor yapmak
Elde ürün, pembe-yeşil ve dönük etiketler|Konusu belli fotoğraf|Dekoratif sticker ve rozetler
Tipografi ölçüm çizgileri ve açık zemin|Görünmeyen hizalama disiplini|Ölçüm cetvelini kullanıcının önüne taşımak
Yeşil-siyah ASCII ve kod|Sınırlı palet ilkesi|Geliştirici terminali estetiği
Taş/ahşap örnekleri, keskin çerçeveler ve katalog|Gerçek malzeme yakın planları ve düzenli dizin|Örnek paspartusu ve sert gölgeyi aynen kopyalamak
Mor ses dalgası ve ürün arayüzü|Birincil/ikincil ağırlık ayrımı|Mor palet ve teknolojik ışık
Kahve fotoğrafı ve belirgin krem form yüzeyi|İlişkili içerikleri tek yüzeyde gruplamak|Her gruba yeni çerçeve
Tren fotoğrafı, yön kartı ve mavi eylem|Yönlendirmede net yazı hiyerarşisi|İstasyon tabelası görünümü
Atölye fotoğrafı, güçlü sans, renkli kategori ve tablo|Zanaatı iş anıyla göstermek|Kategorilere rastgele ana renkler atamak'''
N=[s.split('|') for s in notes.splitlines()]
assert len(N)==48
bn='''Koyu zeminde sakin başlık ve ürün ekranı|Renk sayısını azaltmak; karanlık temayı kopyalamamak
İnce ızgara çizgileri, açık zemin ve renkli kompozisyon|Çizgiler premium görünümle çelişmiyor; moru taşımamak
Ortalanmış ürün ve geniş tek ton alan, aşağıda zemin değişimi|Özne ile boşluk oranı; bütün sayfa kenarlıksız değil
Geniş nesne fotoğrafı ve az sayıda eylem|Tek görsel odak; konteyner metaforunu almamak
Dış kart kutusu olmadan fotoğraf ve yakın metadata|İçeriğin çerçevesiz de gruplanabilmesi
Geniş moda fotoğrafı ve üst üste logo/yazı|Fotoğraf sanat yönetimi; düşük okunurluğu kopyalamamak
Beyaz başlık alanı ve taş duvar önünde büyük insan fotoğrafı|Malzeme/ışık birlikteliği; bej palet sonucu çıkarılamaz
Yan yana iki portre, küçük navigasyon, az yazı|Fotoğraf dizisinde ölçü ve renk ilişkisi
Pembe ağırlıklı geniş fotoğraf ve beyaz başlık|Premium her zaman nötr değildir; bizim marka rengimiz ayrı
Yoğun başlık/navigasyon ve kırmızı kampanya alanı|Kategoriye bağlı yoğunluk; minimalizmin evrensel olmadığını gösterir
Yeşil arama, kategori ikonları ve yardımcı şekiller|Ana eylemin marka rengi; süsleri almamak
Koyu fotoğraf üstünde arama, yeşil eylem|Arama ve zemin ayrımı; yeni güven vaatleri eklememek
Koyu veranda fotoğrafı, beyaz arama yüzeyi|Kontrastı kompozisyonla kurmak; rakamları kopyalamamak
Cloudflare doğrulama ekranı|Landing page kanıtı DEĞİL; değerlendirmeden çıkarıldı
Çerez katmanı hero alanını örtüyor|Kısmi kanıt; tam yerleşim değerlendirmesine alınmadı'''
BN=[s.split('|') for s in bn.splitlines()]

# Codes are qualitative lens judgements, not scores or empirical user results.
lenses=['Sanat yönetimi','Tipografi','Fotoğraf','Kompozisyon','Marka','Kontroller','Hiyerarşi','Mobil','Erişilebilirlik','İtidal']
raw='''01|Temiz, kesintisiz ana zemin|H23 B05 B08|Sayfa genelindeki gren ve yinelenen yüzey efektlerini kaldır; dokuyu yalnız fotoğrafta bırak.|DND DDNDDDD|Düzlük riski fotoğraf ve boşlukla çözülmeli, yeni efektle değil.
02|Renklerin görevlerini sabitle|H18 B11 B12|Ana eylem yeşil, logo mavi, metin koyu nötr; pirinç, espresso ve lacivert CTA yarışını bitir.|DNNDDDDDDD|Logo rengini değiştirme; yeşilin her yere yayılması da çözüm değil.
03|Tipografiyi rollere göre yeniden kur|H23 H37 B05|Mevcut serifleri premium kanıtı sayma. Bir başlık ailesi ve sade okuma/kontrol ailesi; sicil/mono katmanını azalt.|DDNDDDDDDD|Serif tamamen yasak değil; Türkçe harfler ve mobil satır kırılması karşılaştırılmalı.
04|Hero için tek fotoğraf–başlık kompozisyonu|H25 B13 B07|Ortalanmış başlık ve arama korunur; metin arkasında sakin kadraj, daha az opak yüzey ve daha az dekoratif satır.|DNDDDDDKKD|Arama sınırı ve yazı kontrastı kaybolmamalı; fotoğraf kadrajı mobilde ayrı seçilmeli.
05|Tek fotoğraf sanat yönetimi|H15 H25 H48 B08|İşin sonucu ile yapılışını aynı doğal ışık ve renk sıcaklığında göster; rastgele steril oda kolajını bırak.|DNDDDNDDKD|Yeni üretim bu adımda yok. Gerçek iş/temsili görsel ayrımı korunmalı; kaynak hakkı kontrol edilmeli.
06|Fotoğraf ve açıklamayı dış kutudan kurtar|B05 H15 B08|Çift çerçeve, paspartu ve kart gölgesini kaldır; fotoğrafın altında yakın başlık–usta ilişkisi kur.|DDDDNDDDKD|Kart tıklanabilirliği ve kaydetme hedefi görünür kalmalı; kaynakların kendisi tümüyle çerçevesiz değil.
07|Bölge alanını sakin bir dizine dönüştür|H23 H01 H44|Bölge kutusu içindeki ilçe butonlarını ortak zeminde hizalı bağlantı satırlarıyla sun; yeni rota ekleme.|DDNDDDDKKD|Mobilde yatay tablo kullanılmamalı; bağlantı hedefleri küçültülmemeli.
08|Tek, ölçülü kontrol geometrisi|H23 B11 B05|Butonları düz dolgu/ikincil çizgi/metin önceliğinde bir aileye bağla; kabartma ve çifte konturu azalt.|DDNDDDDKKD|Köşe biçimi tek başına premium yaratmaz; odak halkası ve dokunma alanı korunmalı.
09|Kategori seçiminde tipografik sekmeler|H15 B05|Her kategoriyi kutulamak yerine metin, boşluk ve tek etkin işaretle ayır; davranışı koru.|DDNDDDDKKD|Sadece renk ile seçim gösterilmemeli; görsel sekme olması otomatik ARIA tab gerektirmez.
10|Mobil hero için bağımsız kompozisyon|B05 H23|Aynı başlık–arama ilişkisini korurken hızlı örneklerin dikey yığınını azalt; keşif fotoğrafına daha erken yer aç.|DND DDDDKKD|Yazıyı ve hedefleri küçültmek çözüm değil; küçük/yatay ekranlarda ayrıca doğrulanmalı.
11|Tüm sayfayı kenarlıksız yapmak|B08 H23|Her çerçeve ve ayracı kaldırıp sadece boşluk kullan.|KNNKDKKKRK|Seçim/arama grupları belirsizleşebilir. Finalde seçici çerçeve azaltma tercih edildi.
12|Tüm köşeleri gerçek squircle yapmak|B03 H03|Kontrollerde tek eğrilik yaklaşımı denemek.|KNNKNK NKKK|Etkisi fotoğraf ve tipografiden küçük; screenshot gerçek eğri matematiğini kanıtlamaz.
13|Protokoldeki koyu sayısal bloğu hafifletmek|H15 H23|07 kutusunu ve mühür benzeri alanı kaldırıp mevcut maddeleri doğrudan zemine yerleştirmek.|DDNDDNDDKD|İçerik iddiaları ayrıca doğrulanmalı. Final 01/03/07 ilkeleriyle ikinci dilime alındı.
14|Harf avatarlarını sade imza satırına çevirmek|B05 H15|Fotoğrafı olmayan ustalarda harf diski yerine isim/yer tipografisini sakinleştirmek.|DDNDDNDDKD|Gerçek insan bağını zayıflatabilir; varsa gerçek profil fotoğrafı öncelikli. Final 06 alt çalışması.
15|Tek büyük fotoğraf yerine eş ölçekli keşif dizisi|B05 B08|Dev raf kartı yerine benzer fotoğraf ağırlıklarıyla ritim kurmak.|DNDDNNDDKD|Salt kolon sayısı değişikliği yetmez; final 05/06 sonrasında denenebilir.
16|Bir süreç/sonuç fotoğraf çifti|H15 H25 B08|Aynı işi bitmiş mekân ve çalışma anıyla iki fotoğrafta anlatmak.|DNDDNNKKKD|Aynı işe ait iki doğrulanmış fotoğraf yoksa sahte önce/sonra üretilmemeli.
17|Malzeme makrosuyla zanaat vurgusu|H44 H24|Ahşap bağlantı veya işçilik yakın planını bir fotoğraf odağı yapmak.|DNDDDNKKKD|Hizmetin ne olduğu kaybolabilir; hero için otomatik doğru değil.
18|Büyük harfli teknik etiketleri sakinleştirmek|H23 H01|Malzeme/bağlantı/standart etiketlerinin ağırlığını ve satır yoğunluğunu azaltmak.|DDNDDNDDKD|Teknik bilgiye ihtiyaç duyan kullanıcı için okunurluk korunmalı; final 03/06 içinde.
19|Bölüm başlarında tek çizgi ağırlığı|H15 H44 B02|Kalın kesikler yerine gerekli yerlerde bir tutarlı ince ayraç kullanmak.|DDNDDNDDKD|Her başlığa çizgi de şablonlaşır; final 01/07 kapsamında.
20|Ortak hizalama rayları|H19 H42|Hero, keşif, bölge ve footer kenarlarını tek genişlik sistemine oturtmak.|DDNDDNDDDD|Temel kalite koşulu; bağımsız yeni estetik yön değil, finalin tamamına uygulanır.
21|Başlıklar arasında kontrollü ölçek farkı|H23 H37|Hero, bölüm, kart başlığı ölçülerini görünür ama sakin bir ritme bağlamak.|DDNDDNDDKD|Aşırı büyük display mobil taşmaya yol açar; final 03 altında.
22|Header ve footer marka tutarlılığı|B07 B08|Üstte mavi, altta kahverengi görünen marka ve farklı konturları aynı role bağlamak.|DNNDDNDDDD|Yeni logo tasarımı gerekmiyor; final 02 altında.
23|Tam ekran moda benzeri hero|B06 B09|Fotoğrafı ilk ekranın tamamına yaymak.|DNDKKNKRKK|Keşif gecikir ve arama ağırlaşır; mevcut kapsayıcı ve ortalama korunmalı.
24|Koyu tema ile dramatik dönüşüm|H12 H24 B01|Tüm zemini koyulaştırıp fotoğrafları parlatmak.|KNKKRKKKKR|Yeşil ev hizmeti kimliği ve gündelik kullanım yerine atölye sergisine kayar; elendi.
25|Bej–pirinç lüks paleti|H03 H36|Kontrolleri espresso, detayları altın yapmak.|KNNKRKKKKR|Mevcut kimlik kaymasının nedeni; elendi.
26|Serif ağırlıklı editoryal marka|H29 H37|Slogan, bölüm ve kart başlıklarının tamamını serif yapmak.|KKNKKKKKKK|Mevcut serif kullanımını çoğaltmak gözlenen sorunu çözmüyor; rol bazlı 03 seçildi.
27|Butonlarda 3D cam/kabartma|H04 H13|Her kontrolü ışıklı dokunsal nesneye dönüştürmek.|KNNKRKKKKR|Katman kalabalığını artırır; kullanıcının önceki cam fikri bütün kontrollere yayılmamalı.
28|Seyrek, içeriğe bağlı hareket|H33 H14|Görsellerde geçiş veya seçili durumda küçük hareket düşünmek.|KNNKNKKKKK|Statik arşiv hareketi kanıtlamıyor; temel görünüm çözülmeden öncelik değil.
29|Sicil/katalog seri numaralarını kaldırmak|H23 B05|2026, Bölge 01 ve mühür benzeri süslerin görsel ağırlığını kaldırmak.|DDNDDNDDKD|Operasyonel olarak gerekli kayıt bilgisi varsa korunmalı; final 03/07 kapsamında.
30|Keşifte kaydetme işaretini fotoğrafa daha hafif bağlamak|B05 B08|Büyük beyaz kare yerine görüntüye uyan sakin tek ikon yüzeyi tasarlamak.|DND DND DKKD|İkonu kontrastsız bırakmamak ve hedefi küçültmemek şart; final 06/08 altında.'''
ideas=[]
for line in raw.splitlines():
    n,title,refs,proposal,code,risk=line.split('|'); code=code.replace(' ',''); assert len(code)==10,(n,code)
    ideas.append(dict(id='I'+n,title=title,refs=refs.split(),proposal=proposal,lenses=list(code),risk=risk,selected=int(n)<=10))
assert len(ideas)==30
source={h['id']:h['image'] for h in H}
source.update({b['id']:'evidence/benchmarks/'+b['file'] for b in B})
def img(ref): return source[ref]
def links(refs): return ', '.join(f'[{x}]({img(x)})' for x in refs)

atlas=['# Hallmark: 48 örneğin görsel atlası\n','Kaynak: [Nutlope/Hallmark](https://github.com/nutlope/hallmark). Bunlar yerel Hallmark paketindeki örnek sayfa JPG’lerinin değişmeden alınmış kopyalarıdır; 48 çalışan siteye bugün girilip alınmış yeni ekran görüntüleri değildir. Tema metinleri envanterde saklanır. Sekiz temas sayfasında tüm örnekler incelendi; seçili güçlü adaylar ayrıca tam boy açıldı. Statik görüntüden hover, dönüşüm veya performans sonucu çıkarılmaz.\n']
for h,n in zip(H,N):
    associated=[i['id'] for i in ideas if h['id'] in i['refs']]
    atlas += [f"## {h['id']} · {h['name']}\n",f"![{h['name']}]({h['image']})\n",f"**Gözlem:** {n[0]}.\n\n**Orkestra’ya alınabilir:** {n[1]}.\n\n**Alınmamalı:** {n[2]}.\n\n**Fikir bağı:** {', '.join(associated) or 'Ana yön için seçilmedi; dar bir biçim ilkesi dışında sektör uyumu zayıf.'}\n"]
(P/'HALLMARK-48-ATLAS.md').write_text('\n'.join(atlas),encoding='utf-8')
atlas=['# Arşivdeki 15 platform görüntüsü\n','Bunlar kullanıcının Brain arşivindeki tarihsel yakalamalardır. Güncel sitelerin tamamının canlı denetimi değildir. B14 geçersiz, B15 kısmi: 13 kullanılabilir karşılaştırma, iki kanıt kısıtı.\n']
for b,n in zip(B,BN):
    atlas += [f"## {b['id']} · {b['file']}\n",f"![{b['id']}]({source[b['id']]})\n",f"**Gözlem:** {n[0]}.\n\n**Çıkarım ve sınır:** {n[1]}.\n"]
(P/'BENCHMARK-ATLAS.md').write_text('\n'.join(atlas),encoding='utf-8')
with (P/'IDEA-MATRIX.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(['ID','Fikir','Kaynaklar',*lenses,'Karar','Gerekçe/koşul'])
    for i in ideas:w.writerow([i['id'],i['title'],' '.join(i['refs']),*i['lenses'],'Final 10' if i['selected'] else 'Ertelendi/birleştirildi/elendi',i['risk']])
(P/'ideas.json').write_text(json.dumps(ideas,ensure_ascii=False,indent=2),encoding='utf-8')

report='''# Orkestra — estetik yönü yeniden kurmak

27 Ekim 2026 · Gözlem, karşılaştırma ve tasarım kararı · Uygulama koduna değişiklik yok

## Ana teşhis

Mevcut sayfa eksik süsten değil, birbiriyle yarışan tasarım dillerinden zayıflıyor. Fotoğraflı hizmet keşfi; sicil/standart etiketleri, serif editoryal başlıklar, teknik mono yazılar, çift çerçeveli kartlar, pirinç detaylar, mavi logo ve koyu ana butonla aynı anda anlatılıyor. Her unsur tek başına savunulabilir; birliktelikleri tutarlı bir ürün kimliği kurmuyor.

Önerdiğim yön **aydınlık, fotoğrafı öne çıkaran, yeşil eylemleri olan çağdaş bir ev hizmetleri ve keşif ürünü**. Yenilik, daha önce görülmemiş buton şeklinde değil; gerçek işçilik fotoğrafı, sakin bilgi düzeni ve aramadan keşfe kesilmeyen kompozisyonun Orkestra’ya özgü birleşiminde aranmalı. Bu bir tasarım hipotezidir; kullanıcı araştırması veya dönüşüm artışı sonucu değildir.

## Kanıt kapsamı

- Canlı `/` sayfasından yeni masaüstü (1440 × 1000 viewport) ve mobil (390 × 844 viewport) tam sayfa yakalama alındı. Masaüstü PNG içerik genişliği kaydırma alanı nedeniyle 1425 px. Sadece ana sayfanın varsayılan hali incelendi; wizard ve tüm route’lar tekrar test edilmiş sayılmıyor.
- Hallmark’ın yerel paketindeki **48 görselin tamamı** sekiz temas sayfasında tarandı, her birine ayrı gözlem/alınacak/alınmayacak kararı yazıldı. Güçlü adayların bir bölümü tam boy incelendi. Bu bir **48 örnek görsel atlası**, 48 canlı sitenin etkileşim testi değildir.
- Brain arşivinden **15 platform yakalaması** seçildi. MyBuilder görüntüsü güvenlik doğrulama ekranı; Airtasker çerez katmanıyla örtülü. Bu iki görsel tam landing karşılaştırmasına alınmadı.
- Kullanıcının saydığı beş rapor okundu. Arşivin tamamının her karesini incelediğimizi iddia etmiyoruz. Doğrudan Brain kökünde 430 PNG, 119 WebP, 22 JPG; `.tempmediaStorage` içinde 761, `.user_uploaded` içinde 42 giriş envanterlendi. Bunlar benzersiz/tamamen incelenmiş görsel sayıları değildir. WebP dosyalarının tamamının video olduğu da doğrulanmadı.
- Gemini 3.8 Flash High ile bağımsız değerlendirme ve ardından Codex itirazlarına yanıt olmak üzere iki tur yürütüldü. **On bakış açısı on ayrı insan uzman değildir**; aşağıdaki fikirler on analitik mercekle değerlendirildi.

[Görsel atlas — 48 Hallmark](HALLMARK-48-ATLAS.md) · [Platform atlası](BENCHMARK-ATLAS.md) · [30 × 10 değerlendirme CSV](IDEA-MATRIX.csv) · [Görsel okuma dosyası](index.html)

## Mevcut sayfanın baştan aşağı değerlendirmesi

### 1. Header ve hero

![Mevcut masaüstü üst alan](evidence/current/desktop-part-1.png)

**Korunacak:** Ortalanmış slogan–arama ilişkisi, hizmeti yazabilme, fotoğrafla ev/zanaat bağlamı, mavi Orkestra işareti. Bunlar yeniden özellik tasarlamayı gerektirmiyor.

**Sorun:** Üstteki “doğrulanmış usta ve zanaatkâr sicili · 2026” satırı, serif slogan, koyu CTA ve çerçeveli örnekler birbirinden farklı seslerde konuşuyor. Sayfa üzerinde görülen gren/beneklenme temiz yüzey algısını zayıflatıyor; hangi CSS katmanından geldiği bu salt görsel denetimde teşhis edilmedi. Koyu arama butonu ve alttaki yeşil eylem farklı öncelik sistemleri kuruyor.

**Referans farkı:** Ink az sayıda tipografik rolle aramayı görünür kılıyor. Thumbtack metin arkasındaki fotoğraf tonunu kontrol ediyor. Massimo Dutti’de ayrı süs katmanları yerine tek güçlü fotoğraf var. Bunlardan alınacak şey yazı tipi veya fotoğrafın kendisi değil; az sayıda odak ve bilinçli kadraj.

### 2. Keşif fotoğrafları ve kartlar

![Keşif ve bölge başlangıcı](evidence/current/desktop-part-2.png)

**Korunacak:** Raf, batarya, boya ve montaj gibi somut iş örnekleri. Fotoğraf görmek platformun sosyal keşif yönünü destekliyor.

**Sorun:** Fotoğrafın çevresinde beyaz paspartu, sınır, gölge ve dış kutu üst üste. Büyük ilk kart diğerlerini bastırırken teknik özellik satırları ürün kataloğu hissi veriyor. Harf avatarı gerçek usta kişiliği taşımıyor; fakat sırf estetik için kimliği tümüyle silmek de doğru değil. Kaydetme ikonunun beyaz yüzeyi fotoğrafın önemli bir parçası haline geliyor.

**Referans farkı:** Airbnb fotoğraf ile kısa metni yakın tutuyor; dış çerçeve olmadan gruplama okunuyor. COS iki fotoğrafın ışık/kadraj ilişkisiyle düzen kuruyor. Editorial işin yapılışını gösteriyor. Terrazzo malzemenin kendisini net gösterse de çerçeve ve sert gölge kullanıyor: onu “çerçevesiz kart” kanıtı olarak sunmak yanlış olur.

### 3. Bölgesel alan

![Bölge ve protokol](evidence/current/desktop-part-3.png)

Dört bölge kutusu, iç çizgi ve yeniden kutulanan ilçe bağlantıları sayfayı parçalı bir kontrol paneline yaklaştırıyor. Sınırlar kaldırılınca her şeyi tek paragraf yapmak gerekmez: Ink’in liste hizası ve Terrazzo’nun katalog satırı ilişkisi, **mobilde tabloya dönüşmeden**, bağlantıların ortak zeminde okunmasını sağlayabilir. Coğrafi gruplamanın doğruluğu ayrı ürün kararıdır; estetik adına yeni coğrafi sınıflandırma icat edilmez.

### 4. Protokol, alt açılır alan ve footer

![Alt sayfa](evidence/current/desktop-part-4.png)

Koyu “07” alanı fotoğraflarla yarışan ikinci bir kahraman bölüm gibi. Mühür, sicil kodu ve sert kurallar resmi kurum dili yaratıyor. Premium algıyı bu bürokratik süsler üzerinden kurmayı önermiyorum. Mevcut bilgilerin gerekli olanları tipografik listeyle daha hafif sunulabilir. “1 yıl”, “140+ doğrulanmış usta”, standart ve garanti ifadeleri bu denetimde doğrulanmadı; tasarım kanıtı sayılmamalı. Footer’daki kahverengi logo üstteki mavi kimlikten ayrılıyor.

### 5. Mobil

[390 px tam sayfa kanıtı](evidence/current/live-390.png)

Üstte menü kapsülü, sonra uzun hero, arama ve ilçe alanları, dolu buton, ardından dikey örnekler geliyor. İlk keşif fotoğrafı ilk ekranın altında kalıyor. Bu tek başına evrensel hata değildir; ancak kullanıcının sosyal keşif hedefiyle gerilim yaratıyor. Çözüm küçük yazı ve küçük dokunma alanı değil, masaüstündeki her satırı telefonda da aynen yığmamak. İki platform benchmark’ının masaüstü görüntüsü onların mobil başarısına kanıt olarak kullanılamaz.

## “Continuous border” fikrine yanıt

Üç kavramı ayıralım: **sürekli zemin** (bölümler aynı görsel alanı paylaşır), **seçici sınır** (yalnız anlamlı grupları ayırır), **sürekli köşe eğrisi** (köşenin geometrisi). Biri diğerini gerektirmez. Standart `border-radius` değeri vermek gerçek squircle uygulandığını kanıtlamaz. Apple ekranında bölüm zeminleri değişiyor; Stripe’da ızgara çizgileri var; Hallmark Ink, Editorial ve Terrazzo çizgi kullanıyor. Bu nedenle “bütün premium siteler sınır kullanmaz” sonucuna katılmıyorum.

Senin gözleminin yararlı çekirdeği şu: **her bileşen kendini ayrı bir kutu olarak ilan etmek zorunda değil.** Orkestra’da fotoğraf grupları boşlukla, dizin satırları gerektiğinde çizgiyle, arama ise görünür bir kontrol yüzeyiyle tanımlanabilir. Bu, her şeyi görünmez hale getirmeden bütünlük sağlar.

## Önceki raporlara dürüst düzeltmeler

| Belge | Yararlı taraf | Düzeltilmesi gereken |
|---|---|---|
| Anti-slop premium master | Sektör, lüks ve dijital referansları birlikte toplaması | Kesin piksel, font ve dönüşüm sonuçları her zaman yakalamayla desteklenmiyor. MyBuilder güvenlik ekranı tasarım kanıtı değil. Massimo beyaz header’ından bej token sonucu çıkarılamaz. |
| Continuous squircle | Köşe tutarlılığını gündeme alması | 20 px radius tek başına sürekli eğrilik değildir. Her yüzeyin aynı geometriyi taşıması da zorunlu değil. |
| Honest debate & synthesis | Yüzey yükünü azaltma niyeti | Yeşili espresso/pirinçle değiştirme önerisi sonra yeşili koruma kararıyla çelişiyor. Rol isimleri gerçek uzman araştırması yerine geçmez. |
| Wizard premium audit | Adım ekranlarını kayıt altına alması | Native select otomatik olarak kötü değildir; otomatik ilerleme yeni davranıştır. “Bilişsel yük sıfırlanır”, hız/fiyat vaatleri doğrulanmamış. Ahşap/pirinç dekorunu tüm kontrole taşımak kimlik kaymasına yol açabilir. |
| Sabit fiyat 7 platform | Bölünmeyen fiyat ve hizalı kart gibi somut sorunlar | Rakipler için kesin font/radius/garanti değerleri doğrulanmalı. Her CTA’yı dolu yeşil yapmak eşitliği sağlar ama sayfada aşırı eylem ağırlığı da yaratabilir. |

Bu belgelerdeki geçmiş test geçişleri bu çalışma sırasında tekrar doğrulanmadı. Belgeler karar geçmişidir; otomatik uygulama talimatı değildir.

## Codex–Gemini karşılıklı inceleme

[İlk Gemini görüşü, değişmeden](GEMINI-INDEPENDENT-REVIEW.md) ve [itiraza yanıtı](GEMINI-COUNTER-REVIEW.md) saklandı. İlk görüşte serif başlıkların sans-serif diye okunması, koyu hero yazısının beyaz diye anlatılması ve yuvarlak dikdörtgenlerin genel olarak kapsül diye adlandırılması hataydı. Codex bunları reddetti; Gemini ikinci turda düzeltti.

**Uzlaşı:** Dış kutuların azaltılması, fotoğraf yönetimi, kontrollerin tutarlılığı, bölge/protokol alanının hafiflemesi. **Kabul etmediğim öneriler:** Otomatik serif ve mono mikro yazı eklemek, bütün harf avatarlarını koşulsuz silmek, “resmî sicil” kimliğini güçlendirmek. Bunlar kullanıcının sosyal hizmet ürünü hedefini tekrar daraltır. İkinci turdaki “bilişsel yükü azaltır” ifadesini de ölçülmüş sonuç değil hipotez olarak alıyorum. Görsel sekme kullanmak otomatik `tablist` semantiği gerektirmez; mevcut filtre davranışına göre seçilmelidir.

## 30 fikir / 10 değerlendirme merceği

Mercek sırası: **SY** sanat yönetimi, **T** tipografi, **F** fotoğraf, **K** kompozisyon, **M** marka, **B** kontroller, **H** hiyerarşi, **Mo** mobil, **E** erişilebilirlik, **İ** itidal. **D:** destekleniyor; **K:** koşullu/riskli; **N:** doğrudan etkisi yok; **R:** bu kapsamda reddediliyor. Bu harfler test sonucu veya kullanıcı puanı değildir. Her fikir tüm on mercekte düşünülmüş, risk sütununda belirleyici karşı gerekçe verilmiştir. Final ilk on, yalnız harf toplamıyla değil bağımsız görsel etkisi, sektör uyumu ve mevcut kimliğin korunmasıyla seçildi.

'''
report+='| Fikir | Öneri ve kanıt | SY T F K M B H Mo E İ | Eleme / koşul |\n|---|---|---|---|\n'
for i in ideas: report+=f"| **{i['id']} · {i['title']}** | {i['proposal']} {links(i['refs'])} | {' / '.join(i['lenses'])} | {'**Final 10.** ' if i['selected'] else ''}{i['risk']} |\n"
report+='\n## Nihai 10: birlikte uygulanabilecek görsel yön\n\nBunlar yeni buton/rozet/akış ekleme listesi değildir. Uygulama öncesi aynı içerikle çizilecek tasarımın kararlarıdır. Aşağıdaki referanslar önerinin kendisinin ekran görüntüsü değil, ilham kanıtıdır.\n'
checks=[
'Zemin üzerinde doku katmanı ve her bölümde yeni kart kabuğu yok; fotoğraf hâlâ derinlik sağlıyor.',
'Header/footer aynı marka; birincil eylem her yerde aynı yeşil rolünde, diğer renkler onunla yarışmıyor.',
'Hero, bölüm ve kart başlığı rolleri aynı kurala bağlı; büyük harf/mono metin ancak gerekçeli yerde kalıyor.',
'Slogan ve arama tek odak olarak okunuyor; yazının arkasında ikinci bir dekoratif plaka gerekmiyor.',
'Yan yana işler benzer ışık/renk sıcaklığında; fotoğraf hangi işi gösterdiğini açıklıyor; temsili etiketler dürüst.',
'Fotoğraf–başlık–usta bir grup olarak okunuyor; kutu kaldırılınca kart sınırı ve kaydetme hedefi kaybolmuyor.',
'İlçe bağlantıları kutu içinde kutu olmadan taranabiliyor; mobilde okunaklı ve yeterli dokunma alanıyla kalıyor.',
'Ana/ikincil/metin eylemleri aynı aile; köşe, yazı, yükseklik ve odak görünümü birbiriyle tutarlı.',
'Etkin kategori yalnız renkle değil işaretle belirgin; seçilmemiş kategoriler pasif/disabled sanılmıyor.',
'390 px kompozisyonda büyük boşluk ve örnek yığını azaltılmış; metin veya dokunma hedefi küçültülmeden fotoğraf daha erken görünüyor.'
]
for i,c in zip(ideas[:10],checks):
    report+=f"\n### {i['id']} · {i['title']}\n\n{i['proposal']}\n\n**İlham:** {links(i['refs'])}.\n\n![{i['refs'][0]} ilham kanıtı]({img(i['refs'][0])})\n\n**Sınır:** {i['risk']}\n\n**Sonraki tasarımda bakılacak:** {c}\n"
report+='''
## Sonraki çalışma için sözleşme — bu turda uygulanmadı

Önce aynı içerik ve var olan eylemlerle masaüstü ve mobil tek bir kompozisyon hazırlanmalı. Başlangıç yönü Ink’in kontrol sakinliği + Editorial/Loom’un iş fotoğrafı + Airbnb/COS’un fotoğraf/altyazı oranı. Bunları dört ayrı tema olarak üst üste koymamalıyız. Bej/pirinç makyajı, yeni slogan, yeni rozet, yeni fiyat veya yeni özellik yok.

İlk karşılaştırma mevcut ekran ile önerilen ekranı aynı içerik ve viewport’ta göstermeli. İnceleme soruları: marka ilk bakışta tutarlı mı; fotoğraf mı dekor mu baskın; arama hâlâ görünür mü; kart grupları kutusuz okunuyor mu; mobilde ilk iş örneği gereksiz yere gecikiyor mu? Bundan sonra erişilebilirlik ölçümleri ve kullanıcı görevi denemeleri yapılabilir. Bu tur kod, canlı tasarım değişikliği, commit veya push içermedi.

## Kaynaklar ve izlenebilirlik

- [Hallmark repo](https://github.com/nutlope/hallmark): 27 Ekim erişimi, 48 tema kataloğu doğrulandı. Temalar hazır ürün akışı yerine malzeme/görsel dil örnekleridir. Bu raporun uzun görsel yorumları yerel görüntü incelemesidir, README özeti değildir.
- [SHA-256 kaynak manifesti](SOURCE-MANIFEST.json): orijinallerin kopyalarla eşleşmesi, boyutlar ve dosya yolları.
- [Hallmark tema/spec envanteri](hallmark-inventory.json), [platform envanteri](benchmark-inventory.json), [fikir verisi](ideas.json).
- Arşiv ekranları araştırma kanıtıdır. Marka görsellerini uygulamanın ticari görseli olarak kullanma kararı verilmedi. Fotoğrafın kullanımı ayrı lisans/atıf kontrolü gerektirir.
'''
(P/'REPORT.md').write_text(report,encoding='utf-8')

esc=html.escape
def picture(path,label):return f'<a href="{esc(path)}"><img loading="lazy" src="{esc(path)}" alt="{esc(label)}"></a>'
page='''<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Orkestra — estetik araştırma atlası</title><style>
*{box-sizing:border-box}body{margin:0;background:#f6f7f4;color:#18241f;font:16px/1.6 system-ui,sans-serif}main{max-width:1240px;margin:auto;padding:48px 24px}h1{font-size:clamp(32px,5vw,60px);line-height:1.08;max-width:900px;letter-spacing:-.04em}h2{font-size:30px;margin-top:70px}h3{line-height:1.3}p{max-width:85ch}a{color:#146448;text-underline-offset:4px}nav{display:flex;gap:20px;flex-wrap:wrap;border-block:1px solid #cdd5cf;padding:18px 0;margin:32px 0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}.current{display:grid;grid-template-columns:3fr 1fr;gap:24px}.current img{width:100%;max-height:700px;object-fit:contain;object-position:top;background:#e7ebe7}.grid img{width:100%;height:350px;object-fit:contain;background:#e7ebe7}.grid article{border-top:1px solid #cbd4ce;padding-top:16px}small{color:#526358}.idea{border-top:1px solid #bac9bf;padding:22px 0;display:grid;grid-template-columns:1.2fr 1fr;gap:32px}.idea .refs{display:flex;gap:12px;align-items:start}.refs a{width:50%}.refs img{width:100%;max-height:280px;object-fit:contain;background:#e8ece8}.note{border-left:3px solid #277958;padding-left:20px}details{margin:16px 0}summary{cursor:pointer;font-weight:600}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border-bottom:1px solid #cdd5cf;padding:10px;text-align:left}.scroll{overflow:auto}.tag{font-size:12px;color:#176647;font-weight:700}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}.idea{grid-template-columns:1fr}.current{grid-template-columns:1fr}.current img{max-height:600px}}@media(max-width:520px){.grid{grid-template-columns:1fr}main{padding:28px 18px}}
</style><main><p>ORKESTRA / ARAŞTIRMA · 27 EKİM 2026</p><h1>Daha fazla süs değil,<br>daha tutarlı bir görsel bütün.</h1><p>Mevcut landing page ile 48 Hallmark örneği ve 15 arşiv yakalamasının karşılaştırması. 30 fikir, 10 analitik mercek ve nihai 10 görsel karar. Bu sayfa uygulama tasarımı değil, kanıt atlasıdır.</p><nav><a href="REPORT.md">Tam rapor</a><a href="#current">Mevcut sayfa</a><a href="#final">Nihai 10</a><a href="#matrix">30 fikir</a><a href="#hallmark">48 örnek</a><a href="#bench">Platformlar</a></nav><p class="note">Uygulama kodu değiştirilmedi. Hallmark resimleri yerel paketteki orijinal örneklerdir; 48 site bugün canlı yakalanmış değildir. Benchmark’lar kullanıcının tarihsel arşividir. Yeni yakalamalar yalnız Orkestra ana sayfasına aittir. On mercek, on ayrı insan uzman anlamına gelmez.</p><h2 id="current">Gözlenen mevcut durum</h2><p>Serif başlıklar, mono sicil etiketleri, fotoğraf paspartuları, gren ve farklı CTA renkleri aynı sayfada yarışıyor. Genel sorun tek bir köşe yarıçapı değil, birlikte çalışmayan görsel kararlar.</p><div class="current">'''
page+=picture('evidence/current/live-1440.png','Yeni masaüstü tam sayfa')+picture('evidence/current/live-390.png','Yeni mobil tam sayfa')+'</div>'
page+='<h2 id="final">Nihai 10 yön</h2><p>Görseller ilham kanıtıdır; henüz üretilmiş bir “sonra” tasarımı değildir. Her karar aynı içerik ve mevcut işlevlerle çizilecek sonraki kompozisyon içindir.</p>'
for i,c in zip(ideas[:10],checks):
    page+=f'<article class="idea"><div><span class="tag">{i["id"]}</span><h3>{esc(i["title"])}</h3><p>{esc(i["proposal"])}</p><p><b>Koşul:</b> {esc(i["risk"])}</p><small>Görsel kabul: {esc(c)}</small></div><div class="refs">'
    for r in i['refs'][:2]:page+=picture(img(r),r)
    page+='</div></article>'
page+='<h2 id="matrix">30 fikir / 10 mercek</h2><p>D: destek · K: koşullu · N: doğrudan etkisiz · R: ret. Kullanıcı testi puanı değildir. <a href="IDEA-MATRIX.csv">CSV dosyası</a></p><div class="scroll"><table><tr><th>Fikir</th>'
page+=''.join(f'<th>{esc(l)}</th>' for l in lenses)+'<th>Koşul / karar</th></tr>'
for i in ideas:page+=f'<tr><td><b>{i["id"]} {esc(i["title"])}</b><br>{esc(i["proposal"])}</td>'+''.join(f'<td>{x}</td>' for x in i['lenses'])+f'<td>{"Final 10. " if i["selected"] else ""}{esc(i["risk"])}</td></tr>'
page+='</table></div><h2 id="hallmark">Hallmark / 48 görselin tamamı</h2><p>Her görsele tıklayarak orijinal kopyayı açabilirsiniz. Örneklerden alınabilecek ilkeler ile alınmaması gereken stil seçimleri ayrıldı.</p><div class="grid">'
for h,n in zip(H,N):page+=f'<article><small>{h["id"]}</small><h3>{esc(h["name"])}</h3>'+picture(h['image'],h['name'])+f'<p>{esc(n[0])}.</p><p><b>Alınabilir:</b> {esc(n[1])}.</p><p><b>Alınmamalı:</b> {esc(n[2])}.</p></article>'
page+='</div><h2 id="bench">Arşiv / 15 platform</h2><p>13 kullanılabilir karşılaştırma; B14 hedef sayfa değil, B15 kısmi kanıt.</p><div class="grid">'
for b,n in zip(B,BN):page+=f'<article><h3>{b["id"]} · {esc(b["file"].split("_")[0])}</h3>'+picture(source[b['id']],b['id'])+f'<p>{esc(n[0])}.</p><p>{esc(n[1])}.</p></article>'
page+='</div><h2>Karşılıklı eleştiri</h2><p>Gemini’nin ilk raporundaki serif/sans, yazı rengi ve kontrol şekli hataları Codex tarafından reddedildi; ikinci turda düzeltildi. Görüş birliği kanıt değildir; gözlemle desteklenen kısımlar seçildi.</p><p><a href="GEMINI-INDEPENDENT-REVIEW.md">İlk Gemini görüşü</a> · <a href="GEMINI-COUNTER-REVIEW.md">Codex itirazına yanıt</a> · <a href="REPORT.md">Tam sentez</a> · <a href="SOURCE-MANIFEST.json">Kaynak manifesti</a></p></main></html>'
(P/'index.html').write_text(page,encoding='utf-8')
manifest=[]
for x in H+B:
    dest=P/source[x['id']]; origin=Path(x['source']); sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
    manifest.append(dict(id=x['id'],source=str(origin),copy=source[x['id']],sha256=sha(dest),matches_source=sha(origin)==sha(dest),kind='archived-original'))
for f in (P/'evidence/current').glob('*.png'):
    manifest.append(dict(id=f.stem,copy=f.relative_to(P).as_posix(),sha256=hashlib.sha256(f.read_bytes()).hexdigest(),kind='fresh-localhost-capture' if f.name.startswith('live') else 'crop-of-live-1440',capture_date='2026-10-27'))
(P/'SOURCE-MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Created report, gallery, 48-theme atlas, 15-platform atlas, 30x10 matrix and source manifest.')
