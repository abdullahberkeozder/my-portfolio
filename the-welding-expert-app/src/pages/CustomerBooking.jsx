import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlinePhoto,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineChevronDown,
  HiOutlineHomeModern,
  HiOutlineKey,
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

import AppNav from "../ui/AppNav";
import BrandLogo from "../ui/BrandLogo";
import SEO from "../ui/SEO";
import Button from "../ui/Button";
import { getAvailabilityDays } from "../services/apiAvailability";
import { createAppointmentRequest } from "../services/apiAppointmentRequests";
import { getGalleryItems } from "../services/apiGallery";
import BookingCalendar from "../features/booking/components/BookingCalendar";
import BookingForm from "../features/booking/components/BookingForm";
import BookingSuccess from "../features/booking/components/BookingSuccess";
import ServiceSelection from "../features/booking/components/ServiceSelection";
import FaqAccordion from "../features/booking/components/FaqAccordion";
import StickyMobileCTA from "../features/booking/components/StickyMobileCTA";
import { logEvent } from "../services/apiAnalytics";
import { ANALYTICS_EVENTS } from "../analytics/events";
import { getServiceConfigs } from "../services/apiServiceConfigs";
import useScrollReveal from "../hooks/useScrollReveal";
import {
  padNumber,
  formatDateKey,
  parseDateKey,
  addDays,
} from "../utils/dateHelpers";
import { getSupabasePreviewUrl } from "../utils/responsiveImages";
import { getGalleryImageAlt } from "../utils/galleryMedia";


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
  serviceOverview,
  processSteps,
  faqItems,
} from "../config/business";

import {
  Page,
  Shell,
  PublicHeader,
  HeroImage,
  MutedText,
  HeaderText,
  PublicTitle,
  Lead,
  HeaderActions,
  HeaderLink,
  TrustBar,
  TrustBarItem,

  Eyebrow,
  AboutTitle,
  AboutText,
  Section,
  SectionHeader,
  ServiceCategoryGrid,
  ServiceCategory,
  ServiceCategoryIcon,
  ServiceCategoryCopy,
  ServiceCategoryServices,
  CardTitle,
  CardText,
  CardLabel,
  ServiceDetails,
  ServiceDetailsContent,
  ProcessGrid,
  ProcessCard,
  StepNumber,
  LocationSection,
  LocationInfo,
  ContactList,
  ContactItem,
  ServiceAreaSummary,
  ServiceAreaItem,
  MapBox,
  MapIframe,
  MapPlaceholder,
  Footer,
  FooterBrand,
  FooterColumn,
  FooterLink,
  FooterBottom,
  GalleryPreviewGrid,
  GalleryPreviewCard,
  GalleryPreviewImage,
  GalleryPreviewContent,
  GalleryPreviewTitle,
  GalleryPreviewCategory,
  GalleryProofList,
  GalleryProofRow,
} from "./CustomerBooking.styles";

import {
  WizardContainer,
  WizardProgress,
  WizardStatus,
  WizardStep,
  WizardStepButton,
  WizardStepNumber,
  StepLabel,
  StepAnimationWrapper,
} from "../features/booking/components/booking.styles";


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

const SERVICE_CATALOG_GROUPS = [
  {
    key: "finish",
    title: "Boya ve küçük tadilat",
    description: "Boya, badana, yüzey onarımı ve ev içi küçük düzenlemeler.",
    icon: HiOutlineHomeModern,
    keywords: ["boya", "badana", "tadilat", "inşaat", "insaat"],
  },
  {
    key: "metal",
    title: "Kaynak ve metal işleri",
    description: "Kaynak, korkuluk, menteşe ve metal onarım işleri.",
    icon: HiOutlineWrenchScrewdriver,
    keywords: ["kaynak", "korkuluk", "metal", "demir"],
  },
  {
    key: "access",
    title: "Kapı ve otomasyon",
    description: "Raylı kapı, motor, kilit ve kontrollü geçiş sistemleri.",
    icon: HiOutlineKey,
    keywords: ["kapı", "kapi", "kilit", "motor", "raylı", "rayli", "otomatik"],
  },
  {
    key: "outdoor",
    title: "Bahçe ve dış alan",
    description: "Bahçe düzenleme, peyzaj, çit ve dış alan işleri.",
    icon: HiOutlineSparkles,
    keywords: ["bahçe", "bahce", "peyzaj", "çit", "cit"],
  },
];

function isDiscoveryCatalogService(service) {
  return [service.title, service.serviceType]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .includes("keşif");
}

function getCatalogGroup(service) {
  const searchable = [service.title, service.problem, service.text]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return SERVICE_CATALOG_GROUPS.find((group) =>
    group.keywords.some((keyword) => searchable.includes(keyword)),
  )?.key || "outdoor";
}

function getGalleryProof(item) {
  return {
    problem: item.problem || item.description || "İhtiyaç yerinde incelenerek kapsam belirlendi.",
    application: item.solution || item.work_done || item.title,
    result: item.result || "Uygulama tamamlanarak kullanıma hazır teslim edildi.",
  };
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
  useScrollReveal();

  const wizardRef = useRef(null);
  const heroRef = useRef(null);
  const footerRef = useRef(null);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const [remoteDataEnabled, setRemoteDataEnabled] = useState(
    () => import.meta.env.MODE === "test",
  );
  const [lowerPageEnabled, setLowerPageEnabled] = useState(
    () => import.meta.env.MODE === "test",
  );
  const lowerPageTimerRef = useRef(null);

  function enableRemoteDataAfterHeroPaint() {
    if (lowerPageTimerRef.current) return;
    lowerPageTimerRef.current = -1;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        lowerPageTimerRef.current = window.setTimeout(
          () => {
            setLowerPageEnabled(true);
            setRemoteDataEnabled(true);
          },
          800,
        );
      });
    });
  }

  useEffect(() => () => {
    if (lowerPageTimerRef.current) window.clearTimeout(lowerPageTimerRef.current);
  }, []);

  // Hizmetleri Supabase'den çek
  const { data: dbServices = [] } = useQuery({
    queryKey: ["service-configs"],
    queryFn: getServiceConfigs,
    enabled: remoteDataEnabled,
  });

  // Galeri önizleme verilerini çek
  const { data: dbGalleryItems = [] } = useQuery({
    queryKey: ["gallery-items-preview"],
    queryFn: () => getGalleryItems({ publishedOnly: true }),
    enabled: remoteDataEnabled,
  });

  const previewItems = useMemo(() => {
    return dbGalleryItems.slice(0, 3);
  }, [dbGalleryItems]);

  const activeServices = useMemo(() => {
    return dbServices.length > 0 ? dbServices : serviceOverview;
  }, [dbServices]);

  const discoveryServices = useMemo(() => {
    return activeServices.map((service) => {
      const fallback = serviceOverview.find(
        (item) =>
          item.title === service.title ||
          item.serviceType === service.service_type,
      );

      return {
        ...fallback,
        ...service,
        points: service.points || fallback?.points || [],
        problem: service.problem || fallback?.problem || service.description || service.text,
        priceFactors: service.priceFactors || fallback?.priceFactors || [],
        planningNote:
          service.planningNote ||
          fallback?.planningNote ||
          (service.title?.includes("keşif")
            ? "Ankara hizmet alanında yerinde inceleme ile kapsam belirlenir."
            : "Ankara'da yerinde veya atölyede uygulanır; yöntem ön değerlendirmede netleşir."),
        featured: service.featured ?? fallback?.featured ?? false,
      };
    });
  }, [activeServices]);

  const serviceCatalogGroups = useMemo(
    () => SERVICE_CATALOG_GROUPS.map((group) => {
      const services = discoveryServices.filter(
        (service) => !isDiscoveryCatalogService(service) && getCatalogGroup(service) === group.key,
      );
      const factors = [...new Set(services.flatMap((service) => service.priceFactors || []))];

      return { ...group, services, factors: factors.slice(0, 4) };
    }).filter((group) => group.services.length > 0),
    [discoveryServices],
  );

  const activeServiceTypes = useMemo(() => {
    return dbServices.length > 0
      ? dbServices.map((s) => s.title)
      : serviceTypes;
  }, [dbServices]);

  const [selectedDate, setSelectedDate] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [isWizardInView, setIsWizardInView] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [isFooterInView, setIsFooterInView] = useState(false);

  useEffect(() => {
    const wizard = wizardRef.current;
    if (!wizard || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsWizardInView(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(wizard);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    if (!lowerPageEnabled || !footer || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterInView(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(footer);

    return () => observer.disconnect();
  }, [lowerPageEnabled]);

  // Dynamic service selection sync
  useEffect(() => {
    if (selectedService && !activeServiceTypes.includes(selectedService)) {
      setSelectedService("");
    }
  }, [activeServiceTypes, selectedService]);

  const wizardStartedRef = useRef(false);
  const completedStepsRef = useRef(new Set());

  // Public page visits are the denominator for channel-choice reporting.
  useEffect(() => {
    if (remoteDataEnabled) {
      logEvent(ANALYTICS_EVENTS.PUBLIC_PAGE_VIEWED, { operation_id: "appointment-page-view" });
    }
  }, [remoteDataEnabled]);

  const [bookingStep, setBookingStep] = useState(1);
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem("uu_customer_name") || "";
    } catch {
      return "";
    }
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    try {
      return localStorage.getItem("uu_customer_phone") || "";
    } catch {
      return "";
    }
  });
  const [customerEmail, setCustomerEmail] = useState(() => {
    try {
      return localStorage.getItem("uu_customer_email") || "";
    } catch {
      return "";
    }
  });
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submissionError, setSubmissionError] = useState("");
  const [rememberDetails, setRememberDetails] = useState(false);
  const [hasSavedDetails, setHasSavedDetails] = useState(() => {
    try {
      return Boolean(
        localStorage.getItem("uu_customer_name") ||
        localStorage.getItem("uu_customer_phone") ||
        localStorage.getItem("uu_customer_email"),
      );
    } catch {
      return false;
    }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [createdBookingToken, setCreatedBookingToken] = useState(null);

  function handlePhoneChange(value) {
    setCustomerPhone(formatTRPhoneNumber(value));
    setFieldErrors((current) => ({ ...current, customerPhone: undefined }));
    setSubmissionError("");
  }

  function handleNameChange(value) {
    setCustomerName(value);
    setFieldErrors((current) => ({ ...current, customerName: undefined }));
    setSubmissionError("");
  }

  function handleEmailChange(value) {
    setCustomerEmail(value);
    setFieldErrors((current) => ({ ...current, customerEmail: undefined }));
    setSubmissionError("");
  }

  function handleClearSavedDetails() {
    try {
      localStorage.removeItem("uu_customer_name");
      localStorage.removeItem("uu_customer_phone");
      localStorage.removeItem("uu_customer_email");
    } catch {
      // Local storage may be unavailable in privacy-focused browsers.
    }
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setRememberDetails(false);
    setHasSavedDetails(false);
  }

  function handleReset() {
    try {
      setCustomerName(localStorage.getItem("uu_customer_name") || "");
      setCustomerPhone(localStorage.getItem("uu_customer_phone") || "");
      setCustomerEmail(localStorage.getItem("uu_customer_email") || "");
    } catch {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
    }
    setNotes("");
    setFieldErrors({});
    setSubmissionError("");
    setSelectedSlot(null);
    setSelectedDate("");
    setBookingStep(1);
    setIsSubmitted(false);
    setCreatedBookingId(null);
    setCreatedBookingToken(null);
    completedStepsRef.current.clear();
  }


  const weekStart = useMemo(
    () => startOfWeek(parseDateKey(selectedDate || todayKey)),
    [selectedDate, todayKey],
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
    enabled: remoteDataEnabled,
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
  const selectedDateIsPast = Boolean(selectedDate && selectedDate < todayKey);
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

  const quickMessage = "Merhaba Umut Usta, yaptırmak istediğim bir ev/ofis bakım onarım işi var. Fotoğrafını gönderip fiyat teklifi/keşif bilgisi alabilir miyim?";
  const quickWhatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    quickMessage,
  )}`;
  const phoneHref = `tel:+${BUSINESS_WHATSAPP_NUMBER}`;
  const { mutate: submitRequest, isLoading } = useMutation({
    mutationFn: createAppointmentRequest,
    onSuccess: (bookingResult) => {
      const bookingId =
        typeof bookingResult === "string" ? bookingResult : bookingResult?.id;
      const publicToken =
        typeof bookingResult === "object" ? bookingResult?.public_token : null;

      setIsSubmitted(true);
      setCreatedBookingId(bookingId);
      setCreatedBookingToken(publicToken);

      if (rememberDetails) {
        try {
          localStorage.setItem("uu_customer_name", customerName.trim());
          localStorage.setItem("uu_customer_phone", customerPhone.trim());
          if (customerEmail.trim()) {
            localStorage.setItem("uu_customer_email", customerEmail.trim());
          } else {
            localStorage.removeItem("uu_customer_email");
          }
          setHasSavedDetails(true);
        } catch (err) {
          console.warn("Could not save details to localStorage", err);
        }
      }

      setSubmissionError("");
      logEvent(ANALYTICS_EVENTS.BOOKING_SUBMITTED, {
        operation_id: publicToken || bookingId,
        service_type: selectedService,
        channel: "system",
      });
      logEvent(ANALYTICS_EVENTS.BOOKING_SUCCESS_VIEWED, {
        operation_id: publicToken || bookingId,
        service_type: selectedService,
      });
    },

    onError: (error) => {
      const isSlotConflict = error.message.includes("artık müsait değil");
      logEvent(ANALYTICS_EVENTS.BOOKING_SUBMISSION_FAILED, {
        service_type: selectedService,
        reason: isSlotConflict ? "slot_unavailable" : "request_error",
      });

      if (isSlotConflict) {
        setSelectedSlot(null);
        setSubmissionError(
          "Seçtiğiniz saat bu sırada doldu. Bilgileriniz korundu; lütfen yeni bir saat seçin.",
        );
        setBookingStep(2);
        refetchAvailability();
        scrollWizardIntoView(2);
        return;
      }

      setSubmissionError(error.message);
    },
  });

  function handleDateSelect(dateValue) {
    if (dateValue < todayKey) return;

    setSelectedDate(dateValue);
    setSelectedSlot(null);
    setSubmissionError("");
  }

  function handleServiceChange(serviceValue) {
    setSelectedService(serviceValue);
    setSelectedSlot(null);
    setSubmissionError("");
    if (serviceValue) {
      markWizardStarted("service_selection");
      logEvent(ANALYTICS_EVENTS.BOOKING_SERVICE_CHANGED, {
        service_type: serviceValue,
      });
    }
  }

  function handleSlotSelect(slot) {
    markWizardStarted("slot_selection");
    setSelectedSlot(slot);
    setSubmissionError("");
    if (slot) {
      logEvent(ANALYTICS_EVENTS.BOOKING_SLOT_SELECTED, {
        slot_time: slot.time,
        service_type: selectedService,
      });
    }
  }


  function handleWeekChange(direction) {
    const nextWeekStart = addDays(weekStart, direction * 7);
    const nextSelectedDate = formatDateKey(nextWeekStart);
    const safeDate = nextSelectedDate < todayKey ? todayKey : nextSelectedDate;
    handleDateSelect(safeDate);
  }

  function scrollWizardIntoView(nextStep) {
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

        const headingId = {
          1: "booking-service-title",
          2: "booking-time-title",
          3: "booking-contact-title",
        }[nextStep];
        document.getElementById(headingId)?.focus({ preventScroll: true });
      });
    });
  }

  function markWizardStarted(source) {
    if (wizardStartedRef.current) return;

    wizardStartedRef.current = true;
    logEvent(ANALYTICS_EVENTS.BOOKING_WIZARD_STARTED, { source });
  }

  function handleBookingStepChange(nextStep) {
    markWizardStarted("wizard_step");
    setBookingStep(nextStep);
    scrollWizardIntoView(nextStep);
    if (nextStep === 2 && !completedStepsRef.current.has(1)) {
      completedStepsRef.current.add(1);
      logEvent(ANALYTICS_EVENTS.BOOKING_STEP_COMPLETED, {
        step: 1,
        service_type: selectedService,
      });
    } else if (nextStep === 3 && !completedStepsRef.current.has(2)) {
      completedStepsRef.current.add(2);
      logEvent(ANALYTICS_EVENTS.BOOKING_STEP_COMPLETED, {
        step: 2,
        service_type: selectedService,
      });
    }
  }

  function handleSystemSubmit(event) {
    event?.preventDefault();
    const nextErrors = {};
    if (!customerName.trim()) {
      nextErrors.customerName = "Ad soyad alanı zorunludur.";
    }
    if (!isPhoneValid) {
      nextErrors.customerPhone = "05 ile başlayan 11 haneli geçerli bir telefon numarası girin.";
    }
    if (
      customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
      nextErrors.customerEmail = "Geçerli bir e-posta adresi girin veya alanı boş bırakın.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmissionError("");
      logEvent(ANALYTICS_EVENTS.BOOKING_VALIDATION_FAILED, {
        fields: Object.keys(nextErrors),
        service_type: selectedService,
      });
      return;
    }

    if (!selectedDay || !selectedSlot || !canSend) {
      setSubmissionError("Zaman tercihiniz artık doğrulanamıyor. Lütfen tarih ve saati yeniden seçin.");
      setBookingStep(2);
      scrollWizardIntoView(2);
      return;
    }

    setSubmissionError("");
    logEvent(ANALYTICS_EVENTS.BOOKING_SUBMISSION_STARTED, {
      service_type: selectedService,
      channel: "system",
    });
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
    markWizardStarted("booking_cta");
    scrollWizardIntoView(bookingStep);
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
        <AppNav />

        <PublicHeader id="top" ref={heroRef}>
          <HeroImage
            src="/images/hero.png"
            alt="Kaynak maskesiyle metal parça üzerinde çalışan usta"
            sizes="(max-width: 760px) 100vw, 1200px"
            sources={[]}
            srcSet="/images/optimized/hero-320.webp 320w, /images/optimized/hero-400.webp 400w, /images/optimized/hero-640.webp 640w, /images/optimized/hero-1024.webp 1024w"
            fetchpriority="high"
            loading="eager"
            onLoad={enableRemoteDataAfterHeroPaint}
            onError={enableRemoteDataAfterHeroPaint}
            revealImmediately
            frameProps={{ "data-hero-image": "" }}
          />
          <div>
            <HeaderText>
              <PublicTitle>
                Ankara&apos;da ev, ofis ve metal işleri için randevu alın
              </PublicTitle>
              <Lead>
                Hizmeti ve size uyan zamanı seçin; uygunluğu telefon veya WhatsApp ile teyit edelim.
              </Lead>
              <HeaderActions>
                <HeaderLink
                  href="#appointment-calendar"
                  onClick={(event) => {
                    event.preventDefault();
                    markWizardStarted("hero_cta");
                    logEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, {
                      cta: "appointment",
                      placement: "hero",
                    });
                    scrollWizardIntoView(bookingStep);
                  }}>
                  <HiOutlineCalendarDays aria-hidden="true" />
                  Randevu Al
                </HeaderLink>
                <HeaderLink
                  href={quickWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    logEvent(ANALYTICS_EVENTS.BOOKING_WHATSAPP_CLICKED, { channel: "header_quick" });
                    logEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, {
                      cta: "whatsapp",
                      placement: "hero",
                    });
                  }}
                  $secondary
                  $channel>
                  <FaWhatsapp aria-hidden="true" />
                  Fotoğrafla Danış
                </HeaderLink>
              </HeaderActions>
            </HeaderText>
          </div>
        </PublicHeader>

        <TrustBar id="trust" data-reveal aria-label="Doğrulanabilir işletme bilgileri">
          <TrustBarItem>
            <HiOutlineMapPin aria-hidden="true" />
            <div>
              <strong>Yenimahalle, Ankara</strong>
              <span>Ankara&apos;da yerinde hizmet</span>
            </div>
          </TrustBarItem>
          <TrustBarItem>
            <HiOutlineClock aria-hidden="true" />
            <div>
              <strong>09:00 - 21:00</strong>
              <span>Randevu planlama saatleri</span>
            </div>
          </TrustBarItem>
          <TrustBarItem>
            <HiOutlinePhoto aria-hidden="true" />
            <div>
              <strong>
                {dbGalleryItems.length > 0
                  ? `${dbGalleryItems.length} yayınlanmış iş`
                  : "İş örneklerini inceleyin"}
              </strong>
              <span>{dbGalleryItems.length > 0 ? "Galeride incelenebilir" : "Gerçek uygulama galerisi"}</span>
            </div>
          </TrustBarItem>
        </TrustBar>

        <WizardContainer id="appointment-calendar" ref={wizardRef} tabIndex="-1">
          {isSubmitted ? (
            <BookingSuccess
              selectedDay={selectedDay}
              selectedSlot={selectedSlot}
              selectedService={selectedService}
              customerPhone={customerPhone}
              bookingId={createdBookingId}
              publicToken={createdBookingToken}
              onReset={handleReset}
            />
          ) : (
            <>
              <WizardStatus id="booking-progress-status" aria-live="polite">
                Adım {bookingStep} / 3 · {bookingStep === 1 ? "Hizmet" : bookingStep === 2 ? "Zaman tercihi" : "İletişim"}
              </WizardStatus>
              <WizardProgress
                as="ol"
                data-wizard-progress="true"
                aria-label="Randevu talebi adımları"
                aria-describedby="booking-progress-status">
                <WizardStep as="li">
                  <WizardStepButton
                    type="button"
                    aria-current={bookingStep === 1 ? "step" : undefined}
                    aria-label="1 Hizmet adımına git"
                    onClick={() => handleBookingStepChange(1)}>
                    <WizardStepNumber $active={bookingStep === 1} $completed={bookingStep > 1}>
                      {bookingStep > 1 ? "✓" : "1"}
                    </WizardStepNumber>
                    <StepLabel $active={bookingStep === 1}>Hizmet</StepLabel>
                  </WizardStepButton>
                </WizardStep>

                <WizardStep as="li">
                  <WizardStepButton
                    type="button"
                    disabled={!selectedService}
                    aria-current={bookingStep === 2 ? "step" : undefined}
                    aria-label="2 Zaman Tercihi adımına git"
                    onClick={() => handleBookingStepChange(2)}>
                    <WizardStepNumber $active={bookingStep === 2} $completed={bookingStep > 2}>
                      {bookingStep > 2 ? "✓" : "2"}
                    </WizardStepNumber>
                    <StepLabel $active={bookingStep === 2}>Zaman</StepLabel>
                  </WizardStepButton>
                </WizardStep>

                <WizardStep as="li">
                  <WizardStepButton
                    type="button"
                    disabled={!canSend}
                    aria-current={bookingStep === 3 ? "step" : undefined}
                    aria-label="3 İletişim adımına git"
                    onClick={() => handleBookingStepChange(3)}>
                    <WizardStepNumber $active={bookingStep === 3}>3</WizardStepNumber>
                    <StepLabel $active={bookingStep === 3}>İletişim</StepLabel>
                  </WizardStepButton>
                </WizardStep>
              </WizardProgress>

              {bookingStep === 1 && (
                <StepAnimationWrapper data-wizard-step-body="true">
                  <ServiceSelection
                    services={activeServices}
                    selectedService={selectedService}
                    onServiceSelect={handleServiceChange}
                    onStepChange={handleBookingStepChange}
                  />
                </StepAnimationWrapper>
              )}

              {bookingStep === 2 && (
                <StepAnimationWrapper data-wizard-step-body="true">
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
                    slotConflictMessage={bookingStep === 2 ? submissionError : ""}
                    refetchAvailability={refetchAvailability}
                    quickWhatsappUrl={quickWhatsappUrl}
                    onDateSelect={handleDateSelect}
                    onSlotSelect={handleSlotSelect}
                    onWeekChange={handleWeekChange}
                    onStepChange={handleBookingStepChange}
                  />
                </StepAnimationWrapper>
              )}

              {bookingStep === 3 && (
                <StepAnimationWrapper data-wizard-step-body="true">
                  <BookingForm
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    selectedService={selectedService}
                    customerName={customerName}
                    customerPhone={customerPhone}
                    customerEmail={customerEmail}
                    notes={notes}
                    isLoading={isLoading}
                    canSend={canSend}
                    fieldErrors={fieldErrors}
                    submissionError={submissionError}
                    rememberDetails={rememberDetails}
                    hasSavedDetails={hasSavedDetails}
                    onNameChange={handleNameChange}
                    onPhoneChange={handlePhoneChange}
                    onEmailChange={handleEmailChange}
                    onNotesChange={(value) => {
                      setNotes(value);
                      setSubmissionError("");
                    }}
                    onRememberDetailsChange={setRememberDetails}
                    onClearSavedDetails={handleClearSavedDetails}
                    onSystemSubmit={handleSystemSubmit}
                    onStepChange={handleBookingStepChange}
                  />
                </StepAnimationWrapper>
              )}
            </>
          )}
        </WizardContainer>

        {lowerPageEnabled && <>
        <Section id="portfolio-preview" data-reveal>
          <SectionHeader>
            <Eyebrow>İşlerimiz</Eyebrow>
            <AboutTitle>İşçiliği sonuç üzerinden inceleyin</AboutTitle>
            <AboutText>
              Sorunu, yapılan uygulamayı ve teslim edilen sonucu gösteren üç güncel iş.
            </AboutText>
          </SectionHeader>

          {previewItems.length === 0 ? (
            <MutedText style={{ textAlign: "center" }}>İş örnekleri hazırlanıyor...</MutedText>
          ) : (
            <>
              <GalleryPreviewGrid>
                {previewItems.map((item) => {
                  const proof = getGalleryProof(item);

                  return (
                    <GalleryPreviewCard key={item.id} aria-label={`${item.title} iş örneği`}>
                      <GalleryPreviewImage
                        src={getSupabasePreviewUrl(item.image_url)}
                        alt={getGalleryImageAlt(item)}
                        sizes="(max-width: 760px) 100vw, 33vw"
                        loading="lazy"
                      />
                      <GalleryPreviewContent>
                        <GalleryPreviewCategory>
                          {[item.category || "Uygulama", item.location].filter(Boolean).join(" · ")}
                        </GalleryPreviewCategory>
                        <GalleryPreviewTitle>{item.title}</GalleryPreviewTitle>
                        <GalleryProofList>
                          <GalleryProofRow><span>Sorun</span><p>{proof.problem}</p></GalleryProofRow>
                          <GalleryProofRow><span>Uygulama</span><p>{proof.application}</p></GalleryProofRow>
                          <GalleryProofRow><span>Sonuç</span><p>{proof.result}</p></GalleryProofRow>
                        </GalleryProofList>
                      </GalleryPreviewContent>
                    </GalleryPreviewCard>
                  );
                })}
              </GalleryPreviewGrid>
              <div style={{ textAlign: "center", marginTop: "3.2rem" }}>
                <Button
                  as={Link}
                  to="/gallery"
                  variation="secondary"
                  size="large"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem" }}
                >
                  <HiOutlinePhoto aria-hidden="true" />
                  Tüm işleri gör
                </Button>
              </div>
            </>
          )}
        </Section>

        <Section id="services" data-reveal>
          <SectionHeader>
            <Eyebrow>Hizmetlerimiz</Eyebrow>
            <AboutTitle>Dört başlıkta hizmet kapsamı</AboutTitle>
            <AboutText>
              Hizmet seçimini yukarıdaki randevu adımında yaparsınız; burada yalnızca kapsamı inceleyin.
            </AboutText>
          </SectionHeader>

          <ServiceCategoryGrid>
            {serviceCatalogGroups.map((group) => {
              const Icon = group.icon;

              return (
                <ServiceCategory key={group.key} aria-labelledby={`service-group-${group.key}`}>
                  <ServiceCategoryIcon aria-hidden="true"><Icon /></ServiceCategoryIcon>
                  <ServiceCategoryCopy>
                    <CardTitle id={`service-group-${group.key}`}>{group.title}</CardTitle>
                    <CardText>{group.description}</CardText>
                    <ServiceCategoryServices>
                      {group.services.map((service) => <li key={service.title}>{service.title}</li>)}
                    </ServiceCategoryServices>
                    <ServiceDetails>
                      <summary>
                        Neler etkiler?
                        <HiOutlineChevronDown aria-hidden="true" />
                      </summary>
                      <ServiceDetailsContent>
                        <CardLabel>Kapsam ve planlama</CardLabel>
                        <p>{group.factors.length > 0 ? group.factors.join(" · ") : "Ölçü, malzeme ve uygulama koşulları"}</p>
                      </ServiceDetailsContent>
                    </ServiceDetails>
                  </ServiceCategoryCopy>
                </ServiceCategory>
              );
            })}
          </ServiceCategoryGrid>
        </Section>

        <Section id="process" data-reveal>
          <SectionHeader>
            <Eyebrow>Nasıl çalışıyoruz</Eyebrow>
            <AboutTitle>Talep, teyit, uygulama ve teslim</AboutTitle>
          </SectionHeader>

          <ProcessGrid aria-label="Hizmet süreci">
            {processSteps.map((step, index) => (
              <ProcessCard key={step.title}>
                <StepNumber>{index + 1}</StepNumber>
                <div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardText>{step.text}</CardText>
                </div>
              </ProcessCard>
            ))}
          </ProcessGrid>
        </Section>

        <LocationSection id="location" data-reveal>
          <LocationInfo>
            <SectionHeader>
              <Eyebrow>Adres ve hizmet bölgesi</Eyebrow>
              <AboutTitle>Yenimahalle merkezli yerinde hizmet</AboutTitle>
              <AboutText>
                Ankara merkez ve yakın ilçeler işin kapsamına göre planlanır.
              </AboutText>
            </SectionHeader>

            <ServiceAreaSummary aria-label="Hizmet bölgesi kapsamı">
              <ServiceAreaItem>
                <HiOutlineMapPin aria-hidden="true" />
                <span>
                  Gazi Mahallesi, Yenimahalle
                  <small>Atölye görüşmeleri randevuyla yapılır.</small>
                </span>
              </ServiceAreaItem>
              <ServiceAreaItem>
                <HiOutlineShieldCheck aria-hidden="true" />
                <span>
                  Ankara&apos;da yerinde servis
                  <small>İş türü ve mesafeye göre hizmet alanı netleşir.</small>
                </span>
              </ServiceAreaItem>
            </ServiceAreaSummary>

            <ContactList>
              <ContactItem
                href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => logEvent(ANALYTICS_EVENTS.PUBLIC_CHANNEL_CLICKED, {
                  channel: "maps",
                  placement: "location",
                })}>
                <HiOutlineMapPin />
                <span>{BUSINESS_ADDRESS}</span>
              </ContactItem>
              <ContactItem
                href={phoneHref}
                onClick={() => logEvent(ANALYTICS_EVENTS.PUBLIC_CHANNEL_CLICKED, {
                  channel: "phone",
                  placement: "location",
                })}>
                <HiOutlinePhone />
                <span>{BUSINESS_TELEPHONE}</span>
              </ContactItem>
              {BUSINESS_EMAIL && (
                <ContactItem href={`mailto:${BUSINESS_EMAIL}`}>
                  <HiOutlineEnvelope />
                  <span>{BUSINESS_EMAIL}</span>
                </ContactItem>
              )}
              <ContactItem as="div">
                <HiOutlineClock />
                <span>Planlama saatleri: 09:00 - 21:00</span>
              </ContactItem>
            </ContactList>
          </LocationInfo>

          <MapBox>
            {isMapVisible ? (
              <MapIframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(BUSINESS_ADDRESS)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Umut Usta Atölye Konumu"
              />
            ) : (
              <MapPlaceholder>
                <HiOutlineMapPin aria-hidden="true" />
                <strong>Haritayı gerektiğinde açın</strong>
                <span>Üçüncü taraf harita yalnızca isteğinizle yüklenir.</span>
                <Button
                  type="button"
                  variation="secondary"
                  onClick={() => {
                    setIsMapVisible(true);
                    logEvent(ANALYTICS_EVENTS.PUBLIC_CHANNEL_CLICKED, {
                      channel: "maps",
                      placement: "location_embed",
                    });
                  }}>
                  Haritayı göster
                </Button>
              </MapPlaceholder>
            )}
          </MapBox>
        </LocationSection>

        <Section id="faq" data-reveal>
          <SectionHeader>
            <Eyebrow>Sık sorulan sorular</Eyebrow>
            <AboutTitle>Randevu öncesinde merak edilenler</AboutTitle>
          </SectionHeader>

          <FaqAccordion items={faqItems} initialVisibleCount={3} />
        </Section>

        <Footer ref={footerRef}>
          <FooterBrand>
            <div>
              <BrandLogo size={3.6} alt="" aria-hidden="true" />
              <strong>Umut Usta</strong>
            </div>
            <p>Ankara&apos;da randevulu bakım, kaynak ve metal işleri.</p>
          </FooterBrand>

          <FooterColumn as="nav" aria-label="Alt bilgi bağlantıları">
            <FooterLink href="#appointment-calendar">Randevu</FooterLink>
            <FooterLink as={Link} to="/gallery">İşler</FooterLink>
            <FooterLink
              href={phoneHref}
              onClick={() => logEvent(ANALYTICS_EVENTS.PUBLIC_CHANNEL_CLICKED, {
                channel: "phone",
                placement: "footer",
              })}>
              İletişim
            </FooterLink>
            <FooterLink as={Link} to="/privacy">Gizlilik</FooterLink>
          </FooterColumn>

          <FooterBottom>
            <span>© {new Date().getFullYear()} Umut Usta</span>
          </FooterBottom>
        </Footer>
        </>}
      </Shell>

      {!isSubmitted && bookingStep === 1 && !isHeroInView && !isWizardInView && !isFooterInView && (
        <StickyMobileCTA
          quickWhatsappUrl={quickWhatsappUrl}
          onScrollToCalendar={handleScrollToCalendar}
        />
      )}
    </Page>
  );
}

export default CustomerBooking;
