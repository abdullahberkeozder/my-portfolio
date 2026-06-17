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
    title: "Balkon korkulugu saglamlastirma",
    category: "Korkuluk onarimi",
    location: "Yenimahalle / Ankara",
    beforeLabel: "Kesif",
    afterLabel: "Uygulama",
    beforeImage:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1698664683348-f9f35b809821?auto=format&fit=crop&w=900&q=80",
    text: "Gevseyen baglanti noktalarinda kaynak onarimi yapildi, son kontrol ile kullanim guvenligi artirildi.",
    points: ["Yerinde kesif", "Kaynak onarimi", "Saglamlik kontrolu"],
  },
  {
    title: "Atolye tipi metal cerceve imalati",
    category: "Ozel imalat",
    location: "Ostim / Ankara",
    beforeLabel: "Hazirlik",
    afterLabel: "Montaj",
    beforeImage:
      "https://images.unsplash.com/photo-1735494033576-9c882e80504c?auto=format&fit=crop&w=900&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1526634140919-468dc3ae3870?auto=format&fit=crop&w=900&q=80",
    text: "Olcuye gore metal cerceve hazirlandi, kaynak sonrasi capak temizligi ve yuzey kontrolu tamamlandi.",
    points: ["Olcu alma", "Parca hazirlama", "Temiz teslim"],
  },
  {
    title: "Kapi mentesesi ve kasa tamiri",
    category: "Tamir ve bakim",
    location: "Cankaya / Ankara",
    beforeLabel: "Problem",
    afterLabel: "Teslim",
    beforeImage:
      "https://images.unsplash.com/photo-1698664683348-f9f35b809821?auto=format&fit=crop&w=900&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
    text: "Acilan kaynak ve esneyen mentese bolgesi yeniden sabitlendi, kapi hareketi test edilerek teslim edildi.",
    points: ["Hizli tespit", "Mentese sabitleme", "Kullanim testi"],
  },
];

const galleryItems = [
  {
    title: "Yerinde kaynak onarimi",
    image:
      "https://images.unsplash.com/photo-1698664683348-f9f35b809821?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Metal kesim ve hazirlik",
    image:
      "https://images.unsplash.com/photo-1735494033576-9c882e80504c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Korkuluk ve profil isi",
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Atolye kaynak uygulamasi",
    image:
      "https://images.unsplash.com/photo-1526634140919-468dc3ae3870?auto=format&fit=crop&w=900&q=80",
  },
];

const testimonials = [
  {
    name: "Murat A.",
    job: "Apartman korkulugu onarimi",
    text: "Randevu saatinde geldi, once sorunu anlatti sonra temiz bir sekilde tamiri tamamladi.",
  },
  {
    name: "Selin K.",
    job: "Metal masa ayagi imalati",
    text: "Olcu konusunda dikkatliydi. Teslim edilen is hem saglam hem de bekledigimizden daha duzgun oldu.",
  },
  {
    name: "Emre T.",
    job: "Kapi mentesesi tamiri",
    text: "Kisa surede cozum uretti. Is bittikten sonra kullanimi test edip oyle teslim etti.",
  },
];

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
  min-height: 4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.9rem 1.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.4rem;
  font-weight: 800;

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
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
`;

const Hero = styled.section`
  min-height: 38rem;
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: grid;
  align-items: end;
  color: var(--color-grey-0);
  background-image:
    linear-gradient(90deg, rgba(17, 24, 39, 0.88), rgba(17, 24, 39, 0.48)),
    url("https://images.unsplash.com/photo-1698664683348-f9f35b809821?auto=format&fit=crop&w=1600&q=80"),
    radial-gradient(circle at 80% 22%, rgba(250, 204, 21, 0.36), transparent 16rem),
    linear-gradient(135deg, #111827 0%, #4b5563 58%, #92400e 100%);
  background-position: center;
  background-size: cover;
  overflow: hidden;

  @media (max-width: 640px) {
    min-height: 34rem;
    padding: 2.4rem;
  }
`;

const HeroContent = styled.div`
  max-width: 72rem;
  display: grid;
  gap: 1.2rem;
`;

const HeroTitle = styled.h1`
  font-size: 4.2rem;
  line-height: 1.05;
  font-weight: 800;

  @media (max-width: 640px) {
    font-size: 3rem;
  }
`;

const HeroText = styled.p`
  max-width: 64rem;
  color: #e5e7eb;
  font-size: 1.7rem;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionLink = styled(Link)`
  min-height: 4.2rem;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: ${(props) => (props.$secondary ? "#f9fafb" : "#111827")};
  background: ${(props) =>
    props.$secondary ? "rgba(255, 255, 255, 0.12)" : "#facc15"};
  border: 1px solid
    ${(props) =>
      props.$secondary ? "rgba(255, 255, 255, 0.24)" : "#facc15"};
  font-size: 1.4rem;
  font-weight: 800;

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
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  background: var(--color-grey-0);
`;

const StatValue = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: 2.4rem;
`;

const StatLabel = styled.span`
  color: var(--color-grey-500);
  font-size: 1.3rem;
  font-weight: 700;
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
  font-size: 2.8rem;
  line-height: 1.15;
  font-weight: 800;

  @media (max-width: 640px) {
    font-size: 2.4rem;
  }
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

const WorkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.4rem;

  @media (max-width: 1060px) {
    grid-template-columns: 1fr;
  }
`;

const WorkCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: grid;
  background: var(--color-grey-50);
`;

const CompareGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-height: 22rem;
`;

const CompareImage = styled.div`
  min-height: 22rem;
  position: relative;
  background-color: var(--color-grey-300);
  background-image:
    url(${(props) => props.$image}),
    radial-gradient(circle at 70% 28%, rgba(250, 204, 21, 0.42), transparent 10rem),
    linear-gradient(135deg, #111827 0%, #6b7280 52%, #92400e 100%);
  background-position: center;
  background-size: cover;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.02), rgba(17, 24, 39, 0.5));
  }
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
  font-size: 1.1rem;
  font-weight: 800;
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
  font-size: 1.1rem;
  font-weight: 800;
`;

const CardTitle = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.8rem;
  line-height: 1.25;
  font-weight: 800;
`;

const CardText = styled.p`
  color: var(--color-grey-600);
  font-size: 1.4rem;
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
  font-size: 1.3rem;
  font-weight: 700;

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
    grid-template-columns: 1fr;
    grid-auto-rows: 22rem;
  }
`;

const PhotoTile = styled.article`
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-300);
  background-image:
    url(${(props) => props.$image}),
    radial-gradient(circle at 72% 22%, rgba(250, 204, 21, 0.36), transparent 12rem),
    linear-gradient(135deg, #111827 0%, #6b7280 52%, #92400e 100%);
  background-position: center;
  background-size: cover;

  &:first-child {
    grid-row: span 2;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent, rgba(17, 24, 39, 0.72));
  }

  @media (max-width: 560px) {
    &:first-child {
      grid-row: span 1;
    }
  }
`;

const PhotoCaption = styled.div`
  position: absolute;
  left: 1.4rem;
  right: 1.4rem;
  bottom: 1.4rem;
  z-index: 1;
  color: var(--color-grey-0);
  font-size: 1.4rem;
  font-weight: 800;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TestimonialCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 1.2rem;
  background: var(--color-grey-50);
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
  font-size: 1.5rem;
`;

const Cta = styled.section`
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.4rem;
  color: var(--color-grey-0);
  background: #111827;

  & ${MutedText} {
    color: #d1d5db;
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
            Randevu sayfasina don
          </BackLink>
        </TopBar>

        <Hero>
          <HeroContent>
            <Eyebrow>Is ornekleri / galeri</Eyebrow>
            <HeroTitle>Kaynak ve metal islerinde once-sonra calismalari</HeroTitle>
            <HeroText>
              Buradaki gorseller simdilik ornek olarak kullanildi. Kendi
              islerinden fotograf yuklediginde bu sayfa referans vitrini gibi
              calisacak.
            </HeroText>
            <HeroActions>
              <ActionLink to="/appointment">
                <HiOutlineCalendarDays />
                Randevu sec
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

        <StatsGrid aria-label="Galeri ozeti">
          <StatCard>
            <StatValue>12+</StatValue>
            <StatLabel>Yil tecrube</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>450+</StatValue>
            <StatLabel>Tamamlanan is</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>2 saat</StatValue>
            <StatLabel>Standart randevu araligi</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>09-21</StatValue>
            <StatLabel>Planlama saatleri</StatLabel>
          </StatCard>
        </StatsGrid>

        <Section>
          <SectionHeader>
            <Eyebrow>Once / sonra</Eyebrow>
            <SectionTitle>Isin kapsamindan teslim anina kadar net gorunum</SectionTitle>
            <MutedText>
              Gercek is fotograflarin hazir oldugunda burada her kart icin
              kesif, uygulama ve teslim surecini gosterebilirsin.
            </MutedText>
          </SectionHeader>

          <WorkGrid>
            {workExamples.map((item) => (
              <WorkCard key={item.title}>
                <CompareGrid>
                  <CompareImage $image={item.beforeImage}>
                    <ImageLabel>{item.beforeLabel}</ImageLabel>
                  </CompareImage>
                  <CompareImage $image={item.afterImage}>
                    <ImageLabel>{item.afterLabel}</ImageLabel>
                  </CompareImage>
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
        </Section>

        <Section>
          <SectionHeader>
            <Eyebrow>Galeri</Eyebrow>
            <SectionTitle>Atolye, yerinde servis ve metal islerinden kareler</SectionTitle>
            <MutedText>
              Bu alan daha sonra kendi fotograf arsivinle buyuyebilir; her
              kareye is turu, konum veya teslim notu eklenebilir.
            </MutedText>
          </SectionHeader>

          <PhotoGrid>
            {galleryItems.map((item) => (
              <PhotoTile
                key={item.title}
                $image={item.image}>
                <PhotoCaption>{item.title}</PhotoCaption>
              </PhotoTile>
            ))}
          </PhotoGrid>
        </Section>

        <Section>
          <SectionHeader>
            <Eyebrow>Yorumlar / referanslar</Eyebrow>
            <SectionTitle>Musterilerin calisma sureciyle ilgili notlari</SectionTitle>
            <MutedText>
              Simdilik ornek referans metinleri var. Gercek musteri yorumlari
              geldikce bu alan guven olusturan en guclu bolumlerden biri olur.
            </MutedText>
          </SectionHeader>

          <TestimonialsGrid>
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
        </Section>

        <Cta>
          <div>
            <SectionTitle>Benzer bir is icin uygun randevu secin</SectionTitle>
            <MutedText>
              Isin fotograflarini WhatsApp uzerinden paylasarak daha net teklif
              alabilirsiniz.
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
