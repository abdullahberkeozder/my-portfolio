import { Link } from "react-router-dom";
import styled from "styled-components";
import { HiOutlineArrowLeft, HiOutlineShieldCheck } from "react-icons/hi2";

import Heading from "../ui/Heading";
import SEO from "../ui/SEO";
import { BUSINESS_TELEPHONE } from "../config/business";

const Page = styled.main`
  min-height: 100vh;
  padding: 3.2rem 1.6rem 6.4rem;
  background: var(--color-grey-50);
`;

const Article = styled.article`
  width: min(76rem, 100%);
  margin: 0 auto;
  display: grid;
  gap: 2rem;
  color: var(--color-grey-700);
  font-size: 1.45rem;
  line-height: 1.7;
`;

const BackLink = styled(Link)`
  width: fit-content;
  min-height: 4.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-brand-700);
  font-weight: 800;

  & svg { width: 1.8rem; height: 1.8rem; }
`;

const Header = styled.header`
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-grey-100);

  & svg {
    width: 3.2rem;
    height: 3.2rem;
    color: var(--color-brand-600);
  }
`;

const Section = styled.section`
  display: grid;
  gap: 0.8rem;

  & ul {
    padding-left: 2rem;
    display: grid;
    gap: 0.5rem;
  }
`;

function CustomerPrivacy() {
  return (
    <Page>
      <SEO
        title="Veri Kullanımı | Umut Usta"
        description="Randevu ve self-servis işlemlerinde kullanılan müşteri verileri hakkında bilgilendirme."
        canonicalPath="/privacy"
        noIndex
      />
      <Article>
        <BackLink to="/appointment"><HiOutlineArrowLeft />Randevu ekranına dön</BackLink>
        <Header>
          <HiOutlineShieldCheck />
          <Heading as="h1">Veri kullanımı açıklaması</Heading>
          <p>Randevu talebinizi oluştururken ve yönetirken verdiğiniz bilgiler yalnız hizmet iletişimi ve talep yönetimi amacıyla kullanılır.</p>
        </Header>

        <Section>
          <Heading as="h2">Hangi bilgiler kullanılır?</Heading>
          <ul>
            <li>Ad, telefon ve isteğe bağlı e-posta bilgisi</li>
            <li>Seçtiğiniz hizmet, tarih ve saat tercihi</li>
            <li>Değişiklik veya iptal isteği, işlem notu ve geri bildirim</li>
            <li>Talebe isteğe bağlı olarak eklediğiniz iş fotoğrafları</li>
            <li>Hizmet deneyimini iyileştirmek için anonim kullanım olayları</li>
          </ul>
        </Section>

        <Section>
          <Heading as="h2">Bilgiler neden kullanılır?</Heading>
          <p>Ekibin talebinizi değerlendirmesi, uygunluğu teyit etmesi, sizinle iletişim kurması, değişiklik veya iptal isteğinizi sonuçlandırması ve hizmet kalitesini ölçmesi için kullanılır.</p>
        </Section>

        <Section>
          <Heading as="h2">Fotoğraflar nasıl korunur?</Heading>
          <p>Talebe eklenen fotoğraflar genel iş galerisinden ayrı, özel bir alanda saklanır. Yalnızca talebi yönetmeye yetkili ekip üyeleri süreli erişim bağlantılarıyla görüntüleyebilir. Arşivlenen taleplere ait fotoğraflar en geç 90 gün içinde silinir.</p>
        </Section>

        <Section>
          <Heading as="h2">Takip bağlantısı</Heading>
          <p>Takip bağlantısı kişiye özel bir anahtar içerir. Bağlantıyı yalnız talebi yönetmesini istediğiniz kişilerle paylaşın. Sayfa dahili kayıt kimliğinizi veya iletişim bilgilerinizi göstermez.</p>
        </Section>

        <Section>
          <Heading as="h2">Bilgilerinize ilişkin talepler</Heading>
          <p>Randevu kaydınızla ilgili bilgi almak, düzeltme veya silme talebinde bulunmak için <a href={`tel:${BUSINESS_TELEPHONE.replace(/\s/g, "")}`}>{BUSINESS_TELEPHONE}</a> üzerinden iletişime geçebilirsiniz.</p>
        </Section>
      </Article>
    </Page>
  );
}

export default CustomerPrivacy;
