import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineWrenchScrewdriver,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import {
  addDays,
  formatDateKey,
  parseDateKey,
} from "../../../utils/dateHelpers";

import {
  Panel,
  PanelHeader,
  MutedText,
  AvailabilityNotice,
  DateToolbar,
  DatePicker,
  DateInput,
  WeekControls,
  IconButton,
  WeekLabel,
  QuickDateRow,
  QuickDateButton,
  ScrollWrapper,
  WeekGrid,
  DayButton,
  DayName,
  DayDate,
  DaySlotCount,
  StatusBadge,
  SlotPanel,
  EmptySlots,
  SlotGrid,
  SlotButton,
  HorizontalSummary,
  SummaryItem,
  SummaryIcon,
  SummaryContent,
  SummaryLabel,
  SummaryValue,
  WizardActions,
  StepAnimationWrapper,
} from "../../../pages/CustomerBooking.styles";


const statusLabel = {
  available: "Müsait",
  limited: "Kısıtlı",
  closed: "Kapalı",
  unavailable: "Kullanılamaz",
};

function getStatusIcon(status) {
  if (status === "closed") return <HiOutlineXCircle />;
  if (status === "limited" || status === "unavailable") {
    return <HiOutlineInformationCircle />;
  }
  return <HiOutlineCheckCircle />;
}

function BookingCalendar({
  todayKey,
  selectedDate,
  selectedSlot,
  selectedService,
  weekStart,
  weekEnd,
  weekStartKey,
  weekDays,
  selectedDay,
  selectedDateIsPast,
  availableSlots,
  isLoadingAvailability,
  isFetchingAvailability,
  availabilityError,
  refetchAvailability,
  quickWhatsappUrl,
  onDateSelect,
  onSlotSelect,
  onWeekChange,
  onStepChange,
}) {
  const weekGridRef = useRef(null);
  const selectedDayButtonRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 980px)").matches) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const weekGrid = weekGridRef.current;
    const selectedButton = selectedDayButtonRef.current;

    if (!weekGrid || !selectedButton) return;

    const targetScrollLeft =
      selectedButton.offsetLeft -
      (weekGrid.clientWidth - selectedButton.offsetWidth) / 2;

    weekGrid.scrollTo({
      left: targetScrollLeft,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [selectedDate, weekStartKey]);

  const totalWeekSlots = weekDays.reduce((acc, day) => {
    return acc + (day.slots?.filter((slot) => slot.isAvailable).length || 0);
  }, 0);
  const tomorrowKey = formatDateKey(addDays(parseDateKey(todayKey), 1));
  const firstAvailableDay = weekDays.find((day) => {
    const isPast = day.dateValue < todayKey;
    const isClosed = ["closed", "unavailable"].includes(day.status);
    const hasSlots = day.slots.some((slot) => slot.isAvailable);

    return !isPast && !isClosed && hasSlots;
  });
  const quickDates = [];
  [
    { label: "Bugün", value: todayKey },
    { label: "Yarın", value: tomorrowKey },
    firstAvailableDay && {
      label: "İlk uygun gün",
      value: firstAvailableDay.dateValue,
    },
  ]
    .filter(Boolean)
    .forEach((item) => {
      if (!quickDates.some((date) => date.value === item.value)) {
        quickDates.push(item);
      }
    });

  return (
    <Panel>
      <PanelHeader>
        <div>
          <Heading as="h2">Haftalık randevu takvimi</Heading>
          <MutedText>
            Tarihi belirleyin ve doğrulanmış müsait saatlerden birini seçin.
          </MutedText>
        </div>
      </PanelHeader>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid var(--color-grey-100)", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "1.3rem", color: "var(--color-grey-500)", fontWeight: 600 }}>Seçili hizmet:</span>
        <span style={{ fontSize: "1.4rem", color: "var(--color-grey-900)", fontWeight: 700 }}>{selectedService}</span>
        <a
          href="#services"
          style={{ marginLeft: "auto", fontSize: "1.2rem", color: "var(--color-brand-600)", fontWeight: 700, textDecoration: "underline", whiteSpace: "nowrap" }}>
          Hizmeti değiştir ↑
        </a>
      </div>

      {isLoadingAvailability && (
        <AvailabilityNotice aria-live="polite">
          Müsaitlik bilgileri yükleniyor. Saatler doğrulanana kadar seçim
          yapılamaz.
        </AvailabilityNotice>
      )}

      {availabilityError && (
        <AvailabilityNotice role="alert" $error>
          <span>
            Randevu takvimi şu an yüklenemiyor. Sayfayı yenileyin veya{" "}
            <a
              href={quickWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 800, textDecoration: "underline" }}>
              WhatsApp&apos;tan yazın
            </a>
            .
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

      {!isLoadingAvailability && !availabilityError && totalWeekSlots === 0 && (
        <AvailabilityNotice role="status" style={{ background: "var(--color-yellow-100)", color: "var(--color-yellow-700)", border: "1px solid rgba(133, 77, 14, 0.15)" }}>
          Bu hafta için planlanmış müsait randevu bulunmuyor. Diğer haftaları inceleyebilir veya hızlı yanıt için doğrudan WhatsApp üzerinden yazabilirsiniz.
        </AvailabilityNotice>
      )}

      <DateToolbar>
        <DatePicker>
          Tarih seç
          <DateInput
            type="date"
            min={todayKey}
            value={selectedDate}
            onChange={(event) => onDateSelect(event.target.value)}
          />
        </DatePicker>

        <WeekControls>
          <IconButton
            type="button"
            disabled={weekStartKey <= todayKey}
            onClick={() => onWeekChange(-1)}
            aria-label="Önceki hafta">
            <HiOutlineChevronLeft />
          </IconButton>
          <WeekLabel>
            {new Intl.DateTimeFormat("tr-TR", {
              day: "numeric",
              month: "short",
            }).format(weekStart)}{" "}
            -{" "}
            {new Intl.DateTimeFormat("tr-TR", {
              day: "numeric",
              month: "short",
            }).format(weekEnd)}
          </WeekLabel>
          <IconButton
            type="button"
            onClick={() => onWeekChange(1)}
            aria-label="Sonraki hafta">
            <HiOutlineChevronRight />
          </IconButton>
        </WeekControls>
      </DateToolbar>

      <QuickDateRow aria-label="Hızlı tarih seçimi">
        {quickDates.map((item) => (
          <QuickDateButton
            key={item.label}
            type="button"
            $active={selectedDate === item.value}
            aria-pressed={selectedDate === item.value}
            onClick={() => onDateSelect(item.value)}>
            {item.label}
          </QuickDateButton>
        ))}
      </QuickDateRow>

      <ScrollWrapper $breakpoint="980px" $bg="var(--color-grey-0)">
        <WeekGrid
          ref={weekGridRef}
          role="group"
          aria-label="Haftanın günleri">
          {weekDays.map((day) => {
            const isSelected = selectedDate === day.dateValue;
            const isPast = day.dateValue < todayKey;
            const isClosed = ["closed", "unavailable"].includes(day.status);
            const freeSlotCount = day.slots.filter((slot) => slot.isAvailable).length;
            const dayStatusText = day.statusText || statusLabel[day.status];

            return (
              <DayButton
                key={day.dateValue}
                ref={isSelected ? selectedDayButtonRef : null}
                type="button"
                disabled={isPast || isClosed}
                $disabled={isPast || isClosed}
                $selected={isSelected}
                aria-pressed={isSelected}
                aria-label={`${day.fullDate}, ${dayStatusText}, ${
                  isPast
                    ? "geçmiş tarih"
                    : day.status === "unavailable"
                      ? "seçime kapalı"
                      : `${freeSlotCount} müsait aralık`
                }`}
                onClick={() => onDateSelect(day.dateValue)}>
                <DayName>{day.dayName}</DayName>
                <DayDate>{day.dateLabel}</DayDate>
                <StatusBadge $status={day.status}>
                  {getStatusIcon(day.status)}
                  {dayStatusText}
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
      </ScrollWrapper>

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

        <StepAnimationWrapper key={selectedDate}>
          {["closed", "unavailable"].includes(selectedDay?.status) ||
          selectedDateIsPast ||
          availableSlots.length === 0 ? (
            <EmptySlots>
              {selectedDateIsPast ? (
                <span>Geçmiş bir tarih için randevu alınamaz.</span>
              ) : selectedDay?.status === "unavailable" && selectedDay?.note?.includes("WhatsApp") ? (
                <>
                  <span>Bu tarih için henüz randevu açılmadı.</span>
                  <span>
                    Başka bir tarih seçin veya{" "}
                    <a
                      href={quickWhatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontWeight: 800, textDecoration: "underline", color: "var(--color-brand-700)" }}>
                      WhatsApp&apos;tan yazın
                    </a>
                    .
                  </span>
                </>
              ) : selectedDay?.status === "closed" ? (
                <span>Bu gün kapalı. Başka bir tarih deneyin.</span>
              ) : (
                <span>Bu tarih için seçilebilir saat bulunmuyor. Başka bir gün deneyin.</span>
              )}
            </EmptySlots>
          ) : (
            <SlotGrid>
              {selectedDay.slots.map((slot) => (
                <SlotButton
                  key={`${selectedDay.dateValue}-${slot.time}`}
                  type="button"
                  disabled={!slot.isAvailable}
                  $active={selectedSlot?.time === slot.time}
                  aria-pressed={selectedSlot?.time === slot.time}
                  aria-label={`${slot.label}, ${
                    slot.isAvailable ? "müsait" : "dolu"
                  }`}
                  onClick={() => onSlotSelect(slot)}
                  title={slot.note || undefined}>
                  {slot.label}
                </SlotButton>
              ))}
            </SlotGrid>
          )}
        </StepAnimationWrapper>
      </SlotPanel>

      <div style={{ marginTop: "2rem" }}>
        <Heading as="h2" style={{ fontSize: "1.8rem", marginBottom: "1.2rem" }}>
          Talep Özeti
        </Heading>
        <HorizontalSummary>
          <SummaryItem>
            <SummaryIcon>
              <HiOutlineCalendarDays />
            </SummaryIcon>
            <SummaryContent>
              <SummaryLabel>Seçilen Tarih</SummaryLabel>
              <SummaryValue>
                {selectedDay ? selectedDay.fullDate : "Gün seçilmedi"}
              </SummaryValue>
            </SummaryContent>
          </SummaryItem>

          <SummaryItem>
            <SummaryIcon>
              <HiOutlineClock />
            </SummaryIcon>
            <SummaryContent>
              <SummaryLabel>Seçilen Saat</SummaryLabel>
              <SummaryValue>
                {selectedSlot?.label || "Saat seçilmedi"}
              </SummaryValue>
            </SummaryContent>
          </SummaryItem>

          <SummaryItem>
            <SummaryIcon>
              <HiOutlineWrenchScrewdriver />
            </SummaryIcon>
            <SummaryContent>
              <SummaryLabel>Hizmet Türü</SummaryLabel>
              <SummaryValue>{selectedService}</SummaryValue>
            </SummaryContent>
          </SummaryItem>
        </HorizontalSummary>
      </div>

      <WizardActions>
        <a
          href="#services"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            minHeight: "4.4rem",
            padding: "1rem 1.6rem",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--color-grey-200)",
            background: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
            fontSize: "1.4rem",
            fontWeight: 700,
            textDecoration: "none",
          }}>
          ← Hizmet Değiştir
        </a>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
          {!selectedSlot && selectedDay && !["closed", "unavailable"].includes(selectedDay.status) && availableSlots.length > 0 && (
            <span style={{ fontSize: "1.2rem", color: "var(--color-yellow-700)", fontWeight: "600", whiteSpace: "nowrap" }}>
              * İlerlemek için yukarıdan bir saat aralığı seçin
            </span>
          )}
          <Button
            type="button"
            size="large"
            variation="cta"
            disabled={!selectedDay || !selectedSlot}
            onClick={() => onStepChange(2)}>
            İletişim Bilgilerine İlerle →
          </Button>
        </div>
      </WizardActions>

    </Panel>
  );
}

BookingCalendar.propTypes = {
  todayKey: PropTypes.string.isRequired,
  selectedDate: PropTypes.string.isRequired,
  selectedSlot: PropTypes.object,
  selectedService: PropTypes.string.isRequired,
  weekStart: PropTypes.instanceOf(Date).isRequired,
  weekEnd: PropTypes.instanceOf(Date).isRequired,
  weekStartKey: PropTypes.string.isRequired,
  weekDays: PropTypes.array.isRequired,
  selectedDay: PropTypes.object,
  selectedDateIsPast: PropTypes.bool,
  availableSlots: PropTypes.array.isRequired,
  isLoadingAvailability: PropTypes.bool,
  isFetchingAvailability: PropTypes.bool,
  availabilityError: PropTypes.bool,
  refetchAvailability: PropTypes.func.isRequired,
  quickWhatsappUrl: PropTypes.string.isRequired,
  onDateSelect: PropTypes.func.isRequired,
  onSlotSelect: PropTypes.func.isRequired,
  onWeekChange: PropTypes.func.isRequired,
  onStepChange: PropTypes.func.isRequired,
};

export default BookingCalendar;
