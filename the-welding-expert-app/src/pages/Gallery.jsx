import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlinePhoto,
  HiOutlineSparkles,
} from "react-icons/hi2";

const workExamples = [
  {
    title: "Ev salon duvarı boya uygulaması",
    category: "Boya ve badana",
    location: "Yenimahalle / Ankara",
    beforeLabel: "Astar ve Alçı",
    afterLabel: "Boya Sonrası",
    beforeImage: "/images/shelf_before.png",
    afterImage: "/images/painting.png",
    text: "Duvardaki pürüzler giderildi, alçı astarı çekildi ve oda krem rengi boya ile pürüzsüz boyandı.",
    points: ["Yüzey zımparalama", "Astar çekilmesi", "Çift kat temiz boyama"],
  },
  {
    title: "Paslı bahçe korkuluğu ve kapı tamiri",
    category: "Kaynak ve metal",
    location: "Ostim / Ankara",
    beforeLabel: "Paslı Durum",
    afterLabel: "Onarım Sonrası",
    beforeImage: "/images/railing_before.png",
    afterImage: "/images/railing_after.png",
    text: "Paslanmış ve kopmuş bahçe kapısı menteşeleri kaynakla sabitlendi, pas koruyucu astar boya atıldı.",
    points: ["Menteşe kaynaklama", "Pas zımparalama", "Siyah boyama ve cila"],
  },
  {
    title: "Arka bahçe düzenleme ve çim budama",
    category: "Bahçe ve peyzaj",
    location: "Çankaya / Ankara",
    beforeLabel: "Bakımsız",
    afterLabel: "Düzenli",
    beforeImage: "/images/hinge_before.png",
    afterImage: "/images/landscaping.png",
    text: "Yabani otlar temizlendi, çimler biçildi, ağaçlar budandı ve bahçe sınır telleri yeniden çekildi.",
    points: ["Yabani ot temizliği", "Çimlerin biçilmesi", "Kenar çit kontrolü"],
  },
  {
    title: "Mutfak tezgah arkası fayans kaplama",
    category: "İnşaat ve tadilat",
    location: "Yenimahalle / Ankara",
    beforeLabel: "Tadilat Öncesi",
    afterLabel: "Fayans Teslim",
    beforeImage: "/images/shelf_before.png",
    afterImage: "/images/renovation.png",
    text: "Eski mutfak duvarı düzeltildi, harç hazırlandı ve dekoratif fayanslar örülerek derz dolguları yapıldı.",
    points: ["Duvar hazırlığı", "Hassas dizim ve harç", "Derz dolgusu ve temizlik"],
  },
];

const galleryItems = [
  {
    title: "İç mekan duvar boyama",
    image: "/images/painting.png",
  },
  {
    title: "Bahçe peyzaj ve budama",
    image: "/images/landscaping.png",
  },
  {
    title: "Lokal duvar ve tuğla örme",
    image: "/images/renovation.png",
  },
  {
    title: "Bahçe kapısı kaynak onarımı",
    image: "/images/railing_after.png",
  },
];

const testimonials = [
  {
    name: "Murat A.",
    job: "Apartman korkuluğu onarımı",
    text: "Randevu saatinde geldi, önce sorunu anlattı ve ardından tamiri temiz bir şekilde tamamladı.",
  },
  {
    name: "Selin K.",
    job: "Metal masa ayağı imalatı",
    text: "Ölçü konusunda dikkatliydi. Teslim edilen iş hem sağlam hem de beklediğimizden daha düzgün oldu.",
  },
  {
    name: "Emre T.",
    job: "Kapı menteşesi tamiri",
    text: "Kısa sürede çözüm üretti. İş bittikten sonra kullanımı test ederek teslim etti.",
  },
];

const ScrollWrapper = styled.div`
  position: relative;
  width: 100%;

  @media (max-width: ${(props) => props.$breakpoint || "640px"}) {
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 4rem;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        ${(props) => props.$bg || "var(--color-grey-50)"} 100%
      );
      pointer-events: none;
      z-index: 2;
    }
  }
`;

const Page = styled.main`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding: 4rem 3.2rem 6.4rem;
  overflow-x: hidden;

  @media (max-width: 640px) {
    padding: 2.4rem 1.6rem 4rem;
  }
`;

const Shell = styled.div`
  width: 100%;
  max-width: 118rem;
  margin: 0 auto;
  display: grid;
  gap: 2.4rem;

  & > * {
    min-width: 0;
  }
`;

const TopBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1.2rem;
`;

const BackLink = styled(Link)`
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.9rem 1.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-extrabold);

  &:hover {
    color: var(--color-brand-700);
    border-color: var(--color-brand-200);
    background: var(--color-brand-50);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const Eyebrow = styled.p`
  color: var(--color-brand-700);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  text-transform: uppercase;
`;

const Hero = styled.section`
  position: relative;
  min-height: 38rem;
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: grid;
  align-items: end;
  color: var(--color-grey-900);
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
  box-shadow: var(--shadow-md);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--color-grey-50) 0%,
      rgba(251, 251, 249, 0.95) 50%,
      rgba(251, 251, 249, 0.15) 100%
    );
  }

  @media (max-width: 640px) {
    min-height: 34rem;
    padding: 2.4rem;
  }
`;

const HeroImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 72rem;
  display: grid;
  gap: 1.2rem;
`;

const HeroTitle = styled.h1`
  font-size: var(--font-size-display);
  line-height: 1.05;
  font-weight: var(--font-weight-extrabold);

  @media (max-width: 640px) {
    font-size: var(--font-size-page-title);
  }
`;

const HeroText = styled.p`
  max-width: 64rem;
  color: var(--color-grey-600);
  font-size: var(--font-size-md);
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionLink = styled(Link)`
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: ${(props) =>
    props.$secondary
      ? "var(--color-grey-700)"
      : "var(--color-grey-0)"};
  background: ${(props) =>
    props.$secondary
      ? "var(--color-grey-0)"
      : "var(--color-action-primary)"};
  border: 1px solid
    ${(props) =>
      props.$secondary
        ? "var(--color-grey-200)"
        : "var(--color-action-primary)"};
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-extrabold);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    background: ${(props) =>
      props.$secondary
        ? "var(--color-grey-50)"
        : "var(--color-action-primary-hover)"};
    border-color: ${(props) =>
      props.$secondary
        ? "var(--color-grey-300)"
        : "var(--color-action-primary-hover)"};
    box-shadow: ${(props) =>
      props.$secondary
        ? "var(--shadow-sm)"
        : "0 2px 6px rgba(13, 128, 80, 0.15)"};
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 520px) {
    flex: 1 1 100%;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StatCard = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  background: var(--color-grey-0);

  @media (max-width: 520px) {
    padding: 1.2rem;
  }
`;

const StatValue = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: var(--font-size-xl);

  @media (max-width: 520px) {
    font-size: var(--font-size-title);
  }
`;

const StatLabel = styled.span`
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
`;

const Section = styled.section`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.8rem;
  display: grid;
  gap: 2rem;
  background: var(--color-grey-0);

  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

const SectionHeader = styled.div`
  max-width: 76rem;
  display: grid;
  gap: 0.8rem;
`;

const SectionTitle = styled.h2`
  color: var(--color-grey-900);
  font-size: var(--font-size-heading);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-extrabold);

  @media (max-width: 640px) {
    font-size: var(--font-size-xl);
  }
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: var(--font-size-body);
`;

const WorkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.4rem;

  @media (max-width: 1060px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: minmax(28rem, 88%);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scrollbar-width: none;
    padding-bottom: 0.4rem;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const WorkCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: grid;
  background: var(--color-grey-50);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--color-brand-200);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 640px) {
    scroll-snap-align: start;
  }
`;

const CompareGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-height: 22rem;
`;

const CompareMedia = styled.figure`
  min-height: 22rem;
  position: relative;
  overflow: hidden;
  background-color: var(--color-grey-300);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.02), rgba(17, 24, 39, 0.5));
  }
`;

const MediaImage = styled.img`
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
`;

const ImageLabel = styled.span`
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  z-index: 1;
  border-radius: 999px;
  padding: 0.5rem 0.8rem;
  color: var(--color-grey-0);
  background: rgba(17, 24, 39, 0.82);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-extrabold);
`;

const WorkBody = styled.div`
  padding: 1.8rem;
  display: grid;
  gap: 1.2rem;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const Pill = styled.span`
  border-radius: 999px;
  padding: 0.5rem 0.8rem;
  color: var(--color-brand-700);
  background: var(--color-brand-50);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-extrabold);
`;

const CardTitle = styled.h3`
  color: var(--color-grey-900);
  font-size: var(--font-size-lg);
  line-height: 1.25;
  font-weight: 800;
`;

const CardText = styled.p`
  color: var(--color-grey-600);
  font-size: var(--font-size-body);
  line-height: 1.6;
`;

const MiniList = styled.ul`
  display: grid;
  gap: 0.6rem;
`;

const MiniItem = styled.li`
  display: grid;
  grid-template-columns: 1.8rem 1fr;
  gap: 0.6rem;
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-green-700);
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  grid-auto-rows: 18rem;
  gap: 1.2rem;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: none;
    grid-template-rows: 20rem;
    grid-auto-flow: column;
    grid-auto-columns: minmax(24rem, 84%);
    grid-auto-rows: 20rem;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scrollbar-width: none;
    padding-bottom: 0.4rem;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const PhotoTile = styled.figure`
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-300);

  & img {
    transition: transform 0.4s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &:first-child {
    grid-row: span 2;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent, rgba(17, 24, 39, 0.72));
    pointer-events: none;
  }

  @media (max-width: 560px) {
    scroll-snap-align: start;

    &:first-child {
      grid-row: span 1;
    }
  }
`;

const PhotoCaption = styled.figcaption`
  position: absolute;
  left: 1.4rem;
  right: 1.4rem;
  bottom: 1.4rem;
  z-index: 1;
  color: var(--color-grey-0);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-extrabold);
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: minmax(26rem, 88%);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scrollbar-width: none;
    padding-bottom: 0.4rem;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TestimonialCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 1.2rem;
  background: var(--color-grey-50);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--color-brand-200);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 640px) {
    scroll-snap-align: start;
  }
`;

const QuoteIcon = styled.span`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-700);
  background: var(--color-brand-50);

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const CustomerName = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: var(--font-size-base);
`;

const Cta = styled.section`
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.4rem;
  color: var(--color-text-inverse);
  background: var(--color-surface-dark);

  & ${MutedText} {
    color: var(--color-text-inverse-muted);
  }

  & ${SectionTitle} {
    color: var(--color-grey-0);
  }
`;

function Gallery() {
  return (
    <Page>
      <Shell>
        <TopBar>
          <BackLink to="/appointment">
            <HiOutlineArrowLeft />
            Randevu sayfasına dön
          </BackLink>
        </TopBar>

        <Hero>
          <HeroImage
            src="/images/hero.png"
            alt="Umut Usta'nın düzenli atölyesindeki aletler ve çalışma tezgahı"
            fetchpriority="high"
          />
          <HeroContent>
            <HeroTitle>Umut Usta Önce-Sonra Çalışmaları ve Galeri</HeroTitle>
            <HeroText>
              Boya, kaynak, bahçe düzenleme, küçük tadilat ve bakım onarım
              çalışmalarını keşif, hazırlık ve teslim aşamalarıyla inceleyin.
              Benzer bir iş için doğrudan randevu talebi oluşturun.
            </HeroText>
            <HeroActions>
              <ActionLink to="/appointment">
                <HiOutlineCalendarDays />
                Randevu seç
              </ActionLink>
              <ActionLink
                to="/appointment#services"
                $secondary>
                <HiOutlinePhoto />
                Hizmetleri incele
              </ActionLink>
            </HeroActions>
          </HeroContent>
        </Hero>

        <StatsGrid aria-label="Galeri özeti">
          <StatCard>
            <StatValue>Yerinde</StatValue>
            <StatLabel>Servis seçeneği</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>Atölye</StatValue>
            <StatLabel>Üretim ve onarım</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>2 saat</StatValue>
            <StatLabel>Standart randevu aralığı</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>09-21</StatValue>
            <StatLabel>Planlama saatleri</StatLabel>
          </StatCard>
        </StatsGrid>

        <Section>
          <SectionHeader>
            <Eyebrow>Önce / sonra</Eyebrow>
            <SectionTitle>Keşiften teslim anına kadar çalışma süreci</SectionTitle>
            <MutedText>
              Her kartta işin başlangıç durumu, uygulama adımları ve teslim
              sonrası görünümü birlikte sunulur.
            </MutedText>
          </SectionHeader>

          <ScrollWrapper $bg="var(--color-grey-0)">
            <WorkGrid aria-label="Önce ve sonra iş örnekleri">
              {workExamples.map((item) => (
                <WorkCard key={item.title}>
                  <CompareGrid>
                    <CompareMedia>
                      <MediaImage
                        src={item.beforeImage}
                        alt={`${item.title}: ${item.beforeLabel.toLocaleLowerCase("tr-TR")} aşaması`}
                        loading="lazy"
                        decoding="async"
                      />
                      <ImageLabel>{item.beforeLabel}</ImageLabel>
                    </CompareMedia>
                    <CompareMedia>
                      <MediaImage
                        src={item.afterImage}
                        alt={`${item.title}: ${item.afterLabel.toLocaleLowerCase("tr-TR")} aşaması`}
                        loading="lazy"
                        decoding="async"
                      />
                      <ImageLabel>{item.afterLabel}</ImageLabel>
                    </CompareMedia>
                  </CompareGrid>
                  <WorkBody>
                    <MetaRow>
                      <Pill>{item.category}</Pill>
                      <Pill>{item.location}</Pill>
                    </MetaRow>
                    <CardTitle>{item.title}</CardTitle>
                    <CardText>{item.text}</CardText>
                    <MiniList>
                      {item.points.map((point) => (
                        <MiniItem key={point}>
                          <HiOutlineCheckCircle />
                          {point}
                        </MiniItem>
                      ))}
                    </MiniList>
                  </WorkBody>
                </WorkCard>
              ))}
            </WorkGrid>
          </ScrollWrapper>
        </Section>

        <Section>
          <SectionHeader>
            <Eyebrow>Galeri</Eyebrow>
            <SectionTitle>Umut Usta Yerinde Servis ve Bakım Uygulamaları</SectionTitle>
            <MutedText>
              Boya, kaynak, bahçe düzenleme ve ev tadilatı gibi farklı hizmet
              türleri, uygulama ayrıntıları ve teslim edilen işlerden görseller.
            </MutedText>
          </SectionHeader>

          <ScrollWrapper $breakpoint="560px" $bg="var(--color-grey-0)">
            <PhotoGrid aria-label="Umut Usta çalışma galerisi">
              {galleryItems.map((item) => (
                <PhotoTile key={item.title}>
                  <MediaImage
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <PhotoCaption>{item.title}</PhotoCaption>
                </PhotoTile>
              ))}
            </PhotoGrid>
          </ScrollWrapper>
        </Section>

        <Section>
          <SectionHeader>
            <Eyebrow>Yorumlar / referanslar</Eyebrow>
            <SectionTitle>Müşterilerin çalışma süreciyle ilgili görüşleri</SectionTitle>
            <MutedText>
              Randevu, uygulama ve teslim süreciyle ilgili müşteri geri
              bildirimleri.
            </MutedText>
          </SectionHeader>

          <ScrollWrapper $bg="var(--color-grey-0)">
            <TestimonialsGrid aria-label="Müşteri yorumları">
              {testimonials.map((item) => (
                <TestimonialCard key={item.name}>
                  <QuoteIcon>
                    <HiOutlineChatBubbleLeftRight />
                  </QuoteIcon>
                  <CardText>{item.text}</CardText>
                  <div>
                    <CustomerName>{item.name}</CustomerName>
                    <MutedText>{item.job}</MutedText>
                  </div>
                </TestimonialCard>
              ))}
            </TestimonialsGrid>
          </ScrollWrapper>
        </Section>

        <Cta>
          <div>
            <SectionTitle>Benzer bir iş için uygun randevuyu seçin</SectionTitle>
            <MutedText>
              İşin fotoğraflarını WhatsApp üzerinden paylaşarak daha doğru bir
              ön değerlendirme alabilirsiniz.
            </MutedText>
          </div>
          <ActionLink to="/appointment#appointment-calendar">
            <HiOutlineSparkles />
            Randevuya git
          </ActionLink>
        </Cta>
      </Shell>
    </Page>
  );
}

export default Gallery;
