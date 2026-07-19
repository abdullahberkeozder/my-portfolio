import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { SkeletonBlock } from "../../../ui/LoadingSkeleton";

import {
  Panel,
  PanelHeader,
  MutedText,
  AvailabilityNotice,
  DateToolbar,
  WeekControls,
  IconButton,
  WeekLabel,
  CalendarPanel,
  ScheduleBoard,
  ScheduleSectionHeader,
  ScheduleTitle,
  ScheduleSlotContent,
  SelectionNote,
  SelectedServiceBar,
  WeekGrid,
  DayButton,
  DayName,
  DayDate,
  StatusBadge,
  SlotPanel,
  SlotContent,
  TimeEmptyState,
  SlotLoadingState,
  EmptySlots,
  EmptyWeekNotice,
  EmptyWeekActions,
  SlotGrid,
  SlotButton,
  WizardActions,
} from "./booking.styles";

const statusLabel = {
  available: "Müsait",
  limited: "Sınırlı",
  closed: "Kapalı",
  unavailable: "Planlanmadı",
};

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
  slotConflictMessage,
  refetchAvailability,
  quickWhatsappUrl,
  onDateSelect,
  onSlotSelect,
  onWeekChange,
  onStepChange,
}) {
  const conflictNoticeRef = useRef(null);

  useEffect(() => {
    if (slotConflictMessage) conflictNoticeRef.current?.focus();
  }, [slotConflictMessage]);

  const totalWeekSlots = weekDays.reduce((acc, day) => {
    return acc + (day.slots?.filter((slot) => slot.isAvailable).length || 0);
  }, 0);
  return (
    <Panel $compact aria-labelledby="booking-time-title">
      <PanelHeader $constrained>
        <div>
          <Heading as="h2" id="booking-time-title" tabIndex="-1">Uygun zamanı seçin</Heading>
          <MutedText>Önce günü, ardından size uyan saati seçin.</MutedText>
        </div>
      </PanelHeader>

      {slotConflictMessage && (
        <AvailabilityNotice ref={conflictNoticeRef} role="alert" tabIndex="-1" $error>
          <span>{slotConflictMessage}</span>
        </AvailabilityNotice>
      )}

      <SelectedServiceBar data-selected-service-summary="true">
        <div>
          <span>Hizmet</span>
          <strong>{selectedService}</strong>
        </div>
        <button
          type="button"
          aria-label="Hizmeti değiştir"
          onClick={() => onStepChange(1)}>
          Hizmeti değiştir
        </button>
      </SelectedServiceBar>

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

      <ScheduleBoard data-time-schedule-board="true">
        <CalendarPanel id="booking-calendar" data-time-calendar-panel="true">
          <DateToolbar>
            <ScheduleTitle>Gün seçin</ScheduleTitle>

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

          <WeekGrid role="group" aria-label="Haftanın günleri">
            {weekDays.map((day) => {
              const isSelected = selectedDate === day.dateValue;
              const isPast = day.dateValue < todayKey;
              const freeSlotCount = day.slots.filter((slot) => slot.isAvailable).length;
              const hasAvailableSlot = freeSlotCount > 0;
              const isSelectable =
                !isPast &&
                hasAvailableSlot &&
                !["closed", "unavailable"].includes(day.status);
              const visualStatus =
                isPast || (!hasAvailableSlot && ["available", "limited"].includes(day.status))
                  ? "closed"
                  : day.status;
              const dayStatusText = isPast
                ? "Geçmiş"
                : !hasAvailableSlot && ["available", "limited"].includes(day.status)
                  ? "Dolu"
                  : day.statusText || statusLabel[day.status];

              return (
                <DayButton
                  key={day.dateValue}
                  data-testid={`booking-day-${day.dateValue}`}
                  data-date-value={day.dateValue}
                  type="button"
                  disabled={!isSelectable}
                  $selected={isSelected}
                  aria-pressed={isSelected}
                  aria-label={`${day.fullDate}, ${dayStatusText}`}
                  onClick={() => onDateSelect(day.dateValue)}>
                  <DayName>{day.dayName}</DayName>
                  <DayDate>{day.dateLabel}</DayDate>
                  <StatusBadge $status={visualStatus}>{dayStatusText}</StatusBadge>
                </DayButton>
              );
            })}
          </WeekGrid>
        </CalendarPanel>

        <SlotPanel
          aria-live="polite"
          data-time-slot-panel="true"
          $hasSelectedDay={Boolean(selectedDay)}>
          <SlotContent data-time-slot-content="true">
            {isLoadingAvailability ? (
              <SlotLoadingState aria-hidden="true">
                <SkeletonBlock $width="38%" $height="1.6rem" />
                <SkeletonBlock $width="82%" $height="1.4rem" />
                <SkeletonBlock $width="64%" $height="1.4rem" />
              </SlotLoadingState>
            ) : totalWeekSlots === 0 ? (
              <EmptyWeekNotice>
                <div>
                  <HiOutlineInformationCircle aria-hidden="true" />
                  <div>
                    <Heading as="h3">Bu hafta uygun saat yok</Heading>
                    <MutedText>Sonraki haftayı kontrol edin veya acil durumlarda WhatsApp&apos;tan bilgi alın.</MutedText>
                  </div>
                </div>
                <EmptyWeekActions>
                  <Button
                    type="button"
                    variation="secondary"
                    size="large"
                    onClick={() => onWeekChange(1)}>
                    Sonraki haftayı göster <HiOutlineChevronRight aria-hidden="true" />
                  </Button>
                  <a href={quickWhatsappUrl} target="_blank" rel="noreferrer">
                    <FaWhatsapp aria-hidden="true" /> WhatsApp&apos;tan sor
                  </a>
                </EmptyWeekActions>
              </EmptyWeekNotice>
            ) : !selectedDay ? (
              <TimeEmptyState>
                <div>
                  <Heading as="h3">Bir gün seçin</Heading>
                  <p>Uygun saatleri görmek için takvimden bir gün seçin.</p>
                </div>
              </TimeEmptyState>
            ) : (
              <ScheduleSlotContent key={selectedDate}>
                <ScheduleSectionHeader data-slot-heading="true">
                  <div>
                    <Heading as="h3">{selectedDay.fullDate}</Heading>
                    <MutedText>
                      Ortalama iş süresi iki saattir. 09:00 - 21:00 arasında
                      randevu alınabilir.
                    </MutedText>
                  </div>
                </ScheduleSectionHeader>

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
                  <SlotGrid data-time-slot-grid="true">
                    {availableSlots.map((slot) => (
                      <SlotButton
                        key={`${selectedDay.dateValue}-${slot.time}`}
                        type="button"
                        $active={selectedSlot?.time === slot.time}
                        aria-pressed={selectedSlot?.time === slot.time}
                        aria-label={`${slot.label}, müsait`}
                        onClick={() => onSlotSelect(slot)}
                        title={slot.note || undefined}>
                        {selectedSlot?.time === slot.time && <HiOutlineCheckCircle aria-hidden="true" />}
                        {slot.label}
                      </SlotButton>
                    ))}
                  </SlotGrid>
                )}

                {selectedSlot && (
                  <>
                    <SelectionNote>
                      <HiOutlineInformationCircle aria-hidden="true" />
                      <span>Saat tercihiniz ekip tarafından teyit edilir.</span>
                    </SelectionNote>
                    <WizardActions $compact data-time-slot-actions="true">
                      <Button
                        type="button"
                        size="large"
                        variation="cta"
                        onClick={() => onStepChange(3)}>
                        İletişime Geç
                      </Button>
                    </WizardActions>
                  </>
                )}
              </ScheduleSlotContent>
            )}
          </SlotContent>
        </SlotPanel>
      </ScheduleBoard>
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
  slotConflictMessage: PropTypes.string,
  refetchAvailability: PropTypes.func.isRequired,
  quickWhatsappUrl: PropTypes.string.isRequired,
  onDateSelect: PropTypes.func.isRequired,
  onSlotSelect: PropTypes.func.isRequired,
  onWeekChange: PropTypes.func.isRequired,
  onStepChange: PropTypes.func.isRequired,
};

export default BookingCalendar;
