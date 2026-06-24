import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

const Page = styled.main`
  min-height: 100vh;
  min-height: 100dvh;
  padding: 3.2rem;
  display: grid;
  place-items: center;
  background: var(--color-grey-50);

  @media (max-width: 640px) {
    padding: 1.6rem;
  }
`;

const Shell = styled.div`
  width: min(100%, 98rem);
  min-height: 62rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  display: grid;
  grid-template-columns: minmax(30rem, 0.8fr) minmax(0, 1.2fr);
  overflow: hidden;
  background: var(--color-grey-0);
  box-shadow: var(--shadow-lg);

  @media (max-width: 760px) {
    min-height: auto;
    grid-template-columns: 1fr;
  }
`;

const BrandPanel = styled.aside`
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4rem;
  color: var(--color-text-inverse);
  background: var(--color-surface-dark);

  @media (max-width: 760px) {
    padding: 2.4rem;
    gap: 2.4rem;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const BrandMark = styled.span`
  width: 4.8rem;
  height: 4.8rem;
  flex: 0 0 4.8rem;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BrandName = styled.strong`
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
`;

const BrandCaption = styled.span`
  display: block;
  color: var(--color-text-inverse-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
`;

const BrandCopy = styled.div`
  display: grid;
  gap: 1.6rem;

  @media (max-width: 760px) {
    display: none;
  }
`;

const BrandTitle = styled.h2`
  font-size: var(--font-size-heading);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
`;

const BrandText = styled.p`
  color: var(--color-text-inverse-muted);
  font-size: var(--font-size-body);
`;

const BrandList = styled.ul`
  display: grid;
  gap: 1.2rem;
`;

const BrandItem = styled.li`
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.8rem;
  align-items: center;
  color: var(--color-text-inverse-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-accent-400);
  }
`;

const CustomerLink = styled(Link)`
  min-height: 4.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-text-inverse-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);

  &:hover {
    color: var(--color-grey-0);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const FormPanel = styled.section`
  padding: 5.6rem clamp(3.2rem, 7vw, 7.2rem);
  display: grid;
  align-content: center;

  @media (max-width: 640px) {
    padding: 3.2rem 2.4rem;
  }
`;

const FormShell = styled.div`
  width: 100%;
  max-width: 44rem;
  margin: 0 auto;
  display: grid;
  gap: 2.8rem;
`;

const FormHeader = styled.header`
  display: grid;
  gap: 0.8rem;
`;

const Eyebrow = styled.p`
  color: var(--color-brand-700);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: var(--color-grey-900);
  font-size: var(--font-size-page-title);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
`;

const Description = styled.p`
  color: var(--color-grey-500);
  font-size: var(--font-size-body);
`;

function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <Page>
      <Shell>
        <BrandPanel>
          <Brand>
            <BrandMark>
              <img src="/logo.png" alt="Umut Usta Logo" />
            </BrandMark>
            <div>
              <BrandName>Umut Usta</BrandName>
              <BrandCaption>Ekip ve randevu yönetimi</BrandCaption>
            </div>
          </Brand>

          <BrandCopy>
            <BrandTitle>Günlük iş akışınız tek ekranda</BrandTitle>
            <BrandText>
              Randevu taleplerini, müsait saatleri ve ekip hesaplarını güvenli
              yönetim panelinden takip edin.
            </BrandText>
            <BrandList>
              <BrandItem>
                <HiOutlineCalendarDays />
                Randevu ve müsaitlik kontrolü
              </BrandItem>
              <BrandItem>
                <HiOutlineShieldCheck />
                Owner kontrollü ekip erişimi
              </BrandItem>
            </BrandList>
          </BrandCopy>

          <CustomerLink to="/appointment">
            <HiOutlineArrowLeft />
            Randevu sayfasına dön
          </CustomerLink>
        </BrandPanel>

        <FormPanel>
          <FormShell>
            <FormHeader>
              <Eyebrow>{eyebrow}</Eyebrow>
              <Title>{title}</Title>
              <Description>{description}</Description>
            </FormHeader>
            {children}
          </FormShell>
        </FormPanel>
      </Shell>
    </Page>
  );
}

export default AuthLayout;
