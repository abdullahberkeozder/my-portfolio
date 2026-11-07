import styled from "styled-components";
import { Link } from "react-router-dom";
import ResponsiveImage from "../ui/ResponsiveImage";

export const Page = styled.main`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding: 4rem 3.2rem 6.4rem;
  overflow-x: clip;

  @media (max-width: 980px) {
    padding: 2.8rem 2.4rem calc(11rem + env(safe-area-inset-bottom, 0px));
  }

  @media (max-width: 640px) {
    padding: 2.4rem 1.6rem calc(15rem + env(safe-area-inset-bottom, 0px));
  }

  @media (max-width: 380px) {
    padding: 1.6rem 1.2rem calc(15rem + env(safe-area-inset-bottom, 0px));
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
  grid-template-columns: minmax(0, 78rem);
  gap: 2rem;
  align-items: center;
  box-shadow: var(--shadow-sm);

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

  & > *:not([data-hero-image]) {
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
    padding: 2rem;
    min-height: 0;

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

export const HeroImage = styled(ResponsiveImage)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  & img {
    object-fit: cover;
    object-position: center 42%;
  }

  @media (max-width: 640px) {
    & img {
      object-position: center 25%;
    }
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
  background: var(--color-logo-surface);
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
  gap: 1.6rem;

  @media (max-width: 640px) {
    gap: 1.4rem;
  }
`;

export const PublicTitle = styled.h1`
  max-width: 68rem;
  font-size: 4.2rem;
  line-height: 1.12;
  font-weight: 700;
  text-wrap: balance;

  @media (max-width: 640px) {
    max-width: 18ch;
    font-size: 3rem;
    text-wrap: pretty;
  }

  @media (max-width: 420px) {
    font-size: 2.6rem;
  }
`;

export const Lead = styled.p`
  max-width: 60rem;
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

  @media (max-width: 640px) {
    display: none;
  }
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
  margin-top: 0.4rem;

  @media (max-width: 520px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`;

export const HeaderLink = styled.a`
  min-width: 0;
  min-height: 5.2rem;
  border-radius: var(--border-radius-sm);
  padding: 1.2rem 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: ${(props) => {
    return props.$secondary
      ? "var(--color-grey-700)"
      : "var(--color-text-inverse)";
  }};
  background: ${(props) => {
    return props.$secondary
      ? "color-mix(in srgb, var(--color-grey-0) 82%, transparent)"
      : "var(--color-brand-700)";
  }};
  border: 1px solid ${(props) => {
    return props.$secondary
      ? "var(--color-grey-300)"
      : "var(--color-brand-700)";
  }};
  font-size: 1.5rem;
  font-weight: 800;
  box-shadow: ${(props) => props.$secondary ? "none" : "var(--shadow-sm)"};
  transition: transform var(--motion-fast), background var(--motion-fast), border-color var(--motion-fast);
  position: relative;
  overflow: hidden;
  overflow-wrap: anywhere;

  &:hover {
    transform: translateY(-2px);
    background: ${(props) => {
      return props.$secondary
        ? "var(--color-grey-50)"
        : "var(--color-brand-800)";
    }};
    border-color: ${(props) => {
      return props.$secondary
        ? "var(--color-grey-300)"
        : "var(--color-brand-800)";
    }};
    box-shadow: ${(props) => {
      return props.$secondary
        ? "none"
        : "var(--shadow-md)";
    }};
  }

  ${(props) => props.$channel && `
    & svg { color: var(--color-channel-whatsapp); }
  `}

  & svg {
    width: 2rem;
    height: 2rem;
  }

  @media (max-width: 520px) {
    min-width: 0;
    padding-inline: 1.2rem;
  }

  @media (max-width: 300px) {
    padding-inline: 0.6rem;
    font-size: 1.3rem;
    gap: 0.4rem;

    & svg {
      width: 1.7rem;
      height: 1.7rem;
      flex-shrink: 0;
    }
  }
`;

export const TrustBar = styled.section`
  scroll-margin-top: 9rem;
  border-block: 1px solid var(--color-grey-200);
  padding: 1.4rem 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const TrustBarItem = styled.div`
  min-width: 0;
  min-height: 6.4rem;
  padding: 0.8rem 1.6rem;
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
  border-right: 1px solid var(--color-grey-200);

  &:last-child {
    border-right: 0;
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-brand-600);
  }

  & strong,
  & span {
    display: block;
  }

  & strong {
    color: var(--color-grey-900);
    font-size: 1.35rem;
  }

  & span {
    color: var(--color-grey-500);
    font-size: 1.15rem;
    font-weight: 700;
  }

  @media (max-width: 760px) {
    border-right: 0;

    &:not(:last-child) {
      border-bottom: 1px solid var(--color-grey-200);
    }
  }

  @media (max-width: 420px) {
    padding-inline: 0.8rem;
  }
`;

export const AboutSection = styled.section`
  scroll-margin-top: 9rem;
  padding: 3.2rem 0;
  content-visibility: auto;

  @media (max-width: 640px) {
    padding: 1.6rem 0;
  }
`;

export const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 48fr) minmax(0, 52fr);
  gap: 5.6rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3.6rem;
  }
`;

export const AboutVisualColumn = styled.div`
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

export const AboutImageCard = styled.div`
  position: relative;
  width: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: var(--color-surface-steel);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
`;

export const AboutImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  @media (max-width: 900px) {
    aspect-ratio: 16 / 9;
    max-height: 30rem;
  }
`;

export const AboutImageCaption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 1.6rem;
  background: var(--color-grey-50);
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-text-body);
  font-size: var(--font-size-sm);
  
  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-brand-600);
    flex-shrink: 0;
  }

  & strong {
    color: var(--color-grey-900);
    font-weight: var(--font-weight-bold);
  }
`;

export const AboutNarrativeColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
`;

export const AboutHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const Eyebrow = styled.p`
  color: var(--color-brand-700);
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

export const AboutTitle = styled.h2`
  color: var(--color-grey-900);
  font-size: 3.2rem;
  line-height: 1.15;
  font-weight: 800;
  margin: 0;
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    font-size: 2.6rem;
  }
`;

export const AboutText = styled.p`
  color: var(--color-grey-600);
  font-size: 1.55rem;
  line-height: 1.6;
  margin: 0;
  max-width: 60rem;
`;

export const AboutMinimalPrinciples = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
  margin-top: 0.6rem;
`;

export const AboutMinimalPrinciple = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.2rem;
  align-items: baseline;
  color: var(--color-grey-600);
  font-size: 1.45rem;
  line-height: 1.5;

  & span {
    color: var(--color-brand-600);
    font-weight: 800;
    font-size: 1.3rem;
  }

  & strong {
    color: var(--color-grey-900);
    font-weight: 800;
  }
  
  & p {
    margin: 0;
  }
`;

export const Section = styled.section`
  scroll-margin-top: 9rem;
  padding: 3.2rem 0;
  display: grid;
  gap: 2rem;
  content-visibility: auto;
  contain-intrinsic-size: auto 70rem;

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

export const ServiceCard = styled.article`
  display: flex;
  flex-direction: column;
  flex: 0 0 calc(25% - 1.1rem); /* 4 columns on desktop by default */
  min-width: 25rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  text-align: left;
  background: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  padding: 0;

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

export const CardImage = styled(ResponsiveImage)`
  width: 100%;
  height: 100%;

`;

export const ServiceCategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-block: 1px solid var(--color-border-subtle);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const ServiceCategory = styled.article`
  min-width: 0;
  padding: 2rem;
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: 1.4rem;
  border-bottom: 1px solid var(--color-border-subtle);

  &:nth-child(odd) {
    border-right: 1px solid var(--color-border-subtle);
  }

  &:nth-last-child(-n + 2) {
    border-bottom: 0;
  }

  @media (max-width: 720px) {
    padding: 1.6rem 0;

    &:nth-child(odd) {
      border-right: 0;
    }

    &:nth-last-child(2) {
      border-bottom: 1px solid var(--color-border-subtle);
    }
  }
`;

export const ServiceCategoryIcon = styled.span`
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-control);
  display: grid;
  place-items: center;
  color: var(--color-brand-700);
  background: var(--color-brand-50);

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

export const ServiceCategoryCopy = styled.div`
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 0.7rem;
`;

export const ServiceCategoryServices = styled.ul`
  padding-top: 0.5rem;
  display: grid;
  gap: 0.45rem;
  color: var(--color-grey-700);
  font-size: var(--font-size-xs);

  & li {
    display: grid;
    grid-template-columns: 0.7rem minmax(0, 1fr);
    gap: 0.7rem;
  }

  & li::before {
    content: "";
    width: 0.5rem;
    height: 0.5rem;
    margin-top: 0.55rem;
    border-radius: 50%;
    background: var(--color-selection);
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
  display: block;
  padding-top: 1rem;
  border-top: 1px solid var(--color-grey-100);
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

`;

export const CardLabel = styled.span`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
`;

export const PriceFactorList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

export const PriceFactor = styled.li`
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-tiny);
  padding: 0.45rem 0.65rem;
  color: var(--color-grey-700);
  background: var(--color-grey-50);
  font-size: 1.1rem;
  font-weight: 700;
`;

export const ServiceDetails = styled.details`
  border-top: 1px solid var(--color-grey-100);
  padding-top: 0.4rem;

  & summary {
    min-height: 4.4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    color: var(--color-brand-700);
    cursor: pointer;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-extrabold);
    list-style: none;
  }

  & summary::-webkit-details-marker {
    display: none;
  }

  & summary svg {
    width: 1.7rem;
    height: 1.7rem;
    transition: transform var(--motion-base) var(--ease-standard);
  }

  &[open] summary svg {
    transform: rotate(180deg);
  }
`;

export const ServiceDetailsContent = styled.div`
  padding: 0.4rem 0 0.8rem;
  display: grid;
  gap: 1rem;

  & p {
    color: var(--color-grey-600);
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }
`;

export const ServicePlanning = styled.p`
  color: var(--color-grey-600);
  font-size: var(--font-size-xs);
  line-height: 1.5;
`;

export const ServiceCaseLink = styled(Link)`
  min-height: 4.4rem;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  color: var(--color-brand-700);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  text-decoration: underline;
`;

export const ServiceToggleButton = styled.button`
  min-height: 4.4rem;
  justify-self: center;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.9rem 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.3rem;
  font-weight: 800;

  &:hover {
    border-color: var(--color-brand-200);
    color: var(--color-brand-800);
    background: var(--color-brand-50);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    transform: rotate(${(props) => (props["aria-expanded"] ? "180deg" : "0")});
    transition: transform var(--motion-base) var(--ease-standard);
  }
`;

export const MiniList = styled.ul`
  display: grid;
  gap: 0.6rem;
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
  border-block: 1px solid var(--color-border-subtle);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const ProcessCard = styled.article`
  min-width: 0;
  padding: 1.8rem;
  display: grid;
  grid-template-columns: 3.2rem minmax(0, 1fr);
  gap: 1.2rem;
  position: relative;
  border-right: 1px solid var(--color-border-subtle);

  &:last-child {
    border-right: 0;
  }

  & > div {
    display: grid;
    align-content: start;
    gap: 0.5rem;
  }

  @media (max-width: 820px) {
    padding: 1.4rem 0;
    border-right: 0;
    border-bottom: 1px solid var(--color-border-subtle);

    &:last-child {
      border-bottom: 0;
    }
  }
`;

export const StepNumber = styled.span`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: var(--radius-control);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  background: var(--color-selection);
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
  content-visibility: auto;
  contain-intrinsic-size: auto 48rem;

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

export const ServiceAreaSummary = styled.div`
  border-block: 1px solid var(--color-grey-200);
  padding: 1.4rem 0;
  display: grid;
  gap: 1rem;
`;

export const ServiceAreaItem = styled.div`
  display: grid;
  grid-template-columns: 2.2rem minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  color: var(--color-grey-700);
  font-size: 1.35rem;
  font-weight: 700;

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }

  & small {
    display: block;
    margin-top: 0.2rem;
    color: var(--color-grey-500);
    font-size: 1.15rem;
    font-weight: 600;
  }
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
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-component);
  overflow: hidden;
  position: relative;
  background: var(--color-surface-subtle);

  @media (max-width: 520px) {
    min-height: 30rem;
  }
`;

export const MapIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
`;

export const MapPlaceholder = styled.div`
  min-height: inherit;
  padding: 2.4rem;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.8rem;
  color: var(--color-grey-600);
  text-align: center;

  & > svg {
    width: 3rem;
    height: 3rem;
    color: var(--color-brand-700);
  }

  & strong {
    color: var(--color-grey-900);
    font-size: var(--font-size-sm);
  }

  & span {
    max-width: 32rem;
    font-size: var(--font-size-xs);
  }

  & button {
    margin-top: 0.8rem;
  }
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
  padding: 2.4rem 0 1rem;
  display: grid;
  grid-template-columns: minmax(22rem, 1fr) auto;
  align-items: center;
  gap: 1.6rem 3.2rem;
  content-visibility: auto;
  contain-intrinsic-size: auto 20rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

export const FooterBrand = styled.div`
  display: grid;
  align-content: start;
  gap: 1rem;

  & > div {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  & strong {
    color: var(--color-grey-900);
    font-size: 1.7rem;
  }

  & p {
    max-width: 38rem;
    color: var(--color-grey-500);
    font-size: 1.3rem;
  }
`;

export const FooterColumn = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem 1.4rem;

  @media (max-width: 760px) {
    justify-content: flex-start;
  }
`;

export const FooterLink = styled.a`
  min-height: 4.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--color-grey-600);
  font-size: 1.25rem;
  font-weight: 700;

  &:hover {
    color: var(--color-brand-700);
  }

  & svg {
    width: 1.7rem;
    height: 1.7rem;
    color: var(--color-brand-600);
  }
`;

export const FooterBottom = styled.div`
  grid-column: 1 / -1;
  border-top: 1px solid var(--color-grey-100);
  padding-top: 1.4rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0.8rem 1.6rem;
  color: var(--color-grey-500);
  font-size: 1.15rem;
`;

export const AccordionContainer = styled.div`
  display: grid;
  gap: 1.2rem;
  width: 100%;
`;

export const FaqMoreButton = styled.button`
  min-height: 4.4rem;
  width: fit-content;
  justify-self: center;
  border: 0;
  padding: 0.8rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--color-brand-700);
  background: transparent;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);

  & svg {
    width: 1.7rem;
    height: 1.7rem;
    transform: rotate(${(props) => (props.$expanded ? "180deg" : "0")});
    transition: transform var(--motion-fast) var(--ease-standard);
  }
`;

export const AccordionItem = styled.div`
  border: 1px solid
    ${(props) => (props.$isOpen ? "var(--color-brand-200)" : "var(--color-grey-100)")};
  border-radius: var(--border-radius-md);
  background: ${(props) => (props.$isOpen ? "var(--color-grey-0)" : "var(--color-grey-50)")};
  overflow: hidden;
  transition:
    border-color var(--motion-base) var(--ease-standard),
    background-color var(--motion-base) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard);
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
  transition: transform var(--motion-base) var(--ease-standard);
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
  transition:
    max-height var(--motion-base) var(--ease-standard),
    opacity var(--motion-fast) var(--ease-standard);
  padding: 0 1.6rem;
`;

export const StickyCTAContainer = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: flex;
    position: fixed;
    bottom: calc(8.4rem + env(safe-area-inset-bottom, 0px));
    left: 50%;
    transform: translateX(-50%);
    width: min(calc(100vw - 2.8rem), 44rem);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-grey-200);
    background: var(--color-nav-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 0.8rem 1.4rem;
    gap: 0.8rem;
    z-index: 50;
    box-shadow: var(--shadow-sticky);
    animation: cta-slide-up var(--motion-slow) var(--ease-out) both;

    @keyframes cta-slide-up {
      from {
        transform: translate(-50%, 100%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
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
  min-width: 0;
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
  transition:
    color var(--motion-base) var(--ease-standard),
    background-color var(--motion-base) var(--ease-standard),
    border-color var(--motion-base) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
  cursor: pointer;
  text-align: center;
  line-height: 1.2;
  overflow-wrap: anywhere;

  background: ${(props) =>
    props.$whatsapp
      ? "var(--color-channel-whatsapp)"
      : props.$phone
        ? "var(--color-grey-0)"
        : "var(--color-brand-600)"};
  border-color: ${(props) =>
    props.$whatsapp
      ? "var(--color-channel-whatsapp)"
      : props.$phone
        ? "var(--color-grey-300)"
        : "var(--color-brand-600)"};
  color: ${(props) =>
    props.$phone ? "var(--color-grey-800)" : "var(--color-text-inverse)"};

  &:hover {
    transform: translateY(-1px);
    background: ${(props) =>
      props.$whatsapp
        ? "var(--color-channel-whatsapp)"
        : props.$phone
          ? "var(--color-grey-100)"
          : "var(--color-brand-700)"};
    border-color: ${(props) =>
      props.$whatsapp
        ? "var(--color-channel-whatsapp)"
        : props.$phone
          ? "var(--color-grey-400)"
          : "var(--color-brand-700)"};
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
    font-size: 1.15rem;
    padding: 0.8rem 0.5rem;
    gap: 0.4rem;
    min-height: 4.4rem;

    & svg {
      width: 1.8rem;
      height: 1.8rem;
    }
  }
`;

export const StepAnimationWrapper = styled.div`
  animation: fadeInStep var(--motion-base) var(--ease-out) both;

  @keyframes fadeInStep {
    from {
      opacity: 0;
      transform: translateY(6px);
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
    display: none;
  }
`;

export const HeaderExtraLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 4.4rem;
  gap: 0.6rem;
  color: var(--color-grey-600);
  font-weight: 600;
  transition: color var(--motion-base) var(--ease-standard);
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
  gap: 1.6rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const GalleryPreviewCard = styled.article`
  background: var(--color-grey-0);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-component);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const GalleryPreviewImage = styled(ResponsiveImage)`
  width: 100%;
  aspect-ratio: 4 / 3;
  display: block;
`;

export const StickyCTAIconButton = styled.a`
  width: 4.8rem;
  height: 4.8rem;
  flex: 0 0 4.8rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-control);
  display: grid;
  place-items: center;
  color: var(--color-channel-whatsapp);
  background: var(--color-grey-0);
  transition: background var(--motion-fast), border-color var(--motion-fast);

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-channel-whatsapp);
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }

  @media (max-width: 380px) {
    width: 4.4rem;
    height: 4.4rem;
    flex-basis: 4.4rem;
  }
`;

export const GalleryPreviewContent = styled.div`
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex-grow: 1;
`;

export const GalleryPreviewTitle = styled.h3`
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
`;

export const GalleryProofList = styled.div`
  margin-top: 0.4rem;
  display: grid;
  gap: 0.7rem;
`;

export const GalleryProofRow = styled.div`
  display: grid;
  grid-template-columns: 6.4rem minmax(0, 1fr);
  gap: 0.8rem;
  align-items: start;
  font-size: var(--font-size-xs);

  & span {
    color: var(--color-grey-500);
    font-weight: var(--font-weight-bold);
  }

  & p {
    display: -webkit-box;
    overflow: hidden;
    color: var(--color-grey-700);
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;
