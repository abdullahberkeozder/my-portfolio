import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlinePhoto,
  HiOutlineCheckCircle,
  HiOutlinePhone,
  HiOutlineEnvelope,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

import AppNav from "../ui/AppNav";
import SEO from "../ui/SEO";
import { getAvailabilityDays } from "../services/apiAvailability";
import { createAppointmentRequest } from "../services/apiAppointmentRequests";
import BookingCalendar from "../features/booking/components/BookingCalendar";
import BookingForm from "../features/booking/components/BookingForm";
import BookingSuccess from "../features/booking/components/BookingSuccess";
import FaqAccordion from "../features/booking/components/FaqAccordion";
import StickyMobileCTA from "../features/booking/components/StickyMobileCTA";
import { logEvent } from "../services/apiAnalytics";
import { getServiceConfigs } from "../services/apiServiceConfigs";
import {
  padNumber,
  formatDateKey,
  parseDateKey,
  addDays,
} from "../utils/dateHelpers";


import {
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_TELEPHONE,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  MAP_QUERY,
  BUSINESS_GEO_LATITUDE,
  BUSINESS_GEO_LONGITUDE,
  BUSINESS_URL,
  OPENING_HOUR,
  CLOSING_HOUR,
  SLOT_DURATION_HOURS,
  serviceTypes,
  aboutHighlights,
  serviceOverview,
  processSteps,
  faqItems,
} from "../config/business";

import {
  Page,
  Shell,
  PublicHeader,
  HeroImage,
  Brand,
  BrandMark,
  MutedText,
  HeaderText,
  PublicTitle,
  Lead,
  TrustList,
  TrustItem,
  HeaderActions,
  HeaderLink,
  HeaderExtraLinks,
  HeaderExtraLink,
  HeaderBadge,

  AboutSection,
  AboutCopy,
  Eyebrow,
  AboutTitle,
  AboutText,
  HighlightList,
  HighlightItem,
  AboutPanel,
  ProfileLine,
  ProfileName,
  ProfileRole,
  AboutStats,
  AboutStat,
  AboutStatValue,
  AboutStatLabel,
  Section,
  SectionHeader,
  ScrollWrapper,
  ServicesGrid,
  ServiceCard,
  CardImageContainer,
  CardImage,
  CardContent,
  CardPrice,
  CardTitle,
  CardText,
  MiniList,
  MiniItem,
  ProcessGrid,
  ProcessCard,
  StepNumber,
  WizardContainer,
  WizardProgress,
  WizardStep,
  WizardStepNumber,
  StepLabel,
  StepDivider,
  LocationSection,
  LocationInfo,
  ContactList,
  ContactItem,
  MapBox,
  MapIframe,
  Footer,
  SelectedLine,
  StepAnimationWrapper,
} from "./CustomerBooking.styles";


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
      note: "Müsaitlik bilgileri şu anda yüklenemiyor. Sayfayı yenileyin veya WhatsApp'tan ulaşın.",
    },
    missing: {
      statusText: "Planlanmadı",
      note: "Bu tarih için henüz randevu açılmadı. Başka bir tarih deneyin veya doğrudan WhatsApp'tan yazın.",
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
    "Merhaba Umut Usta, ev/ofis bakım onarım hizmeti için randevu almak istiyorum.",
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

function formatTRPhoneNumber(value) {
  const digits = value.replace(/\D/g, "");
  let cleanDigits = digits;

  // Clean international prefix
  if (cleanDigits.startsWith("905")) {
    cleanDigits = cleanDigits.substring(2);
  }

  // Prepend 0 if user typed just the 5xx part
  if (cleanDigits.startsWith("5") && cleanDigits.length <= 10) {
    cleanDigits = "0" + cleanDigits;
  }

  if (cleanDigits.length === 0) return "";
  if (cleanDigits.length <= 4) return cleanDigits;
  if (cleanDigits.length <= 7) {
    return `${cleanDigits.slice(0, 4)} ${cleanDigits.slice(4)}`;
  }
  if (cleanDigits.length <= 9) {
    return `${cleanDigits.slice(0, 4)} ${cleanDigits.slice(4, 7)} ${cleanDigits.slice(7)}`;
  }
  return `${cleanDigits.slice(0, 4)} ${cleanDigits.slice(4, 7)} ${cleanDigits.slice(7, 9)} ${cleanDigits.slice(9, 11)}`;
}

function CustomerBooking() {

  const wizardRef = useRef(null);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  // Hizmetleri Supabase'den çek
  const { data: dbServices = [] } = useQuery({
    queryKey: ["service-configs"],
    queryFn: getServiceConfigs,
  });

  const activeServices = useMemo(() => {
    return dbServices.length > 0 ? dbServices : serviceOverview;
  }, [dbServices]);

  const activeServiceTypes = useMemo(() => {
    return dbServices.length > 0
      ? dbServices.map((s) => s.title)
      : serviceTypes;
  }, [dbServices]);

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(activeServiceTypes[0] || serviceTypes[0]);

  // Dynamic service selection sync
  useEffect(() => {
    if (activeServiceTypes.length > 0 && !activeServiceTypes.includes(selectedService)) {
      setSelectedService(activeServiceTypes[0]);
    }
  }, [activeServiceTypes, selectedService]);

  // Analytics on mount
  useEffect(() => {
    logEvent("booking_wizard_started");
  }, []);

  const [bookingStep, setBookingStep] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handlePhoneChange(value) {
    setCustomerPhone(formatTRPhoneNumber(value));
  }

  function handleReset() {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    setSelectedSlot(null);
    setBookingStep(1);
    setIsSubmitted(false);
  }


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
  const isPhoneValid = /^[0][5]\d{9}$/.test(customerPhone.replace(/\D/g, ""));
  const canSubmitToSystem = Boolean(
    canSend && customerName.trim() && isPhoneValid
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
  const quickMessage = "Merhaba Umut Usta, yaptırmak istediğim bir ev/ofis bakım onarım işi var. Fotoğrafını gönderip fiyat teklifi/keşif bilgisi alabilir miyim?";
  const quickWhatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    quickMessage,
  )}`;
  const mailUrl = BUSINESS_EMAIL
    ? `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
        "Bakım ve onarım randevu talebi",
      )}&body=${encodeURIComponent(message)}`
    : null;


  const { mutate: submitRequest, isLoading } = useMutation({
    mutationFn: createAppointmentRequest,
    onSuccess: () => {
      setIsSubmitted(true);
      logEvent("booking_submitted", {
        service_type: selectedService,
        channel: "system",
      });
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

  function handleServiceChange(serviceValue) {
    setSelectedService(serviceValue);
    setSelectedSlot(null);
  }


  function handleWeekChange(direction) {
    const nextWeekStart = addDays(weekStart, direction * 7);
    const nextSelectedDate = formatDateKey(nextWeekStart);
    const safeDate = nextSelectedDate < todayKey ? todayKey : nextSelectedDate;
    handleDateSelect(safeDate);
  }

  function scrollWizardIntoView() {
    const wizard = wizardRef.current;
    if (!wizard) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (typeof wizard.scrollIntoView === "function") {
          wizard.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }

        if (typeof wizard.focus === "function") {
          wizard.focus({ preventScroll: true });
        }
      });
    });
  }

  function handleBookingStepChange(nextStep) {
    setBookingStep(nextStep);
    scrollWizardIntoView();
    if (nextStep === 2) {
      logEvent("booking_step_completed", {
        step: 1,
        service_type: selectedService,
      });
    }
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

  const localBusinessSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Umut Usta",
    "image": `${BUSINESS_URL}/umut-usta-logo.png`,
    "@id": `${BUSINESS_URL}/#localbusiness`,
    "url": BUSINESS_URL,
    "telephone": BUSINESS_TELEPHONE,
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Şenol Caddesi No:42",
      "addressLocality": "Yenimahalle",
      "addressRegion": "Ankara",
      "postalCode": "06560",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_GEO_LATITUDE,
      "longitude": BUSINESS_GEO_LONGITUDE
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "21:00"
    }
  }), []);

  function handleScrollToCalendar() {
    scrollWizardIntoView();
  }

  return (
    <Page>
      <SEO
        title="Umut Usta | Ankara Ev & Ofis Bakım Onarım Hizmetleri"
        description="Boya, kaynak, montaj, bahçe ve metal bakım işleriniz için online randevu seçin. Ankara'da profesyonel yerel usta hizmeti."
        canonicalPath="/appointment"
        schema={localBusinessSchema}
      />
      <Shell>
        <PublicHeader>
          <HeroImage
            src="/images/hero.png"
            alt="Umut Usta'nın düzenli atölyesindeki aletler ve çalışma tezgahı"
            fetchpriority="high"
          />
          <div>
            <Brand>
              <BrandMark>
                <img src="/umut-usta-logo.png" alt="" aria-hidden="true" />
              </BrandMark>
              <div>
                <strong>Umut Usta</strong>
                <MutedText>Randevu ve hizmet talebi</MutedText>
              </div>
            </Brand>
            <HeaderText>
              <PublicTitle>
                Ankara&apos;da ev ve ofis bakım onarım işleriniz için güvenilir randevu
              </PublicTitle>
              <Lead>
                Boya, kaynak, montaj ve bakım hizmetlerini inceleyin; size uygun
                iki saatlik randevu aralığını takvimden seçin.
              </Lead>
              <TrustList aria-label="Hizmet güvenceleri">
                <TrustItem>
                  <HiOutlineMapPin />
                  Ankara&apos;da yerinde keşif
                </TrustItem>
                <TrustItem>
                  <HiOutlineClock />
                  Planlı 2 saatlik aralıklar
                </TrustItem>
                <TrustItem>
                  <HiOutlineShieldCheck />
                  İş öncesi net değerlendirme
                </TrustItem>
              </TrustList>
              <HeaderActions>
                <HeaderLink href="#appointment-calendar">
                  <HiOutlineCalendarDays />
                  Randevu Seç
                </HeaderLink>
                <HeaderLink
                  href={quickWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => logEvent("booking_whatsapp_clicked", { channel: "header_quick" })}
                  $whatsapp>
                  <FaWhatsapp />
                  Fotoğraf Gönder, Teklif Al
                </HeaderLink>
              </HeaderActions>
              <HeaderExtraLinks>
                <HeaderExtraLink href="#location">
                  <HiOutlineMapPin />
                  Adresi gör
                </HeaderExtraLink>
                <span className="dot">•</span>
                <HeaderExtraLink as={Link} to="/gallery">
                  <HiOutlinePhoto />
                  İş örnekleri
                </HeaderExtraLink>
              </HeaderExtraLinks>
            </HeaderText>

          </div>
          <HeaderBadge>
            <HiOutlineMapPin />
            Ankara&apos;da yerinde servis
          </HeaderBadge>
        </PublicHeader>

        <AppNav />

        <AboutSection id="about">
          <AboutCopy>
            <Eyebrow>Biz kimiz</Eyebrow>
            <AboutTitle>
              Bakım ve onarım işlerinizde güvenilir, planlı ve temiz işçilik
            </AboutTitle>
            <AboutText>
              Umut Usta, Ankara ve çevresinde boya, kaynak, montaj, bakım ve
              onarım işlerinizi profesyonel standartlarda yapan deneyimli bir ustadır.
              İşin başında ihtiyacınızı netleştirir; uygun malzeme ve zaman
              planını sizinle paylaşır.
            </AboutText>
            <AboutText>
              Amacımız yalnızca işi bitirmek değil; eviniz, ofisiniz veya iş
              yeriniz için sağlam, kullanışlı ve uzun ömürlü çözümler teslim
              etmektir. Bu nedenle planlı çalışır, yerinde keşif yapar ve süreci
              baştan sona şeffaf bir şekilde yönetiriz.
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
                <ProfileName>Umut Usta</ProfileName>
                <ProfileRole>Ev & Ofis Bakım ve Onarım Uzmanı</ProfileRole>
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
            <AboutTitle>En çok talep edilen ev ve bahçe işleri</AboutTitle>
            <AboutText>
              İhtiyacınıza uygun hizmeti seçtiğinizde randevu formu otomatik
              olarak güncellenir.
            </AboutText>
          </SectionHeader>

          <ScrollWrapper>
            <ServicesGrid>
              {activeServices.map((service) => (
                <ServiceCard
                  key={service.title}
                  type="button"
                  $active={selectedService === (service.service_key || service.serviceType)}
                  onClick={() => {
                    handleServiceChange(service.service_key || service.serviceType);
                    handleBookingStepChange(1);
                  }}>

                  <CardImageContainer>
                    <CardImage src={service.image_url || service.imageUrl} alt={service.title} />
                  </CardImageContainer>
                  <CardContent>
                    <CardTitle>{service.title}</CardTitle>
                    <CardPrice>{service.price_tagline || service.priceTagline}</CardPrice>
                    <CardText>{service.description || service.text}</CardText>
                    <MiniList>
                      {service.points.map((point) => (
                        <MiniItem key={point}>
                          <HiOutlineCheckCircle />
                          <span>{point}</span>
                        </MiniItem>
                      ))}
                    </MiniList>
                  </CardContent>
                </ServiceCard>
              ))}
            </ServicesGrid>
          </ScrollWrapper>
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

          <ScrollWrapper $breakpoint="560px">
            <ProcessGrid>
              {processSteps.map((step, index) => (
                <ProcessCard key={step.title}>
                  <StepNumber>{index + 1}</StepNumber>
                  <CardTitle>{step.title}</CardTitle>
                  <CardText>{step.text}</CardText>
                </ProcessCard>
              ))}
            </ProcessGrid>
          </ScrollWrapper>
        </Section>

        <WizardContainer id="appointment-calendar" ref={wizardRef} tabIndex="-1">
          {isSubmitted ? (
            <BookingSuccess
              selectedDay={selectedDay}
              selectedSlot={selectedSlot}
              selectedService={selectedService}
              customerPhone={customerPhone}
              whatsappUrl={whatsappUrl}
              onReset={handleReset}
            />
          ) : (
            <>
              <WizardProgress>
                <WizardStep $active={bookingStep === 1} $completed={bookingStep > 1}>
                  <WizardStepNumber $active={bookingStep === 1} $completed={bookingStep > 1}>
                    {bookingStep > 1 ? "✓" : "1"}
                  </WizardStepNumber>
                  <StepLabel $active={bookingStep === 1}>Tarih & Saat</StepLabel>
                </WizardStep>

                <StepDivider $completed={bookingStep > 1} />

                <WizardStep $active={bookingStep === 2}>
                  <WizardStepNumber $active={bookingStep === 2}>2</WizardStepNumber>
                  <StepLabel $active={bookingStep === 2}>İletişim & Onay</StepLabel>
                </WizardStep>
              </WizardProgress>

              {bookingStep === 1 && (
                <StepAnimationWrapper>
                  <BookingCalendar
                    todayKey={todayKey}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    selectedService={selectedService}
                    weekStart={weekStart}
                    weekEnd={weekEnd}
                    weekStartKey={weekStartKey}
                    weekDays={weekDays}
                    selectedDay={selectedDay}
                    selectedDateIsPast={selectedDateIsPast}
                    availableSlots={availableSlots}
                    isLoadingAvailability={isLoadingAvailability}
                    isFetchingAvailability={isFetchingAvailability}
                    availabilityError={availabilityError}
                    refetchAvailability={refetchAvailability}
                    quickWhatsappUrl={quickWhatsappUrl}
                    onDateSelect={handleDateSelect}
                    onSlotSelect={setSelectedSlot}
                    onWeekChange={handleWeekChange}
                    onStepChange={handleBookingStepChange}
                  />
                </StepAnimationWrapper>
              )}

              {bookingStep === 2 && (
                <StepAnimationWrapper>
                  <BookingForm
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    selectedService={selectedService}
                    customerName={customerName}
                    customerPhone={customerPhone}
                    customerEmail={customerEmail}
                    notes={notes}
                    canSubmitToSystem={canSubmitToSystem}
                    isLoading={isLoading}
                    canSend={canSend}
                    whatsappUrl={whatsappUrl}
                    quickWhatsappUrl={quickWhatsappUrl}
                    mailUrl={mailUrl}
                    onNameChange={setCustomerName}
                    onPhoneChange={handlePhoneChange}
                    onEmailChange={setCustomerEmail}
                    onNotesChange={setNotes}
                    onSystemSubmit={handleSystemSubmit}
                    onStepChange={handleBookingStepChange}
                  />
                </StepAnimationWrapper>
              )}
            </>
          )}
        </WizardContainer>


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
                href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                target="_blank"
                rel="noreferrer">
                <HiOutlineMapPin />
                <span>{BUSINESS_ADDRESS}</span>
              </ContactItem>
              <ContactItem href={`tel:+${BUSINESS_WHATSAPP_NUMBER}`}>
                <HiOutlinePhone />
                <span>{BUSINESS_TELEPHONE}</span>
              </ContactItem>
              {BUSINESS_EMAIL ? (
                <ContactItem href={`mailto:${BUSINESS_EMAIL}`}>
                  <HiOutlineEnvelope />
                  <span>{BUSINESS_EMAIL}</span>
                </ContactItem>
              ) : (
                <ContactItem as="div">
                  <HiOutlineEnvelope />
                  <span style={{ color: "var(--color-grey-400)" }}>E-posta hizmeti yakında aktif olacak</span>
                </ContactItem>
              )}
              <ContactItem href="#appointment-calendar">
                <HiOutlineClock />
                <span>Randevu saatleri: 09:00 - 21:00</span>
              </ContactItem>
            </ContactList>
          </LocationInfo>

          <MapBox>
            <MapIframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(BUSINESS_ADDRESS)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Umut Usta Atölye Konumu"
            />
          </MapBox>
        </LocationSection>

        <Section id="faq">
          <SectionHeader>
            <Eyebrow>Sık sorulan sorular</Eyebrow>
            <AboutTitle>Randevu öncesinde merak edilenler</AboutTitle>
          </SectionHeader>

          <FaqAccordion items={faqItems} />
        </Section>

        <Footer>
          <span>Umut Usta Randevu Sistemi</span>
          <span>Kaynak, metal onarım ve yerinde keşif hizmetleri</span>
        </Footer>
      </Shell>

      {!isSubmitted && (
        <StickyMobileCTA
          quickWhatsappUrl={quickWhatsappUrl}
          onScrollToCalendar={handleScrollToCalendar}
        />
      )}
    </Page>
  );
}

export default CustomerBooking;
