import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled, { css } from "styled-components";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhoto,
  HiOutlineInformationCircle,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineWrenchScrewdriver,
  HiOutlineXCircle,
} from "react-icons/hi2";

import Button from "../ui/Button";
import Heading from "../ui/Heading";
import AppNav from "../ui/AppNav";
import AppScrollRail from "../ui/AppScrollRail";
import { getAvailabilityDays } from "../services/apiAvailability";
import { createAppointmentRequest } from "../services/apiAppointmentRequests";

const BUSINESS_WHATSAPP_NUMBER = "905551112233";
const BUSINESS_EMAIL = "info@theweldingexpert.com";
const OPENING_HOUR = 9;
const CLOSING_HOUR = 21;
const SLOT_DURATION_HOURS = 2;

const serviceTypes = [
  "Kapı / korkuluk tamiri",
  "Özel metal imalat",
  "Menteşe ve kaynak onarımı",
  "Yerinde keşif ve teklif",
];

const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
});

const compactDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
});

const longDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const statusLabel = {
  available: "Müsait",
  limited: "Kısıtlı",
  closed: "Kapalı",
  unavailable: "Kullanılamaz",
};

const aboutHighlights = [
  "Yerinde keşif ve net teklif",
  "Kapı, korkuluk, ferforje ve onarım işleri",
  "Randevulu çalışma ve zamanında teslim",
];

const serviceOverview = [
  {
    title: "Kapı ve korkuluk tamiri",
    text: "Apartman, balkon, bahçe ve iş yeri korkuluklarında kaynak onarımı, sağlamlaştırma ve parça değişimi.",
    serviceType: "Kapı / korkuluk tamiri",
    points: ["Yerinde kontrol", "Kaynak onarımı", "Sağlamlık kontrolü"],
  },
  {
    title: "Özel metal imalat",
    text: "Ölçüye göre masa ayağı, raf taşıyıcı, metal çerçeve ve atölyeye özel parça imalatı.",
    serviceType: "Özel metal imalat",
    points: ["Ölçü alma", "Malzeme seçimi", "Temiz teslim"],
  },
  {
    title: "Menteşe ve kaynak onarımı",
    text: "Kopan, çatlayan veya gevşeyen metal parçalarda pratik ve dayanıklı kaynak uygulamaları.",
    serviceType: "Menteşe ve kaynak onarımı",
    points: ["Hızlı tespit", "Parça sabitleme", "Kullanım testi"],
  },
  {
    title: "Yerinde keşif ve teklif",
    text: "İşin kapsamı, süresi ve malzeme ihtiyacı netleştirilir; uygun tarih için randevu planlanır.",
    serviceType: "Yerinde keşif ve teklif",
    points: ["Fotoğrafla ön bilgi", "Net zaman planlama", "Teklif paylaşımı"],
  },
];

const processSteps = [
  {
    title: "Talep oluşturun",
    text: "Takvimden iki saatlik uygun bir aralık seçin ve ihtiyacınızı kısaca anlatın.",
  },
  {
    title: "Ayrıntıları netleştirelim",
    text: "Gerekirse fotoğraf, ölçü veya adres bilgilerini WhatsApp üzerinden paylaşın.",
  },
  {
    title: "Keşif ve teklif",
    text: "İşin kapsamına göre yerinde keşif yapılır veya doğrudan teklif hazırlanır.",
  },
  {
    title: "Uygulama ve teslim",
    text: "Onaylanan randevu saatinde çalışma yapılır ve kullanıma hazır biçimde teslim edilir.",
  },
];

const faqItems = [
  {
    question: "Yerinde servis veriyor musunuz?",
    answer:
      "Evet. Ankara merkez ve yakın ilçeler için yerinde keşif ve kaynak onarımı planlanabilir.",
  },
  {
    question: "Randevu aralıkları neden iki saatlik?",
    answer:
      "Kaynak işlerinde hazırlık, uygulama ve kontrol aşamaları bulunduğu için ortalama çalışma süresi iki saat kabul edilir.",
  },
  {
    question: "Fiyat nasıl belirlenir?",
    answer:
      "Fiyat; işçilik, malzeme, yerinde servis ihtiyacı ve işin zorluğuna göre netleştirilir.",
  },
  {
    question: "Atölyeye gelebilir miyim?",
    answer:
      "Evet. Atölye görüşmeleri için önceden randevu almanız önerilir.",
  },
];

const businessAddress =
  "Ostim OSB, 100. Yıl Bulvarı No:45, Yenimahalle / Ankara";
const mapQuery = encodeURIComponent(businessAddress);

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
  min-width: 0;
  max-width: 118rem;
  margin: 0 auto;
  display: grid;
  gap: 2.4rem;

  & > * {
    min-width: 0;
  }
`;

const PublicHeader = styled.header`
  min-width: 0;
  background: linear-gradient(135deg, #111827 0%, #374151 58%, #92400e 100%);
  color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: center;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 2.4rem;
  }

  @media (max-width: 420px) {
    padding: 2rem;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const BrandMark = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #facc15;
  background: rgba(255, 255, 255, 0.12);

  & svg {
    width: 2.6rem;
    height: 2.6rem;
  }
`;

const HeaderText = styled.div`
  min-width: 0;
  display: grid;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 640px) {
    margin-top: 1.2rem;
  }
`;

const PublicTitle = styled.h1`
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

const Lead = styled.p`
  max-width: 70rem;
  color: #e5e7eb;
  font-size: 1.7rem;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const HeaderBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  justify-self: end;
  color: var(--color-green-700);
  background: var(--color-green-100);
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

const HeaderActions = styled.div`
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 520px) {
    align-items: stretch;
  }
`;

const HeaderLink = styled.a`
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

const AboutSection = styled.section`
  scroll-margin-top: 9rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.8rem;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(28rem, 0.9fr);
  gap: 2.8rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 2rem;
    gap: 2rem;
  }
`;

const AboutCopy = styled.div`
  min-width: 0;
  display: grid;
  gap: 1.4rem;
`;

const Eyebrow = styled.p`
  color: var(--color-brand-700);
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
`;

const AboutTitle = styled.h2`
  color: var(--color-grey-900);
  font-size: 2.8rem;
  line-height: 1.15;
  font-weight: 800;
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    font-size: 2.4rem;
  }
`;

const AboutText = styled.p`
  color: var(--color-grey-600);
  font-size: 1.5rem;
  line-height: 1.7;
`;

const HighlightList = styled.ul`
  display: grid;
  gap: 0.9rem;
  margin-top: 0.6rem;
`;

const HighlightItem = styled.li`
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.8rem;
  color: var(--color-grey-700);
  font-size: 1.4rem;
  font-weight: 700;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-green-700);
  }
`;

const AboutPanel = styled.div`
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

const ProfileLine = styled.div`
  display: grid;
  grid-template-columns: 4.4rem 1fr;
  gap: 1.2rem;
  align-items: center;

  & svg {
    width: 4.4rem;
    height: 4.4rem;
    padding: 1rem;
    border-radius: 50%;
    color: #facc15;
    background: #111827;
  }
`;

const ProfileName = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: 1.8rem;
`;

const ProfileRole = styled.span`
  color: var(--color-grey-500);
  font-size: 1.3rem;
  font-weight: 700;
`;

const AboutStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const AboutStat = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  padding: 1.2rem;
  background: var(--color-grey-0);
`;

const AboutStatValue = styled.strong`
  display: block;
  color: var(--color-grey-900);
  font-size: 1.9rem;
`;

const AboutStatLabel = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
`;

const Section = styled.section`
  scroll-margin-top: 9rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.8rem;
  display: grid;
  gap: 2rem;

  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

const SectionHeader = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.8rem;
  max-width: 72rem;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.4rem;

  @media (max-width: 1120px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.button`
  min-height: 24rem;
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-brand-600)" : "var(--color-grey-100)"};
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 1.4rem;
  align-content: start;
  text-align: left;
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-grey-0)"};
  box-shadow: ${(props) => (props.$active ? "var(--shadow-sm)" : "none")};

  &:hover {
    border-color: var(--color-brand-600);
    background: var(--color-brand-50);
  }

  @media (max-width: 640px) {
    min-height: auto;
    padding: 1.6rem;
  }
`;

const ServiceIcon = styled.span`
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #facc15;
  background: #111827;

  & svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

const CardTitle = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.7rem;
  line-height: 1.25;
  font-weight: 800;
`;

const CardText = styled.p`
  color: var(--color-grey-600);
  font-size: 1.4rem;
  line-height: 1.55;
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

const ProcessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ProcessCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  gap: 1rem;
  background: var(--color-grey-50);
`;

const StepNumber = styled.span`
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-0);
  background: var(--color-brand-600);
  font-size: 1.4rem;
  font-weight: 800;
`;

const ContentGrid = styled.div`
  scroll-margin-top: 9rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36rem;
  gap: 2.4rem;
  align-items: start;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 2rem;

  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

const PanelHeader = styled.div`
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 1.6rem;
  align-items: end;

  @media (max-width: 760px) {
    align-items: start;
    flex-direction: column;
  }
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

const AvailabilityNotice = styled.div`
  border: 1px solid
    ${(props) =>
      props.$error ? "var(--color-red-100)" : "var(--color-grey-200)"};
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: ${(props) =>
    props.$error ? "var(--color-red-700)" : "var(--color-grey-600)"};
  background: ${(props) =>
    props.$error ? "var(--color-red-100)" : "var(--color-grey-50)"};
  font-size: 1.3rem;
  font-weight: 700;
`;

const DateToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.4rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-50);

  @media (max-width: 640px) {
    align-items: stretch;
  }
`;

const DatePicker = styled.label`
  display: grid;
  gap: 0.5rem;
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 800;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const DateInput = styled.input`
  width: 100%;
  min-height: 4.2rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  background: var(--color-grey-0);
  color: var(--color-grey-800);
  font: inherit;
`;

const WeekControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const IconButton = styled.button`
  width: 4.2rem;
  height: 4.2rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-700);
  background: var(--color-grey-0);

  &:hover {
    border-color: var(--color-brand-600);
    color: var(--color-brand-700);
  }

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    cursor: not-allowed;
  }

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const WeekLabel = styled.strong`
  color: var(--color-grey-800);
  font-size: 1.4rem;
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(7, minmax(13.6rem, 1fr));
    overflow-x: auto;
    padding-bottom: 0.6rem;
  }
`;

const DayButton = styled.button`
  min-height: 13.8rem;
  border: 1px solid
    ${(props) =>
      props.$selected ? "var(--color-brand-600)" : "var(--color-grey-100)"};
  border-radius: var(--border-radius-md);
  padding: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  text-align: left;
  background: ${(props) =>
    props.$selected ? "var(--color-brand-50)" : "var(--color-grey-0)"};
  box-shadow: ${(props) => (props.$selected ? "var(--shadow-md)" : "none")};

  ${(props) =>
    props.$disabled &&
    css`
      color: var(--color-grey-400);
      background: var(--color-grey-50);
      cursor: not-allowed;
    `}

  &:hover {
    border-color: ${(props) =>
      props.$disabled ? "var(--color-grey-100)" : "var(--color-brand-600)"};
  }
`;

const DayName = styled.span`
  color: var(--color-grey-900);
  font-size: 1.5rem;
  font-weight: 800;
  text-transform: capitalize;
`;

const DayDate = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
`;

const StatusBadge = styled.span`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 1.1rem;
  font-weight: 800;

  ${(props) =>
    props.$status === "available" &&
    css`
      color: var(--color-green-700);
      background: var(--color-green-100);
    `}

  ${(props) =>
    props.$status === "limited" &&
    css`
      color: var(--color-yellow-700);
      background: var(--color-yellow-100);
    `}

  ${(props) =>
    props.$status === "closed" &&
    css`
      color: var(--color-grey-600);
      background: var(--color-grey-100);
    `}

  ${(props) =>
    props.$status === "unavailable" &&
    css`
      color: var(--color-red-700);
      background: var(--color-red-100);
    `}

  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const DaySlotCount = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
`;

const SlotPanel = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 1.4rem;

  @media (max-width: 640px) {
    padding: 1.4rem;
  }
`;

const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 760px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 460px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SlotButton = styled.button`
  min-height: 4.2rem;
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-brand-600)" : "var(--color-grey-200)"};
  border-radius: var(--border-radius-sm);
  color: ${(props) =>
    props.$active ? "var(--color-brand-700)" : "var(--color-grey-700)"};
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-grey-0)"};
  font-size: 1.3rem;
  font-weight: 800;

  &:hover {
    border-color: var(--color-brand-600);
    background: var(--color-brand-50);
  }

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    text-decoration: line-through;
    cursor: not-allowed;
  }
`;

const EmptySlots = styled.div`
  min-height: 8.4rem;
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1.2rem;
  color: var(--color-grey-500);
  display: grid;
  align-content: center;
  gap: 0.4rem;
  font-size: 1.3rem;
  font-weight: 700;
`;

const SummaryPanel = styled.aside`
  min-width: 0;
  position: sticky;
  top: 2rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 1.8rem;

  @media (max-width: 1180px) {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

const SummaryBlock = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const SelectedBox = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  gap: 1.2rem;
  background: var(--color-grey-50);
`;

const SelectedLine = styled.div`
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

const FieldGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const Field = styled.label`
  display: grid;
  gap: 0.5rem;
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  background: var(--color-grey-0);
`;

const Textarea = styled.textarea`
  min-height: 8.8rem;
  resize: vertical;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  background: var(--color-grey-0);
`;

const ServiceList = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const ServiceOption = styled.button`
  min-height: 4rem;
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-brand-600)" : "var(--color-grey-200)"};
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  text-align: left;
  color: ${(props) =>
    props.$active ? "var(--color-brand-700)" : "var(--color-grey-700)"};
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-grey-0)"};
  font-size: 1.3rem;
  font-weight: 700;
`;

const ChannelGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const ChannelLink = styled.a`
  min-height: 4.6rem;
  border-radius: var(--border-radius-sm);
  padding: 1.2rem 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: ${(props) =>
    props.$disabled ? "var(--color-grey-500)" : "var(--color-grey-0)"};
  background: ${(props) =>
    props.$disabled ? "var(--color-grey-200)" : props.$color};
  font-size: 1.4rem;
  font-weight: 800;
  pointer-events: ${(props) => (props.$disabled ? "none" : "auto")};

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const LocationSection = styled.section`
  scroll-margin-top: 9rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.8rem;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(36rem, 1.1fr);
  gap: 2rem;
  align-items: stretch;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

const LocationInfo = styled.div`
  min-width: 0;
  display: grid;
  gap: 1.4rem;
  align-content: start;
`;

const ContactList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ContactItem = styled.a`
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

const MapBox = styled.div`
  min-height: 34rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  position: relative;
  background:
    linear-gradient(90deg, transparent 49%, rgba(79, 70, 229, 0.18) 50%, transparent 51%),
    linear-gradient(0deg, transparent 49%, rgba(79, 70, 229, 0.14) 50%, transparent 51%),
    linear-gradient(135deg, transparent 42%, rgba(17, 24, 39, 0.12) 43%, rgba(17, 24, 39, 0.12) 47%, transparent 48%),
    linear-gradient(35deg, transparent 45%, rgba(146, 64, 14, 0.18) 46%, rgba(146, 64, 14, 0.18) 50%, transparent 51%),
    var(--color-grey-50);
  background-size: 8rem 8rem, 8rem 8rem, 100% 100%, 100% 100%, auto;

  @media (max-width: 520px) {
    min-height: 30rem;
  }
`;

const MapPin = styled.div`
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  display: grid;
  justify-items: center;
  gap: 0.8rem;
`;

const PinIcon = styled.span`
  width: 5.2rem;
  height: 5.2rem;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #facc15;
  background: #111827;
  box-shadow: var(--shadow-md);

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    transform: rotate(45deg);
  }
`;

const PinCard = styled.div`
  max-width: 30rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.4rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-md);
  text-align: center;

  @media (max-width: 520px) {
    max-width: 24rem;
    padding: 1.2rem;
  }
`;

const MapOpenLink = styled.a`
  position: absolute;
  right: 1.4rem;
  bottom: 1.4rem;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  color: var(--color-grey-0);
  background: var(--color-brand-600);
  font-size: 1.3rem;
  font-weight: 800;

  @media (max-width: 520px) {
    left: 1.2rem;
    right: 1.2rem;
    text-align: center;
  }
`;

const FaqGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const FaqItem = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  gap: 0.7rem;
  background: var(--color-grey-50);
`;

const Footer = styled.footer`
  border-top: 1px solid var(--color-grey-200);
  padding-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-grey-500);
  font-size: 1.3rem;
`;

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function formatDateKey(date) {
  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join("-");
}

function parseDateKey(dateKey) {
  return new Date(`${dateKey}T00:00:00`);
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + amount);
  return nextDate;
}

function startOfWeek(date) {
  const weekStart = new Date(date);
  const dayIndex = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - dayIndex);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function buildUnavailableSlots() {
  return Array.from(
    { length: (CLOSING_HOUR - OPENING_HOUR) / SLOT_DURATION_HOURS },
    (_, index) => {
      const hour = OPENING_HOUR + index * SLOT_DURATION_HOURS;
      const endHour = hour + SLOT_DURATION_HOURS;
      const time = `${padNumber(hour)}:00`;
      const endTime = `${padNumber(endHour)}:00`;

      return {
        id: time,
        time,
        endTime,
        label: `${time} - ${endTime}`,
        isAvailable: false,
        note: null,
      };
    },
  );
}

function buildUnavailableDay(date, reason) {
  const dateValue = formatDateKey(date);
  const stateCopy = {
    loading: {
      statusText: "Yükleniyor",
      note: "Müsaitlik bilgileri yükleniyor. Lütfen bekleyin.",
    },
    error: {
      statusText: "Bağlantı hatası",
      note: "Müsaitlik bilgileri şu anda alınamıyor. Lütfen tekrar deneyin.",
    },
    missing: {
      statusText: "Planlanmadı",
      note: "Bu tarih için henüz müsaitlik planı oluşturulmadı.",
    },
  }[reason];

  return {
    id: dateValue,
    dateValue,
    status: "unavailable",
    statusText: stateCopy.statusText,
    note: stateCopy.note,
    slots: buildUnavailableSlots(),
    dayName: dayFormatter.format(date),
    dateLabel: compactDateFormatter.format(date),
    fullDate: longDateFormatter.format(date),
  };
}

function mapAvailabilityFromSupabase(days) {
  return days.map((day) => {
    const date = parseDateKey(day.work_date);
    const slots = [...(day.appointment_availability_slots || [])]
      .filter((slot) => {
        const hour = Number(slot.slot_time.slice(0, 2));
        const minute = slot.slot_time.slice(3, 5);

        return (
          hour >= OPENING_HOUR &&
          hour + SLOT_DURATION_HOURS <= CLOSING_HOUR &&
          minute === "00" &&
          (hour - OPENING_HOUR) % SLOT_DURATION_HOURS === 0
        );
      })
      .sort((a, b) => a.slot_time.localeCompare(b.slot_time))
      .map((slot) => {
        const time = slot.slot_time.slice(0, 5);
        const hour = Number(time.slice(0, 2));
        const endTime = `${padNumber(hour + SLOT_DURATION_HOURS)}:00`;

        return {
          id: slot.id,
          time,
          endTime,
          label: `${time} - ${endTime}`,
          isAvailable: slot.is_available,
          note: slot.note,
        };
      });

    return {
      id: day.id,
      dateValue: day.work_date,
      status: day.status,
      note: day.note || "09:00 - 21:00 arasında randevu alınabilir.",
      slots,
      dayName: dayFormatter.format(date),
      dateLabel: compactDateFormatter.format(date),
      fullDate: longDateFormatter.format(date),
    };
  });
}

function getStatusIcon(status) {
  if (status === "closed") return <HiOutlineXCircle />;
  if (status === "limited" || status === "unavailable") {
    return <HiOutlineInformationCircle />;
  }
  return <HiOutlineCheckCircle />;
}

function buildCustomerMessage({
  selectedDay,
  selectedSlot,
  selectedService,
  customerName,
  customerPhone,
  notes,
}) {
  if (!selectedDay || !selectedSlot) return "";

  return [
    "Merhaba, kaynak hizmeti için randevu almak istiyorum.",
    customerName ? `Ad: ${customerName}` : "",
    customerPhone ? `Telefon: ${customerPhone}` : "",
    `Gün: ${selectedDay.fullDate}`,
    `Saat aralığı: ${selectedSlot.label}`,
    `İşlem: ${selectedService}`,
    notes ? `Not: ${notes}` : "",
    "Bu gün ve saat sizin için müsaitse teyit edebilir misiniz?",
  ]
    .filter(Boolean)
    .join("\n");
}

function CustomerBooking() {
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(serviceTypes[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const weekStart = useMemo(
    () => startOfWeek(parseDateKey(selectedDate)),
    [selectedDate],
  );
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const weekStartKey = formatDateKey(weekStart);
  const weekEndKey = formatDateKey(weekEnd);

  const {
    data: availabilityDays = [],
    isLoading: isLoadingAvailability,
    isFetching: isFetchingAvailability,
    isError: availabilityError,
    refetch: refetchAvailability,
  } = useQuery({
    queryKey: ["appointment-availability-days", weekStartKey, weekEndKey],
    queryFn: () =>
      getAvailabilityDays({
        startDate: weekStartKey,
        endDate: weekEndKey,
      }),
    retry: false,
  });

  const weekDays = useMemo(() => {
    const unavailableReason = isLoadingAvailability
      ? "loading"
      : availabilityError
        ? "error"
        : "missing";
    const daysByDate = new Map(
      availabilityError || isLoadingAvailability
        ? []
        : mapAvailabilityFromSupabase(availabilityDays).map((day) => [
            day.dateValue,
            day,
          ]),
    );

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateValue = formatDateKey(date);
      return (
        daysByDate.get(dateValue) ||
        buildUnavailableDay(date, unavailableReason)
      );
    });
  }, [availabilityDays, availabilityError, isLoadingAvailability, weekStart]);

  const selectedDay = weekDays.find(
    (day) => day.dateValue === selectedDate,
  );
  const selectedDateIsPast = selectedDate < todayKey;
  const availableSlots =
    selectedDay?.slots.filter((slot) => slot.isAvailable) || [];
  const selectedSlotIsAvailable = Boolean(
    selectedSlot &&
      selectedDay?.slots.some(
        (slot) => slot.time === selectedSlot.time && slot.isAvailable,
      ),
  );
  const canSend = Boolean(
    selectedDay &&
      selectedSlotIsAvailable &&
      !selectedDateIsPast &&
      ["available", "limited"].includes(selectedDay.status) &&
      !availabilityError &&
      !isLoadingAvailability,
  );
  const canSubmitToSystem = Boolean(
    canSend && customerName.trim() && customerPhone.trim(),
  );

  const message = buildCustomerMessage({
    selectedDay,
    selectedSlot,
    selectedService,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    notes,
  });

  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message,
  )}`;
  const mailUrl = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
    "Kaynak randevu talebi",
  )}&body=${encodeURIComponent(message)}`;

  const { mutate: submitRequest, isLoading } = useMutation({
    mutationFn: createAppointmentRequest,
    onSuccess: () => {
      toast.success("Randevu talebiniz alındı.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleDateSelect(dateValue) {
    if (dateValue < todayKey) return;

    setSelectedDate(dateValue);
    setSelectedSlot(null);
  }

  function handleWeekChange(direction) {
    const nextWeekStart = addDays(weekStart, direction * 7);
    const nextSelectedDate = formatDateKey(nextWeekStart);
    const safeDate = nextSelectedDate < todayKey ? todayKey : nextSelectedDate;
    handleDateSelect(safeDate);
  }

  function handleSystemSubmit() {
    if (!selectedDay || !selectedSlot) return;

    submitRequest({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || null,
      service_type: selectedService,
      requested_date: selectedDay.dateValue,
      requested_time: selectedSlot.time,
      channel: "system",
      status: "new",
      message: null,
      customer_note: notes.trim() || null,
    });
  }

  return (
    <Page>
      <AppScrollRail />
      <Shell>
        <PublicHeader>
          <div>
            <Brand>
              <BrandMark>
                <HiOutlineWrenchScrewdriver />
              </BrandMark>
              <div>
                <strong>Welding Expert</strong>
                <MutedText>Randevu ve hizmet talebi</MutedText>
              </div>
            </Brand>
            <HeaderText>
              <PublicTitle>
                Kaynak ve metal işleri için güvenilir randevu
              </PublicTitle>
              <Lead>
                Kapı, korkuluk, ferforje ve metal onarım hizmetlerini inceleyin;
                size uygun iki saatlik randevu aralığını takvimden seçin.
              </Lead>
              <HeaderActions>
                <HeaderLink href="#appointment-calendar">
                  <HiOutlineCalendarDays />
                  Randevu seç
                </HeaderLink>
                <HeaderLink
                  href="#location"
                  $secondary>
                  <HiOutlineMapPin />
                  Adresi gör
                </HeaderLink>
                <HeaderLink
                  as={Link}
                  to="/gallery"
                  $secondary>
                  <HiOutlinePhoto />
                  İş örnekleri
                </HeaderLink>
              </HeaderActions>
            </HeaderText>
          </div>
          <HeaderBadge>
            <HiOutlineCheckCircle />
            Müşteri ekranı
          </HeaderBadge>
        </PublicHeader>

        <AppNav />

        <AboutSection id="about">
          <AboutCopy>
            <Eyebrow>Biz kimiz</Eyebrow>
            <AboutTitle>
               Kaynak işlerinde güvenilir, planlı ve temiz işçilik
            </AboutTitle>
            <AboutText>
              Mehmet Kara, Ankara ve çevresinde kapı, korkuluk, ferforje, metal
              onarım ve özel imalat işleri yapan deneyimli bir kaynak ustasıdır.
              İşin başında ölçü ve ihtiyacı netleştirir; uygun malzeme ve zaman
              planını müşteriyle paylaşır.
            </AboutText>
            <AboutText>
              Amacımız yalnızca kaynak yapmak değil; eviniz, atölyeniz veya iş
              yeriniz için sağlam, kullanışlı ve uzun ömürlü bir çözüm teslim
              etmektir. Bu nedenle randevulu çalışır, işi yerinde değerlendirir
              ve süreci baştan sona açık biçimde planlarız.
            </AboutText>
            <HighlightList>
              {aboutHighlights.map((highlight) => (
                <HighlightItem key={highlight}>
                  <HiOutlineCheckCircle />
                  <span>{highlight}</span>
                </HighlightItem>
              ))}
            </HighlightList>
          </AboutCopy>

          <AboutPanel>
            <ProfileLine>
              <HiOutlineShieldCheck />
              <div>
                <ProfileName>Mehmet Kara</ProfileName>
                <ProfileRole>Kaynak ustası ve metal işleri sorumlusu</ProfileRole>
              </div>
            </ProfileLine>

            <SelectedLine>
              <HiOutlineMapPin />
              <span>Ankara merkez ve yakın ilçeler</span>
            </SelectedLine>
            <SelectedLine>
              <HiOutlineClock />
              <span>Hafta içi ve hafta sonu randevulu servis</span>
            </SelectedLine>

            <AboutStats>
              <AboutStat>
                <AboutStatValue>Yerinde</AboutStatValue>
                <AboutStatLabel>Servis seçeneği</AboutStatLabel>
              </AboutStat>
              <AboutStat>
                <AboutStatValue>Atölye</AboutStatValue>
                <AboutStatLabel>Üretim ve onarım</AboutStatLabel>
              </AboutStat>
              <AboutStat>
                <AboutStatValue>09-21</AboutStatValue>
                <AboutStatLabel>Randevu saatleri</AboutStatLabel>
              </AboutStat>
            </AboutStats>
          </AboutPanel>
        </AboutSection>

        <Section id="services">
          <SectionHeader>
            <Eyebrow>Hizmetlerimiz</Eyebrow>
            <AboutTitle>En çok talep edilen kaynak ve metal işleri</AboutTitle>
            <AboutText>
              İhtiyacınıza uygun hizmeti seçtiğinizde randevu formu otomatik
              olarak güncellenir.
            </AboutText>
          </SectionHeader>

          <ServicesGrid>
            {serviceOverview.map((service) => (
              <ServiceCard
                key={service.title}
                type="button"
                $active={selectedService === service.serviceType}
                onClick={() => setSelectedService(service.serviceType)}>
                <ServiceIcon>
                  <HiOutlineWrenchScrewdriver />
                </ServiceIcon>
                <CardTitle>{service.title}</CardTitle>
                <CardText>{service.text}</CardText>
                <MiniList>
                  {service.points.map((point) => (
                    <MiniItem key={point}>
                      <HiOutlineCheckCircle />
                      <span>{point}</span>
                    </MiniItem>
                  ))}
                </MiniList>
              </ServiceCard>
            ))}
          </ServicesGrid>
        </Section>

        <Section id="process">
          <SectionHeader>
            <Eyebrow>Nasıl çalışıyoruz</Eyebrow>
            <AboutTitle>Talep ile teslim arasındaki süreç net</AboutTitle>
            <AboutText>
              Önce ihtiyacı netleştirir, ardından uygun randevu ve uygulama
              planını birlikte oluştururuz.
            </AboutText>
          </SectionHeader>

          <ProcessGrid>
            {processSteps.map((step, index) => (
              <ProcessCard key={step.title}>
                <StepNumber>{index + 1}</StepNumber>
                <CardTitle>{step.title}</CardTitle>
                <CardText>{step.text}</CardText>
              </ProcessCard>
            ))}
          </ProcessGrid>
        </Section>

        <ContentGrid id="appointment-calendar">
          <Panel>
            <PanelHeader>
              <div>
                <Heading as="h2">Haftalık randevu takvimi</Heading>
                <MutedText>
                  Tarihi belirleyin ve doğrulanmış müsait saatlerden birini
                  seçin.
                </MutedText>
              </div>
            </PanelHeader>

            {isLoadingAvailability && (
              <AvailabilityNotice aria-live="polite">
                Müsaitlik bilgileri yükleniyor. Saatler doğrulanana kadar seçim
                yapılamaz.
              </AvailabilityNotice>
            )}

            {availabilityError && (
              <AvailabilityNotice
                role="alert"
                $error>
                <span>
                  Müsaitlik bilgileri şu anda alınamıyor. Güvenlik nedeniyle
                  saatler seçime kapatıldı.
                </span>
                <Button
                  type="button"
                  size="small"
                  variation="secondary"
                  disabled={isFetchingAvailability}
                  onClick={() => refetchAvailability()}>
                  {isFetchingAvailability ? "Deneniyor..." : "Tekrar dene"}
                </Button>
              </AvailabilityNotice>
            )}

            <DateToolbar>
              <DatePicker>
                Tarih seç
                <DateInput
                  type="date"
                  min={todayKey}
                  value={selectedDate}
                  onChange={(event) => handleDateSelect(event.target.value)}
                />
              </DatePicker>

              <WeekControls>
                <IconButton
                  type="button"
                  disabled={weekStartKey <= todayKey}
                  onClick={() => handleWeekChange(-1)}
                  aria-label="Önceki hafta">
                  <HiOutlineChevronLeft />
                </IconButton>
                <WeekLabel>
                  {compactDateFormatter.format(weekStart)} -{" "}
                  {compactDateFormatter.format(weekEnd)}
                </WeekLabel>
                <IconButton
                  type="button"
                  onClick={() => handleWeekChange(1)}
                  aria-label="Sonraki hafta">
                  <HiOutlineChevronRight />
                </IconButton>
              </WeekControls>
            </DateToolbar>

            <WeekGrid>
              {weekDays.map((day) => {
                const isSelected = selectedDate === day.dateValue;
                const isPast = day.dateValue < todayKey;
                const isClosed = ["closed", "unavailable"].includes(
                  day.status,
                );
                const freeSlotCount = day.slots.filter(
                  (slot) => slot.isAvailable,
                ).length;

                return (
                  <DayButton
                    key={day.dateValue}
                    type="button"
                    disabled={isPast || isClosed}
                    $disabled={isPast || isClosed}
                    $selected={isSelected}
                    onClick={() => handleDateSelect(day.dateValue)}>
                    <DayName>{day.dayName}</DayName>
                    <DayDate>{day.dateLabel}</DayDate>
                    <StatusBadge $status={day.status}>
                      {getStatusIcon(day.status)}
                      {day.statusText || statusLabel[day.status]}
                    </StatusBadge>
                    <DaySlotCount>
                      {isPast
                        ? "Geçmiş tarih"
                        : day.status === "unavailable"
                          ? "Seçime kapalı"
                          : `${freeSlotCount} müsait aralık`}
                    </DaySlotCount>
                  </DayButton>
                );
              })}
            </WeekGrid>

            <SlotPanel>
              <div>
                <Heading as="h2">
                  {selectedDay ? selectedDay.fullDate : "Gün seçin"}
                </Heading>
                <MutedText>
                  {selectedDay?.note ||
                    "Ortalama iş süresi iki saattir. Uygun bir aralık seçin."}
                </MutedText>
              </div>

              {["closed", "unavailable"].includes(selectedDay?.status) ||
              selectedDateIsPast ||
              availableSlots.length === 0 ? (
                <EmptySlots>
                  <span>Bu tarih için seçilebilir saat bulunmuyor.</span>
                  <span>
                    {selectedDay?.status === "unavailable"
                      ? "Müsaitlik doğrulanmadan randevu seçilemez."
                      : "Başka bir tarih deneyin."}
                  </span>
                </EmptySlots>
              ) : (
                <SlotGrid>
                  {selectedDay.slots.map((slot) => (
                    <SlotButton
                      key={`${selectedDay.dateValue}-${slot.time}`}
                      type="button"
                      disabled={!slot.isAvailable}
                      $active={selectedSlot?.time === slot.time}
                      onClick={() => setSelectedSlot(slot)}
                      title={slot.note || undefined}>
                      {slot.label}
                    </SlotButton>
                  ))}
                </SlotGrid>
              )}
            </SlotPanel>
          </Panel>

          <SummaryPanel>
            <SummaryBlock>
              <Heading as="h2">Talep özeti</Heading>
              <SelectedBox>
                <SelectedLine>
                  <HiOutlineCalendarDays />
                  <span>
                    {selectedDay ? selectedDay.fullDate : "Gün seçilmedi"}
                  </span>
                </SelectedLine>
                <SelectedLine>
                  <HiOutlineClock />
                  <span>{selectedSlot?.label || "Saat seçilmedi"}</span>
                </SelectedLine>
                <SelectedLine>
                  <HiOutlineWrenchScrewdriver />
                  <span>{selectedService}</span>
                </SelectedLine>
              </SelectedBox>

              <div>
                <Heading as="h3">Hizmet türü</Heading>
                <ServiceList>
                  {serviceTypes.map((service) => (
                    <ServiceOption
                      key={service}
                      type="button"
                      $active={selectedService === service}
                      onClick={() => setSelectedService(service)}>
                      {service}
                    </ServiceOption>
                  ))}
                </ServiceList>
              </div>
            </SummaryBlock>

            <SummaryBlock>
              <Heading as="h2">İletişim seçenekleri</Heading>
              <ChannelGrid>
                <ChannelLink
                  href={canSend ? whatsappUrl : undefined}
                  target="_blank"
                  rel="noreferrer"
                  $color="#16a34a"
                  $disabled={!canSend}>
                  <HiOutlinePhone />
                  WhatsApp ile yaz
                </ChannelLink>
                <ChannelLink
                  href={canSend ? mailUrl : undefined}
                  $color="var(--color-brand-600)"
                  $disabled={!canSend}>
                  <HiOutlineEnvelope />
                  E-posta gönder
                </ChannelLink>
              </ChannelGrid>

              <MutedText>
                Sisteme talep bırakmak için ad ve telefon bilgilerinizi girin.
              </MutedText>

              <FieldGrid>
                <Field>
                  Adınız
                  <Input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Ad Soyad"
                  />
                </Field>
                <Field>
                  Telefon
                  <Input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="05xx xxx xx xx"
                  />
                </Field>
                <Field>
                  E-posta
                  <Input
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder="ornek@email.com"
                  />
                </Field>
                <Field>
                  İşle ilgili notunuz
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={1000}
                    placeholder="Örn. Balkon korkuluğu tamiri yaptırmak istiyorum."
                  />
                </Field>
              </FieldGrid>

              <Button
                size="large"
                disabled={!canSubmitToSystem || isLoading}
                onClick={handleSystemSubmit}>
                {isLoading ? "Kaydediliyor..." : "Randevu talebi oluştur"}
              </Button>

              <SelectedLine>
                <HiOutlineUser />
                <span>
                  WhatsApp ve e-posta seçenekleri, seçtiğiniz tarih ve saatle
                  hazırlanmış bir mesaj açar. Sistem kaydı için ad ve telefon
                  bilgisi gerekir.
                </span>
              </SelectedLine>
            </SummaryBlock>
          </SummaryPanel>
        </ContentGrid>

        <LocationSection id="location">
          <LocationInfo>
            <SectionHeader>
              <Eyebrow>Adres ve hizmet bölgesi</Eyebrow>
              <AboutTitle>Atölye ve yerinde servis bilgileri</AboutTitle>
              <AboutText>
                Atölye görüşmeleri randevuyla yapılır. Yerinde servis için
                Ankara merkez ve yakın ilçeler planlamaya dahildir.
              </AboutText>
            </SectionHeader>

            <ContactList>
              <ContactItem
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer">
                <HiOutlineMapPin />
                <span>{businessAddress}</span>
              </ContactItem>
              <ContactItem href={`tel:+${BUSINESS_WHATSAPP_NUMBER}`}>
                <HiOutlinePhone />
                <span>+90 555 111 22 33</span>
              </ContactItem>
              <ContactItem href={`mailto:${BUSINESS_EMAIL}`}>
                <HiOutlineEnvelope />
                <span>{BUSINESS_EMAIL}</span>
              </ContactItem>
              <ContactItem href="#appointment-calendar">
                <HiOutlineClock />
                <span>Randevu saatleri: 09:00 - 21:00</span>
              </ContactItem>
            </ContactList>
          </LocationInfo>

          <MapBox>
            <MapPin>
              <PinIcon>
                <HiOutlineMapPin />
              </PinIcon>
              <PinCard>
                <CardTitle>Welding Expert Atölye</CardTitle>
                <CardText>{businessAddress}</CardText>
              </PinCard>
            </MapPin>
            <MapOpenLink
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noreferrer">
              Google Maps üzerinde aç
            </MapOpenLink>
          </MapBox>
        </LocationSection>

        <Section id="faq">
          <SectionHeader>
            <Eyebrow>Sık sorulan sorular</Eyebrow>
            <AboutTitle>Randevu öncesinde merak edilenler</AboutTitle>
          </SectionHeader>

          <FaqGrid>
            {faqItems.map((item) => (
              <FaqItem key={item.question}>
                <CardTitle>{item.question}</CardTitle>
                <CardText>{item.answer}</CardText>
              </FaqItem>
            ))}
          </FaqGrid>
        </Section>

        <Footer>
          <span>Welding Expert Randevu Sistemi</span>
          <span>Kaynak, metal onarım ve yerinde keşif hizmetleri</span>
        </Footer>
      </Shell>
    </Page>
  );
}

export default CustomerBooking;
