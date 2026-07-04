import styled from "styled-components";

export const ScrollWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;

  @media (max-width: ${(props) => props.$breakpoint || "640px"}) {
    /* Right-side fade: indicates there's more content */
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

export const Page = styled.main`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding: 4rem 3.2rem 6.4rem;
  overflow-x: hidden;

  @media (max-width: 640px) {
    /* Extra bottom padding to clear the sticky CTA bar (~7.6rem) */
    padding: 2.4rem 1.6rem 12rem;
  }

  @media (max-width: 380px) {
    padding: 1.6rem 1.2rem 12rem;
  }
`;

export const Shell = styled.div`
  width: 100%;
  min-width: 0;
  max-width: 118rem;
  margin: 0 auto;
  display: grid;
  gap: 2.4rem;

  & > * {
    min-width: 0;
  }

  @media (max-width: 640px) {
    & > header {
      order: 1;
    }

    & > nav {
      order: 2;
    }

    & > #about {
      order: 3;
    }

    & > #services {
      order: 4;
    }

    & > #appointment-calendar {
      order: 5;
    }

    & > #process {
      order: 6;
    }

    & > #location {
      order: 7;
    }

    & > #faq {
      order: 8;
    }

    & > footer {
      order: 9;
    }
  }
`;

export const PublicHeader = styled.header`
  position: relative;
  min-width: 0;
  min-height: 42rem;
  overflow: hidden;
  background: var(--color-grey-50);
  color: var(--color-grey-900);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: center;
  box-shadow: var(--shadow-md);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--color-hero-grad-start) 0%,
      var(--color-hero-grad-middle) 50%,
      var(--color-hero-grad-end) 100%
    );
  }

  & > *:not(img) {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;

    &::after {
      background: linear-gradient(
        180deg,
        var(--color-hero-grad-start) 0%,
        var(--color-hero-grad-middle) 60%,
        var(--color-hero-grad-start) 100%
      );
    }
  }

  @media (max-width: 640px) {
    padding: 2.4rem;
    min-height: 36rem;

    &::after {
      background: linear-gradient(
        180deg,
        var(--color-hero-grad-end) 0%,
        var(--color-hero-grad-middle) 50%,
        var(--color-hero-grad-start) 100%
      );
    }
  }

  @media (max-width: 420px) {
    padding: 1.8rem;
    min-height: 32rem;
  }
`;

export const HeroImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;

  @media (max-width: 640px) {
    object-position: center 25%;
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
`;

export const BrandMark = styled.div`
  width: 6.4rem;
  height: 6.4rem;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  padding: 0.6rem;
  box-shadow: var(--shadow-sm);

  & img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const HeaderText = styled.div`
  min-width: 0;
  display: grid;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 640px) {
    margin-top: 1.2rem;
  }
`;

export const PublicTitle = styled.h1`
  max-width: 72rem;
  font-size: 4rem;
  line-height: 1.1;
  font-weight: 800;
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    font-size: 3rem;
  }

  @media (max-width: 420px) {
    font-size: 2.7rem;
  }
`;

export const Lead = styled.p`
  max-width: 70rem;
  color: var(--color-grey-600);
  font-size: 1.7rem;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

export const HeaderBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  justify-self: end;
  color: var(--color-brand-800);
  background: var(--color-brand-100);
  border-radius: 999px;
  padding: 0.8rem 1.2rem;
  font-size: 1.3rem;
  font-weight: 800;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 760px) {
    justify-self: start;
  }
`;

export const TrustList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1.6rem;
  margin-top: 0.2rem;
`;

export const TrustItem = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);

  & svg {
    width: 1.7rem;
    height: 1.7rem;
    color: var(--color-brand-600);
  }
`;

export const HeaderActions = styled.div`
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 520px) {
    align-items: stretch;
  }
`;

export const HeaderLink = styled.a`
  min-height: 5.2rem;
  border-radius: var(--border-radius-sm);
  padding: 1.2rem 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: ${(props) => {
    if (props.$whatsapp) return "var(--color-text-inverse)";
    return props.$secondary
      ? "var(--color-grey-700)"
      : "var(--color-text-inverse)";
  }};
  background: ${(props) => {
    if (props.$whatsapp) return "var(--color-channel-whatsapp)";
    return props.$secondary
      ? "var(--color-grey-0)"
      : "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-700) 100%)";
  }};
  border: 1px solid ${(props) => {
    if (props.$whatsapp) return "var(--color-channel-whatsapp)";
    return props.$secondary
      ? "var(--color-grey-200)"
      : "var(--color-brand-600)";
  }};
  font-size: 1.5rem;
  font-weight: 800;
  box-shadow: ${(props) => props.$secondary ? "var(--shadow-sm)" : "var(--shadow-md)"};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    background: ${(props) => {
      if (props.$whatsapp) return "#15803d";
      return props.$secondary
        ? "var(--color-grey-50)"
        : "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-800) 100%)";
    }};
    border-color: ${(props) => {
      if (props.$whatsapp) return "#15803d";
      return props.$secondary
        ? "var(--color-grey-300)"
        : "var(--color-brand-700)";
    }};
    box-shadow: ${(props) => {
      if (props.$whatsapp) return "0 4px 12px rgba(22, 163, 74, 0.25)";
      return props.$secondary
        ? "var(--shadow-md)"
        : "0 6px 16px rgba(13, 128, 80, 0.25)";
    }};
  }

  & svg {
    width: 2rem;
    height: 2rem;
  }

  @media (max-width: 520px) {
    flex: 1 1 100%;
  }
`;

export const AboutSection = styled.section`
  scroll-margin-top: 9rem;
  padding: 3.2rem 0;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(28rem, 0.9fr);
  gap: 2.8rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 1.6rem 0;
    gap: 2rem;
  }
`;

export const AboutCopy = styled.div`
  min-width: 0;
  display: grid;
  gap: 1.4rem;
`;

export const Eyebrow = styled.p`
  color: var(--color-brand-700);
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
`;

export const AboutTitle = styled.h2`
  color: var(--color-grey-900);
  font-size: 2.8rem;
  line-height: 1.15;
  font-weight: 800;
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    font-size: 2.4rem;
  }
`;

export const AboutText = styled.p`
  color: var(--color-grey-600);
  font-size: 1.5rem;
  line-height: 1.7;
`;

export const HighlightList = styled.ul`
  display: grid;
  gap: 0.9rem;
  margin-top: 0.6rem;
`;

export const HighlightItem = styled.li`
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.8rem;
  color: var(--color-grey-700);
  font-size: 1.4rem;
  font-weight: 700;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-surface-steel);
  }
`;

export const AboutPanel = styled.div`
  min-width: 0;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  background: var(--color-grey-50);
  display: grid;
  gap: 1.4rem;

  @media (max-width: 640px) {
    padding: 1.6rem;
  }
`;

export const ProfileLine = styled.div`
  display: grid;
  grid-template-columns: 4.4rem 1fr;
  gap: 1.2rem;
  align-items: center;

  & svg {
    width: 4.4rem;
    height: 4.4rem;
    padding: 1rem;
    border-radius: 50%;
    color: var(--color-accent-400);
    background: var(--color-surface-dark);
  }
`;

export const ProfileName = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: 1.8rem;
`;

export const ProfileRole = styled.span`
  color: var(--color-grey-500);
  font-size: 1.3rem;
  font-weight: 700;
`;

export const AboutStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 520px) {
    gap: 0.6rem;
  }
`;

export const AboutStat = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  padding: 1.2rem;
  background: var(--color-grey-0);

  @media (max-width: 520px) {
    padding: 0.9rem;
  }
`;

export const AboutStatValue = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: 1.9rem;
`;

export const AboutStatLabel = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
`;

export const Section = styled.section`
  scroll-margin-top: 9rem;
  padding: 3.2rem 0;
  display: grid;
  gap: 2rem;

  @media (max-width: 640px) {
    padding: 1.6rem 0;
  }
`;

export const SectionHeader = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.8rem;
  max-width: 72rem;
`;

export const ServicesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
  justify-content: center;

  @media (max-width: 640px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scrollbar-width: none;
    padding-bottom: 0.4rem;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const ServiceCard = styled.button`
  display: flex;
  flex-direction: column;
  flex: 0 0 calc(25% - 1.1rem); /* 4 columns on desktop by default */
  min-width: 25rem;
  border: 2px solid
    ${(props) =>
      props.$active ? "var(--color-action-primary)" : "transparent"};
  border-radius: var(--border-radius-md);
  overflow: hidden;
  text-align: left;
  background: var(--color-grey-0);
  box-shadow: ${(props) =>
    props.$active ? "var(--shadow-lg)" : "var(--shadow-md)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 0;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: ${(props) =>
      props.$active ? "var(--color-action-primary)" : "var(--color-brand-200)"};
  }

  &:active {
    transform: translateY(-2px);
  }

  @media (max-width: 1120px) {
    flex: 0 0 calc(33.333% - 1rem); /* 3 columns */
  }

  @media (max-width: 860px) {
    flex: 0 0 calc(50% - 0.7rem); /* 2 columns */
  }

  @media (max-width: 640px) {
    flex: 0 0 min(88%, 30rem); /* horizontal swipe on mobile, viewport-aware */
    scroll-snap-align: start;
  }

  @media (max-width: 420px) {
    flex-basis: min(84%, 28rem);
  }
`;

export const CardImageContainer = styled.div`
  width: 100%;
  height: 15rem;
  overflow: hidden;
  position: relative;
  background: var(--color-grey-100);

  @media (max-width: 640px) {
    height: 12rem;
  }
`;

export const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;

  ${ServiceCard}:hover & {
    transform: scale(1.06);
  }
`;

export const CardContent = styled.div`
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;

  @media (max-width: 640px) {
    padding: 1.4rem;
    gap: 0.8rem;
  }
`;

export const CardPrice = styled.span`
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-accent-500);
  margin-top: 0.2rem;
`;

export const CardTitle = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.7rem;
  line-height: 1.25;
  font-weight: 800;
`;

export const CardText = styled.p`
  color: var(--color-grey-600);
  font-size: 1.4rem;
  line-height: 1.55;

  @media (max-width: 640px) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export const MiniList = styled.ul`
  display: grid;
  gap: 0.6rem;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const MiniItem = styled.li`
  display: grid;
  grid-template-columns: 1.8rem 1fr;
  gap: 0.6rem;
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 700;

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-grey-500);
  }
`;

export const ProcessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: minmax(24rem, 84%);
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

export const ProcessCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  gap: 1rem;
  background: var(--color-grey-50);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--color-brand-200);
    background: var(--color-grey-0);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 560px) {
    min-height: 21rem;
    scroll-snap-align: start;
  }
`;

export const StepNumber = styled.span`
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-400);
  background: var(--color-surface-dark);
  font-size: 1.4rem;
  font-weight: 800;
`;


export const LocationSection = styled.section`
  scroll-margin-top: 9rem;
  padding: 3.2rem 0;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(36rem, 1.1fr);
  gap: 2rem;
  align-items: stretch;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 1.6rem 0;
  }
`;

export const LocationInfo = styled.div`
  min-width: 0;
  display: grid;
  gap: 1.4rem;
  align-content: start;
`;

export const ContactList = styled.div`
  display: grid;
  gap: 1rem;
`;

export const ContactItem = styled.a`
  min-height: 4.8rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  padding: 1.1rem 1.2rem;
  display: grid;
  grid-template-columns: 2.2rem 1fr;
  gap: 1rem;
  align-items: center;
  color: var(--color-grey-700);
  background: var(--color-grey-50);
  font-size: 1.4rem;
  font-weight: 700;
  min-width: 0;
  overflow-wrap: anywhere;

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }
`;

export const MapBox = styled.div`
  min-height: 34rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-sm);

  @media (max-width: 520px) {
    min-height: 30rem;
  }
`;

export const MapIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
`;

export const FaqGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const FaqItem = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  gap: 0.7rem;
  background: var(--color-grey-50);
`;

export const Footer = styled.footer`
  border-top: 1px solid var(--color-grey-200);
  padding-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-grey-500);
  font-size: 1.3rem;
`;

export const AccordionContainer = styled.div`
  display: grid;
  gap: 1.2rem;
  width: 100%;
`;

export const AccordionItem = styled.div`
  border: 1px solid
    ${(props) => (props.$isOpen ? "var(--color-brand-200)" : "var(--color-grey-100)")};
  border-radius: var(--border-radius-md);
  background: ${(props) => (props.$isOpen ? "var(--color-grey-0)" : "var(--color-grey-50)")};
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.$isOpen ? "var(--shadow-sm)" : "none")};

  &:hover {
    border-color: var(--color-brand-200);
    background: var(--color-grey-0);
  }
`;

export const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  padding: 1.6rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: var(--color-grey-900);

  &:focus-visible {
    outline: 2px solid var(--color-action-primary);
    outline-offset: -2px;
  }
`;

export const AccordionIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-500);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: rotate(${(props) => (props.$isOpen ? "180deg" : "0deg")});

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

export const AccordionContent = styled.div`
  max-height: ${(props) => (props.$isOpen ? "500px" : "0")};
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 1.6rem;
`;

export const StickyCTAContainer = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-nav-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--color-grey-200);
    padding: 1rem 1.6rem calc(1rem + env(safe-area-inset-bottom));
    gap: 0.8rem;
    z-index: 50;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
    animation: cta-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;

    @keyframes cta-slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }

  @media (max-width: 380px) {
    gap: 0.6rem;
    padding: 0.8rem 1.2rem calc(0.8rem + env(safe-area-inset-bottom));
  }

  @media (max-width: 640px) and (max-height: 760px) {
    padding-top: 0.8rem;
    padding-bottom: calc(0.8rem + env(safe-area-inset-bottom));
  }
`;

export const StickyCTAButton = styled.a`
  flex: 1;
  min-height: 4.8rem;
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-extrabold);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-align: center;
  line-height: 1.2;

  color: var(--color-text-inverse);
  background: ${(props) =>
    props.$whatsapp ? "var(--color-channel-whatsapp)" : "var(--color-surface-dark)"};
  border-color: ${(props) =>
    props.$whatsapp ? "var(--color-channel-whatsapp)" : "var(--color-surface-dark)"};

  &:hover {
    transform: translateY(-1px);
    background: ${(props) =>
      props.$whatsapp ? "#15803d" : "var(--color-grey-900)"};
    border-color: ${(props) =>
      props.$whatsapp ? "#15803d" : "var(--color-grey-900)"};
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  & svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  @media (max-width: 380px) {
    font-size: 1.3rem;
    padding: 0.9rem 1rem;
    gap: 0.6rem;
    min-height: 4.4rem;

    & svg {
      width: 1.8rem;
      height: 1.8rem;
    }
  }
`;

export const StepAnimationWrapper = styled.div`
  animation: fadeInStep 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;

  @keyframes fadeInStep {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const HeaderExtraLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-top: 1.6rem;
  font-size: 1.3rem;
  color: var(--color-grey-500);

  & .dot {
    color: var(--color-grey-300);
  }

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;

    & .dot {
      display: none;
    }
  }
`;

export const HeaderExtraLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-grey-600);
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    color: var(--color-brand-700);
    text-decoration: underline;
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-brand-600);
    flex-shrink: 0;
  }
`;

export const SelectedLine = styled.div`
  display: grid;
  grid-template-columns: 2.2rem 1fr;
  gap: 1rem;
  align-items: start;
  color: var(--color-grey-700);
  font-size: 1.4rem;
  font-weight: 600;

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }
`;

export const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

export const GalleryPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.4rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const GalleryPreviewCard = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-brand-200);
  }
`;

export const GalleryPreviewImage = styled.img`
  width: 100%;
  height: 20rem;
  object-fit: cover;
  display: block;
`;

export const GalleryPreviewContent = styled.div`
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex-grow: 1;
`;

export const GalleryPreviewTitle = styled.h4`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-grey-900);
  line-height: 1.3;
`;

export const GalleryPreviewCategory = styled.span`
  align-self: flex-start;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-brand-700);
  background: var(--color-brand-50);
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  text-transform: uppercase;
`;
