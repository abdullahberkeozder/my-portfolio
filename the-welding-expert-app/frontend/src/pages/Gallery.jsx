import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import {
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlineMapPin,
  HiOutlinePhoto,
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

import SEO from "../ui/SEO";
import ContentSkeleton from "../ui/LoadingSkeleton";
import ResponsiveImage from "../ui/ResponsiveImage";
import useScrollReveal from "../hooks/useScrollReveal";
import { getGalleryItems } from "../services/apiGallery";
import { logEvent } from "../services/apiAnalytics";
import { ANALYTICS_EVENTS } from "../analytics/events";
import {
  getGalleryGroupKey,
  getServiceGroupByKey,
  SERVICE_GROUPS,
} from "../config/serviceTaxonomy";
import GalleryCaseDialog from "../features/gallery/GalleryCaseDialog";
import { getGalleryImageAlt } from "../utils/galleryMedia";

const ALL_GROUPS = "all";
const ALL_SUBCATEGORIES = "all";

const ScrollWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;

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

  html.dark-mode &::after {
    background: linear-gradient(
      90deg,
      rgba(17, 24, 39, 0.96) 0%,
      rgba(17, 24, 39, 0.82) 52%,
      rgba(17, 24, 39, 0.34) 100%
    );
  }

  @media (max-width: 760px) {
    &::after {
      background: linear-gradient(
        180deg,
        rgba(251, 251, 249, 0.6) 0%,
        rgba(251, 251, 249, 0.92) 55%,
        rgba(251, 251, 249, 0.98) 100%
      );
    }

    html.dark-mode &::after {
      background: linear-gradient(
        180deg,
        rgba(17, 24, 39, 0.34) 0%,
        rgba(17, 24, 39, 0.84) 52%,
        rgba(17, 24, 39, 0.98) 100%
      );
    }
  }

  @media (max-width: 640px) {
    min-height: 30rem;
    padding: 2rem;
    align-items: end;
  }

  @media (max-width: 420px) {
    min-height: 26rem;
  }
`;

const HeroImage = styled(ResponsiveImage)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  & img {
    object-fit: cover;
    object-position: center 30%;
  }

  @media (max-width: 640px) {
    & img {
      object-position: center 20%;
    }
  }
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

  html.dark-mode & {
    color: var(--color-grey-700);
  }
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
      : "var(--color-text-inverse)"};
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

const ServiceModes = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-block: 1px solid var(--color-grey-100);
  background: transparent;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceMode = styled.div`
  min-width: 0;
  padding: 1.8rem 2.4rem;
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr);
  gap: 1.2rem;
  align-items: start;

  & + & {
    border-left: 1px solid var(--color-grey-100);
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    margin-top: 0.1rem;
    color: var(--color-brand-600);
  }

  & div {
    min-width: 0;
    display: grid;
    gap: 0.3rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem 0.4rem;

    & + & {
      border-top: 1px solid var(--color-grey-100);
      border-left: 0;
    }
  }
`;

const ServiceModeTitle = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: var(--font-size-md);
  line-height: 1.3;
`;

const ServiceModeText = styled.span`
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: 1.5;
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

const GalleryNotice = styled.div`
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 0.6rem;
  color: var(--color-grey-600);
  background: var(--color-grey-50);

  & strong {
    color: var(--color-grey-900);
    font-size: var(--font-size-base);
  }
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
    /* Viewport-aware card width */
    grid-auto-columns: minmax(min(28rem, calc(90vw - 1.6rem)), 90%);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scrollbar-width: none;
    padding-bottom: 0.4rem;
    -webkit-overflow-scrolling: touch;

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

  @media (max-width: 640px) {
    min-height: 18rem;
  }

  @media (max-width: 380px) {
    min-height: 15rem;
  }
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

  @media (max-width: 640px) {
    min-height: 18rem;
  }

  @media (max-width: 380px) {
    min-height: 15rem;
  }
`;

const MediaImage = styled(ResponsiveImage)`
  width: 100%;
  height: 100%;
  min-height: inherit;
`;

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > button:first-child {
      grid-column: 1 / -1;
    }
  }
`;

const FilterButton = styled.button`
  min-height: 4.4rem;
  border: 1px solid
    ${(props) => (props.$active ? "var(--color-brand-700)" : "var(--color-grey-200)")};
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  color: ${(props) => (props.$active ? "var(--color-text-inverse)" : "var(--color-grey-700)")};
  background: ${(props) => (props.$active ? "var(--color-brand-700)" : "var(--color-grey-0)")};
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  line-height: 1.3;

  &:hover {
    border-color: var(--color-brand-500);
  }
`;

const SubcategoryFilters = styled.div`
  border-top: 1px solid var(--color-grey-100);
  padding-top: 1.2rem;
  display: grid;
  gap: 0.8rem;
`;

const SubcategoryLabel = styled.p`
  color: var(--color-grey-600);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
`;

const SubcategoryFilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const SubcategoryButton = styled(FilterButton)`
  color: ${(props) =>
    props.$active ? "var(--color-brand-800)" : "var(--color-grey-700)"};
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-grey-0)"};

  @media (max-width: 520px) {
    flex: 1 1 calc(50% - 0.4rem);
  }
`;

const ImageLabel = styled.span`
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  z-index: 1;
  border-radius: 999px;
  padding: 0.5rem 0.8rem;
  color: #ffffff;
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

  html.dark-mode & {
    color: var(--color-brand-200);
    background: rgba(16, 185, 129, 0.15);
  }
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

  @media (max-width: 640px) {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const MiniList = styled.ul`
  display: grid;
  gap: 0.6rem;

  @media (max-width: 640px) {
    display: none;
  }
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

const CaseButton = styled.button`
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.9rem 1.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: var(--color-grey-800);
  background: var(--color-grey-0);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);

  &:hover {
    border-color: var(--color-brand-300);
    color: var(--color-brand-800);
    background: var(--color-brand-50);
  }

  & svg {
    width: 1.8rem;
    height: 1.8rem;
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
    /* Fixed row height for horizontal scroll view */
    grid-template-rows: 20rem;
    grid-auto-flow: column;
    /* Viewport-aware column widths — never exceeds screen */
    grid-auto-columns: minmax(min(22rem, calc(82vw)), 84%);
    grid-auto-rows: 20rem;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scrollbar-width: none;
    padding-bottom: 0.4rem;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const PhotoTile = styled.button`
  position: relative;
  overflow: hidden;
  border: 0;
  border-radius: var(--border-radius-md);
  padding: 0;
  text-align: left;
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
    border-radius: var(--border-radius-sm);

    &:first-child {
      grid-row: span 1;
    }
  }
`;

const PhotoCaption = styled.span`
  position: absolute;
  left: 1.4rem;
  right: 1.4rem;
  bottom: 1.4rem;
  z-index: 1;
  color: #ffffff;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-extrabold);
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
  background: linear-gradient(
    135deg,
    var(--color-surface-dark),
    var(--color-brand-800)
  );
  border: 1px solid rgba(251, 251, 249, 0.12);

  & ${MutedText} {
    color: var(--color-text-inverse-muted);
  }

  & ${SectionTitle} {
    color: var(--color-text-inverse);
  }
`;

function Gallery() {
  useScrollReveal();
  const [activeGroup, setActiveGroup] = useState(ALL_GROUPS);
  const [activeSubcategory, setActiveSubcategory] = useState(ALL_SUBCATEGORIES);
  const [selectedCase, setSelectedCase] = useState(null);
  const {
    data: allItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["gallery-items-public"],
    queryFn: () => getGalleryItems({ publishedOnly: true }),
  });

  const availableGroups = useMemo(
    () => SERVICE_GROUPS.filter((group) =>
      allItems.some((item) => getGalleryGroupKey(item.category) === group.key),
    ),
    [allItems],
  );

  const activeGroupConfig = getServiceGroupByKey(activeGroup);

  const subcategories = useMemo(() => {
    if (activeGroup === ALL_GROUPS) return [];

    return Array.from(
      new Set(
        allItems
          .filter((item) => getGalleryGroupKey(item.category) === activeGroup)
          .map((item) => item.category)
          .filter(Boolean),
      ),
    );
  }, [activeGroup, allItems]);

  const filteredItems = useMemo(
    () => allItems.filter((item) => {
      if (activeGroup === ALL_GROUPS) return true;
      if (getGalleryGroupKey(item.category) !== activeGroup) return false;
      return activeSubcategory === ALL_SUBCATEGORIES ||
        item.category === activeSubcategory;
    }),
    [activeGroup, activeSubcategory, allItems],
  );

  // Önce/sonra: before_image_url olan öğeler
  const workExamples = useMemo(
    () => filteredItems.filter((item) => item.before_image_url),
    [filteredItems],
  );

  const galleryItems = useMemo(
    () => filteredItems,
    [filteredItems],
  );

  const closeCase = useCallback(() => setSelectedCase(null), []);

  function openCase(item, placement) {
    setSelectedCase(item);
    logEvent(ANALYTICS_EVENTS.GALLERY_CASE_VIEWED, {
      case_id: item.id,
      case_title: item.title,
      category: item.category,
      placement,
    });
  }

  function selectGroup(groupKey) {
    const resultCount = groupKey === ALL_GROUPS
      ? allItems.length
      : allItems.filter(
        (item) => getGalleryGroupKey(item.category) === groupKey,
      ).length;

    setActiveGroup(groupKey);
    setActiveSubcategory(ALL_SUBCATEGORIES);
    logEvent(ANALYTICS_EVENTS.GALLERY_FILTER_SELECTED, {
      group: groupKey,
      subcategory: null,
      result_count: resultCount,
    });
  }

  function selectSubcategory(subcategory) {
    const resultCount = allItems.filter((item) =>
      getGalleryGroupKey(item.category) === activeGroup &&
      (subcategory === ALL_SUBCATEGORIES || item.category === subcategory),
    ).length;

    setActiveSubcategory(subcategory);
    logEvent(ANALYTICS_EVENTS.GALLERY_FILTER_SELECTED, {
      group: activeGroup,
      subcategory:
        subcategory === ALL_SUBCATEGORIES ? null : subcategory,
      result_count: resultCount,
    });
  }

  if (isLoading) {
    return (
      <Page>
        <Shell>
          <TopBar>
            <BackLink to="/appointment">
              <HiOutlineArrowLeft />
              Randevu sayfasına dön
            </BackLink>
          </TopBar>
          <ContentSkeleton label="İş örnekleri yükleniyor" />
        </Shell>
      </Page>
    );
  }

  return (
    <Page>
      <SEO
        title="Galeri | Umut Usta Ankara Bakım Onarım İşleri"
        description="Umut Usta'nın tamamladığı metal kaynak, korkuluk montajı, bahçe düzenleme ve ev bakım işleri galerisini inceleyin."
        canonicalPath="/gallery"
      />
      <Shell>
        <TopBar>
          <BackLink to="/appointment">
            <HiOutlineArrowLeft />
            Randevu sayfasına dön
          </BackLink>
        </TopBar>

        <Hero data-reveal>
          <HeroImage
            src="/images/hero.png"
            alt="Kaynak maskesiyle metal parça üzerinde çalışan usta"
            sizes="(max-width: 760px) 100vw, 1200px"
            fetchpriority="high"
            loading="eager"
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
                Randevu al
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

        <ServiceModes aria-label="Çalışma biçimleri" data-reveal>
          <ServiceMode>
            <HiOutlineMapPin aria-hidden="true" />
            <div>
              <ServiceModeTitle>Adresinizde hizmet</ServiceModeTitle>
              <ServiceModeText>Ankara&apos;da yerinde keşif ve uygulama</ServiceModeText>
            </div>
          </ServiceMode>
          <ServiceMode>
            <HiOutlineWrenchScrewdriver aria-hidden="true" />
            <div>
              <ServiceModeTitle>Atölyede üretim</ServiceModeTitle>
              <ServiceModeText>Özel ölçü imalat ve kontrollü onarım</ServiceModeText>
            </div>
          </ServiceMode>
        </ServiceModes>

        {isError && (
          <GalleryNotice role="alert">
            <strong>İş galerisi şu anda yüklenemiyor.</strong>
            <span>Lütfen bağlantınızı kontrol edip daha sonra tekrar deneyin.</span>
          </GalleryNotice>
        )}

        {!isError && galleryItems.length === 0 && (
          <GalleryNotice>
            <strong>Bu kategoride yayınlanmış iş örneği bulunmuyor.</strong>
            <span>Başka bir kategori seçerek diğer çalışmaları inceleyebilirsiniz.</span>
          </GalleryNotice>
        )}

        {!isError && allItems.length > 0 && (
          <Section aria-labelledby="gallery-filter-title" data-reveal>
            <SectionHeader>
              <Eyebrow>Hizmete göre keşfet</Eyebrow>
              <SectionTitle id="gallery-filter-title">İş örneklerini filtreleyin</SectionTitle>
              <MutedText>
                İhtiyacınıza en yakın hizmeti seçin; önce/sonra vakaları ve tamamlanan uygulamalar birlikte güncellensin.
              </MutedText>
            </SectionHeader>
            <FilterBar role="group" aria-label="Ana hizmet kategorileri">
              <FilterButton
                type="button"
                $active={activeGroup === ALL_GROUPS}
                aria-pressed={activeGroup === ALL_GROUPS}
                onClick={() => selectGroup(ALL_GROUPS)}>
                Tümü
              </FilterButton>
              {availableGroups.map((group) => (
                <FilterButton
                  key={group.key}
                  type="button"
                  $active={activeGroup === group.key}
                  aria-pressed={activeGroup === group.key}
                  onClick={() => selectGroup(group.key)}>
                  {group.title}
                </FilterButton>
              ))}
            </FilterBar>
            {subcategories.length > 1 && (
              <SubcategoryFilters>
                <SubcategoryLabel>
                  {activeGroupConfig?.title} içinde iş türü
                </SubcategoryLabel>
                <SubcategoryFilterBar
                  role="group"
                  aria-label={`${activeGroupConfig?.title} alt kategorileri`}>
                  <SubcategoryButton
                    type="button"
                    $active={activeSubcategory === ALL_SUBCATEGORIES}
                    aria-pressed={activeSubcategory === ALL_SUBCATEGORIES}
                    onClick={() => selectSubcategory(ALL_SUBCATEGORIES)}>
                    Bu gruptaki tüm işler
                  </SubcategoryButton>
                  {subcategories.map((subcategory) => (
                    <SubcategoryButton
                      key={subcategory}
                      type="button"
                      $active={activeSubcategory === subcategory}
                      aria-pressed={activeSubcategory === subcategory}
                      onClick={() => selectSubcategory(subcategory)}>
                      {subcategory}
                    </SubcategoryButton>
                  ))}
                </SubcategoryFilterBar>
              </SubcategoryFilters>
            )}
          </Section>
        )}

        {!isError && workExamples.length > 0 && (
          <Section data-reveal>
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
                  <WorkCard key={item.id}>
                    <CompareGrid>
                      <CompareMedia>
                        <MediaImage
                          src={item.before_image_url}
                          sizes="(max-width: 640px) 88vw, 50vw"
                          alt={getGalleryImageAlt(item, "before")}
                          loading="lazy"
                          decoding="async"
                        />
                        <ImageLabel>{item.before_label || "Öncesi"}</ImageLabel>
                      </CompareMedia>
                      <CompareMedia>
                        <MediaImage
                          src={item.image_url}
                          sizes="(max-width: 640px) 88vw, 50vw"
                          alt={getGalleryImageAlt(item)}
                          loading="lazy"
                          decoding="async"
                        />
                        <ImageLabel>{item.after_label || "Sonrası"}</ImageLabel>
                      </CompareMedia>
                    </CompareGrid>
                    <WorkBody>
                      <MetaRow>
                        <Pill>{item.category}</Pill>
                        {item.location && <Pill>{item.location}</Pill>}
                        {item.price_tagline && <Pill>{item.price_tagline}</Pill>}
                      </MetaRow>
                      <CardTitle>{item.title}</CardTitle>
                      {item.description && <CardText>{item.description}</CardText>}
                      {item.points && item.points.length > 0 && (
                        <MiniList>
                          {item.points.map((point) => (
                            <MiniItem key={point}>
                              <HiOutlineCheckCircle />
                              {point}
                            </MiniItem>
                          ))}
                        </MiniList>
                      )}
                      <CaseButton type="button" onClick={() => openCase(item, "before_after")}>
                        <HiOutlineEye aria-hidden="true" />
                        Vaka detayını incele
                      </CaseButton>
                    </WorkBody>
                  </WorkCard>
                ))}
              </WorkGrid>
            </ScrollWrapper>
          </Section>
        )}

        {!isError && galleryItems.length > 0 && (
          <Section data-reveal>
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
                  <PhotoTile
                    key={item.id}
                    type="button"
                    onClick={() => openCase(item, "gallery_grid")}
                    aria-label={`${item.title} vaka detayını incele`}>
                    <MediaImage
                      src={item.image_url}
                      sizes="(max-width: 640px) 88vw, 33vw"
                      alt={getGalleryImageAlt(item)}
                      loading="lazy"
                      decoding="async"
                    />
                    <PhotoCaption>{item.title}</PhotoCaption>
                  </PhotoTile>
                ))}
              </PhotoGrid>
            </ScrollWrapper>
          </Section>
        )}

        <Cta>
          <div>
            <SectionTitle>Benzer bir iş için uygun randevuyu seçin</SectionTitle>
            <MutedText>
              İşin fotoğraflarını WhatsApp üzerinden paylaşarak daha doğru bir
              ön değerlendirme alabilirsiniz.
            </MutedText>
          </div>
          <ActionLink
            to="/appointment#appointment-calendar"
            onClick={() => logEvent(ANALYTICS_EVENTS.GALLERY_BOOKING_CTA_CLICKED, {
              group: activeGroup,
              subcategory:
                activeSubcategory === ALL_SUBCATEGORIES
                  ? null
                  : activeSubcategory,
              placement: "gallery_footer",
            })}>
            <HiOutlineSparkles />
            Randevuya git
          </ActionLink>
        </Cta>
      </Shell>
      {selectedCase && (
        <GalleryCaseDialog
          item={selectedCase}
          onClose={closeCase}
          onBook={() => logEvent(ANALYTICS_EVENTS.GALLERY_BOOKING_CTA_CLICKED, {
            case_id: selectedCase.id,
            case_title: selectedCase.title,
            category: selectedCase.category,
            placement: "case_dialog",
          })}
        />
      )}
    </Page>
  );
}

export default Gallery;
