import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled, { css } from "styled-components";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineInformationCircle,
  HiOutlineLockClosed,
  HiOutlineXCircle,
} from "react-icons/hi2";

import Button from "../ui/Button";
import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import { getAdminProfile } from "../services/apiAuth";
import {
  ensureAvailabilityRange,
  getAvailabilityDays,
  updateAvailabilityDay,
  updateAvailabilitySlot,
  updateAvailabilitySlots,
} from "../services/apiAvailability";

const OPENING_HOUR = 9;
const CLOSING_HOUR = 21;
const SLOT_DURATION_HOURS = 2;

const DAY_STATUS_OPTIONS = [
  {
    value: "available",
    label: "Müsait",
    tone: "green",
  },
  {
    value: "limited",
    label: "Kısıtlı",
    tone: "amber",
  },
  {
    value: "closed",
    label: "Kapalı",
    tone: "red",
  },
];

const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
});

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const Page = styled.div`
  display: grid;
  gap: 2.4rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;

  @media (max-width: 760px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const HeaderCopy = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

const PublicLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.4rem;
  color: var(--color-brand-700);
  background: var(--color-brand-50);
  border: 1px solid var(--color-brand-200);
  font-size: 1.4rem;
  font-weight: 800;

  & svg {
    width: 1.9rem;
    height: 1.9rem;
  }
`;

const InfoPanel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 0.8rem;
`;

const CalendarPanel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  display: grid;
  gap: 1.6rem;
`;

const CalendarToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;

  @media (max-width: 760px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const WeekTitle = styled.div`
  display: grid;
  gap: 0.2rem;
`;

const WeekRange = styled.p`
  color: var(--color-grey-900);
  font-size: 1.8rem;
  font-weight: 800;
`;

const ToolbarActions = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const ToolbarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.1rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;

  & svg {
    width: 1.7rem;
    height: 1.7rem;
  }
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(12.8rem, 1fr));
  gap: 1rem;

  @media (max-width: 1180px) {
    overflow-x: auto;
    padding-bottom: 0.6rem;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    overflow-x: visible;
  }
`;

const DayCard = styled.article`
  border: 1px solid
    ${(props) =>
      props.$closed ? "var(--color-red-100)" : "var(--color-grey-100)"};
  border-radius: var(--border-radius-md);
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
  align-content: start;
  background: ${(props) =>
    props.$closed ? "var(--color-status-danger-bg)" : "var(--color-grey-0)"};
`;

const DayTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.8rem;
`;

const DayTitleCopy = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.2rem;
`;

const DayName = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.35rem;
  font-weight: 800;
  text-transform: capitalize;
`;

const DayDate = styled.p`
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: 700;
`;

const StatusBadge = styled.span`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  color: var(--color-green-700);
  background: var(--color-green-100);
  font-size: 1rem;
  font-weight: 800;
  white-space: nowrap;

  & svg {
    width: 1.3rem;
    height: 1.3rem;
  }

  ${(props) =>
    props.$tone === "amber" &&
    css`
      color: var(--color-status-warning-text);
      background: var(--color-status-warning-bg);
    `}

  ${(props) =>
    props.$tone === "red" &&
    css`
      color: var(--color-red-700);
      background: var(--color-red-100);
    `}
`;

const Select = styled.select`
  width: 100%;
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 0.7rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.2rem;
  font-weight: 800;
`;

const NoteArea = styled.textarea`
  width: 100%;
  min-height: 5.8rem;
  resize: vertical;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.2rem;
  line-height: 1.5;
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
`;

const SmallButton = styled.button`
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.55rem 0.65rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;

  ${(props) =>
    props.$danger &&
    css`
      color: var(--color-red-700);
      border-color: var(--color-red-100);
      background: var(--color-status-danger-bg);
    `}

  ${(props) =>
    props.$success &&
    css`
      color: var(--color-green-700);
      border-color: var(--color-green-700);
      background: var(--color-green-100);
    `}

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const SlotList = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const SlotRow = styled.div`
  display: grid;
  grid-template-columns: 4.4rem 1fr;
  gap: 0.5rem;
`;

const SlotSelect = styled.button`
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid
    ${(props) =>
      props.$selected ? "var(--color-surface-dark)" : "var(--color-grey-200)"};
  color: ${(props) =>
    props.$selected ? "var(--color-grey-0)" : "var(--color-grey-500)"};
  background: ${(props) =>
    props.$selected ? "var(--color-surface-dark)" : "var(--color-grey-0)"};
  box-shadow: ${(props) =>
    props.$selected
      ? "inset 0 -3px 0 var(--color-action-primary)"
      : "none"};
  font-size: 1.1rem;
  font-weight: 900;
  cursor: pointer;
`;

const SlotToggle = styled.button`
  min-height: 4.4rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid
    ${(props) =>
      props.$available ? "var(--color-green-700)" : "var(--color-grey-300)"};
  padding: 0.55rem 0.65rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  color: ${(props) =>
    props.$available ? "var(--color-green-700)" : "var(--color-grey-600)"};
  background: ${(props) =>
    props.$available ? "var(--color-green-100)" : "var(--color-grey-100)"};
  font-size: 1.05rem;
  font-weight: 800;
  cursor: pointer;

  ${(props) =>
    !props.$available &&
    css`
      text-decoration: line-through;
    `}

  & svg {
    width: 1.45rem;
    height: 1.45rem;
  }

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

const DaySummary = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: 700;
`;

const AdvancedControls = styled.details`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-50);

  & summary {
    min-height: 4.4rem;
    padding: 0.7rem 0.8rem;
    color: var(--color-grey-700);
    font-size: 1.15rem;
    font-weight: 800;
    cursor: pointer;
  }
`;

const AdvancedBody = styled.div`
  display: grid;
  gap: 0.8rem;
  padding: 0 0.8rem 0.8rem;
`;

const EmptyState = styled.div`
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 0.8rem;
  color: var(--color-grey-500);
  background: var(--color-grey-50);
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

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + amount);
  return nextDate;
}

function buildSlotLabel(slotTime) {
  const time = slotTime.slice(0, 5);
  const hour = Number(time.slice(0, 2));
  const endTime = `${padNumber(hour + SLOT_DURATION_HOURS)}:00`;

  return `${time} - ${endTime}`;
}

function isTwoHourBlock(slotTime) {
  const hour = Number(slotTime.slice(0, 2));
  const minute = slotTime.slice(3, 5);

  return (
    hour >= OPENING_HOUR &&
    hour + SLOT_DURATION_HOURS <= CLOSING_HOUR &&
    minute === "00" &&
    (hour - OPENING_HOUR) % SLOT_DURATION_HOURS === 0
  );
}

function getDayStatusMeta(status) {
  return (
    DAY_STATUS_OPTIONS.find((option) => option.value === status) ||
    DAY_STATUS_OPTIONS[0]
  );
}

function getStatusIcon(status) {
  if (status === "closed") return <HiOutlineXCircle />;
  if (status === "limited") return <HiOutlineInformationCircle />;

  return <HiOutlineCheckCircle />;
}

function normalizeDay(day) {
  const date = new Date(`${day.work_date}T00:00:00`);
  const slots = [...(day.appointment_availability_slots || [])]
    .filter((slot) => isTwoHourBlock(slot.slot_time))
    .sort((a, b) => a.slot_time.localeCompare(b.slot_time))
    .map((slot) => ({
      id: slot.id,
      time: slot.slot_time.slice(0, 5),
      label: buildSlotLabel(slot.slot_time),
      isAvailable: slot.is_available,
      note: slot.note,
    }));

  return {
    id: day.id,
    dateValue: day.work_date,
    dayName: dayFormatter.format(date),
    dateLabel: dateFormatter.format(date),
    fullDateLabel: fullDateFormatter.format(date),
    status: day.status || "available",
    note: day.note || "",
    slots,
  };
}

function AvailabilityDayCard({
  day,
  selectedSlotIds,
  onToggleSlotSelection,
  onSelectAllSlots,
  onClearSelectedSlots,
  onToggleSlot,
  onUpdateDay,
  onBulkUpdateSlots,
  isUpdating,
}) {
  const [noteDraft, setNoteDraft] = useState(day.note);
  const statusMeta = getDayStatusMeta(day.status);
  const selectedCount = selectedSlotIds.length;
  const allSlotIds = day.slots.map((slot) => slot.id);
  const freeSlotCount = day.slots.filter((slot) => slot.isAvailable).length;

  function handleStatusChange(event) {
    onUpdateDay({
      dayId: day.id,
      updates: {
        status: event.target.value,
      },
      successMessage: "Gün durumu güncellendi.",
    });
  }

  function handleSaveNote() {
    onUpdateDay({
      dayId: day.id,
      updates: {
        note: noteDraft.trim() || null,
      },
      successMessage: "Gün notu kaydedildi.",
    });
  }

  function handleBulkUpdate(isAvailable) {
    if (selectedCount === 0) {
      toast.error("Önce en az bir saat aralığı seçin.");
      return;
    }

    onBulkUpdateSlots({
      dayId: day.id,
      slotIds: selectedSlotIds,
      isAvailable,
    });
  }

  function handleBulkUpdateAll(isAvailable) {
    onBulkUpdateSlots({
      dayId: day.id,
      slotIds: allSlotIds,
      isAvailable,
    });
  }

  return (
    <DayCard $closed={day.status === "closed"}>
      <DayTitle>
        <DayTitleCopy>
          <DayName>{day.dayName}</DayName>
          <DayDate>{day.dateLabel}</DayDate>
        </DayTitleCopy>
        <StatusBadge $tone={statusMeta.tone}>
          {getStatusIcon(day.status)}
          {statusMeta.label}
        </StatusBadge>
      </DayTitle>

      <Select
        aria-label={`${day.dateLabel} gün durumu`}
        value={day.status}
        disabled={isUpdating}
        onChange={handleStatusChange}>
        {DAY_STATUS_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <ActionRow>
        <SmallButton
          type="button"
          $danger
          disabled={isUpdating}
          onClick={() =>
            onUpdateDay({
              dayId: day.id,
              updates: { status: "closed" },
              successMessage: "Gün tamamen kapatıldı.",
            })
          }>
          Günü kapat
        </SmallButton>
        <SmallButton
          type="button"
          $success
          disabled={isUpdating}
          onClick={() =>
            onUpdateDay({
              dayId: day.id,
              updates: { status: "available" },
              successMessage: "Gün yeniden müsait duruma getirildi.",
            })
          }>
          Günü aç
        </SmallButton>
      </ActionRow>

      <NoteArea
        aria-label={`${day.dateLabel} gün notu`}
        placeholder="Örn. Yalnızca atölye işleri alınır"
        value={noteDraft}
        onChange={(event) => setNoteDraft(event.target.value)}
      />

      <ActionRow>
        <SmallButton
          type="button"
          disabled={isUpdating}
          onClick={handleSaveNote}>
          Notu kaydet
        </SmallButton>
        <SmallButton
          type="button"
          disabled={isUpdating}
          onClick={() =>
            onUpdateDay({
              dayId: day.id,
              updates: {
                status: "limited",
                note: noteDraft.trim() || "Öğleden sonra müsait",
              },
              successMessage: "Gün kısıtlı olarak işaretlendi.",
            })
          }>
          Kısıtlı yap
        </SmallButton>
      </ActionRow>

      <DaySummary>
        <span>{freeSlotCount} müsait aralık</span>
        <span>{selectedCount} seçili</span>
      </DaySummary>

      <AdvancedControls>
        <summary>Toplu işlemler</summary>
        <AdvancedBody>
          <ActionRow>
            <SmallButton
              type="button"
              disabled={isUpdating || allSlotIds.length === 0}
              onClick={() => onSelectAllSlots(day.id, allSlotIds)}>
              Tümünü seç
            </SmallButton>
            <SmallButton
              type="button"
              disabled={isUpdating || selectedCount === 0}
              onClick={() => onClearSelectedSlots(day.id)}>
              Seçimi temizle
            </SmallButton>
            <SmallButton
              type="button"
              $danger
              disabled={isUpdating || selectedCount === 0}
              onClick={() => handleBulkUpdate(false)}>
              Seçilenleri kapat
            </SmallButton>
            <SmallButton
              type="button"
              $success
              disabled={isUpdating || selectedCount === 0}
              onClick={() => handleBulkUpdate(true)}>
              Seçilenleri aç
            </SmallButton>
            <SmallButton
              type="button"
              $danger
              disabled={isUpdating || allSlotIds.length === 0}
              onClick={() => handleBulkUpdateAll(false)}>
              Tümünü kapat
            </SmallButton>
            <SmallButton
              type="button"
              $success
              disabled={isUpdating || allSlotIds.length === 0}
              onClick={() => handleBulkUpdateAll(true)}>
              Tümünü aç
            </SmallButton>
          </ActionRow>
        </AdvancedBody>
      </AdvancedControls>

      <SlotList>
        {day.slots.map((slot) => {
          const selected = selectedSlotIds.includes(slot.id);

          return (
            <SlotRow key={slot.id}>
              <SlotSelect
                type="button"
                $selected={selected}
                disabled={isUpdating}
                aria-label={`${slot.label} seçimi`}
                onClick={() => onToggleSlotSelection(day.id, slot.id)}>
                {selected ? "x" : "+"}
              </SlotSelect>
              <SlotToggle
                type="button"
                disabled={isUpdating}
                $available={slot.isAvailable}
                title={slot.note || undefined}
                onClick={() =>
                  onToggleSlot({
                    slotId: slot.id,
                    isAvailable: !slot.isAvailable,
                  })
                }>
                <span>{slot.label}</span>
                {slot.isAvailable ? (
                  <HiOutlineCheckCircle />
                ) : (
                  <HiOutlineLockClosed />
                )}
              </SlotToggle>
            </SlotRow>
          );
        })}
      </SlotList>
    </DayCard>
  );
}

function Availability() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));
  const [selectedSlotIdsByDay, setSelectedSlotIdsByDay] = useState({});
  const weekStartKey = formatDateKey(weekStart);
  const weekEndDate = addDays(weekStart, 6);
  const weekEndKey = formatDateKey(weekEndDate);

  const {
    data: admin,
    isLoading: isLoadingAdmin,
  } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });

  const isAdmin = admin?.isAuthorized;

  const {
    data: availabilityDays = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["appointment-availability-days", weekStartKey, weekEndKey],
    queryFn: async () => {
      await ensureAvailabilityRange({
        startDate: weekStartKey,
        endDate: weekEndKey,
      });

      return getAvailabilityDays({
        startDate: weekStartKey,
        endDate: weekEndKey,
      });
    },
    enabled: Boolean(isAdmin),
    retry: false,
  });

  function invalidateAvailability() {
    queryClient.invalidateQueries({
      queryKey: ["appointment-availability-days"],
    });
  }

  const {
    mutate: toggleSlot,
    isLoading: isUpdatingSlot,
  } = useMutation({
    mutationFn: updateAvailabilitySlot,
    onSuccess: () => {
      invalidateAvailability();
      toast.success("Müsaitlik güncellendi.");
    },
    onError: (updateError) => {
      toast.error(updateError.message);
    },
  });

  const {
    mutate: updateDay,
    isLoading: isUpdatingDay,
  } = useMutation({
    mutationFn: updateAvailabilityDay,
    onSuccess: (_, variables) => {
      invalidateAvailability();
      toast.success(variables.successMessage || "Gün güncellendi.");
    },
    onError: (updateError) => {
      toast.error(updateError.message);
    },
  });

  const {
    mutate: bulkUpdateSlots,
    isLoading: isBulkUpdatingSlots,
  } = useMutation({
    mutationFn: updateAvailabilitySlots,
    onSuccess: (_, variables) => {
      setSelectedSlotIdsByDay((current) => ({
        ...current,
        [variables.dayId]: [],
      }));
      invalidateAvailability();
      toast.success("Seçili saat aralıkları güncellendi.");
    },
    onError: (updateError) => {
      toast.error(updateError.message);
    },
  });

  const days = availabilityDays.map(normalizeDay);
  const isUpdating =
    isUpdatingSlot || isUpdatingDay || isBulkUpdatingSlots;

  function handleWeekChange(amount) {
    setWeekStart((current) => addDays(current, amount * 7));
    setSelectedSlotIdsByDay({});
  }

  function handleToday() {
    setWeekStart(startOfDay(new Date()));
    setSelectedSlotIdsByDay({});
  }

  function handleToggleSlotSelection(dayId, slotId) {
    setSelectedSlotIdsByDay((current) => {
      const selectedIds = current[dayId] || [];
      const nextIds = selectedIds.includes(slotId)
        ? selectedIds.filter((id) => id !== slotId)
        : [...selectedIds, slotId];

      return {
        ...current,
        [dayId]: nextIds,
      };
    });
  }

  function handleSelectAllSlots(dayId, slotIds) {
    setSelectedSlotIdsByDay((current) => ({
      ...current,
      [dayId]: slotIds,
    }));
  }

  function handleClearSelectedSlots(dayId) {
    setSelectedSlotIdsByDay((current) => ({
      ...current,
      [dayId]: [],
    }));
  }

  return (
    <Page>
      <PageHeader>
        <HeaderCopy>
          <Heading as="h1">Müsaitlik takvimi</Heading>
          <MutedText>
            Önümüzdeki haftalardaki iki saatlik randevu aralıklarını yönetin.
          </MutedText>
        </HeaderCopy>

        <PublicLink to="/appointment">
          Müşteri ekranını aç
          <HiOutlineArrowTopRightOnSquare />
        </PublicLink>
      </PageHeader>

      <InfoPanel>
        <Heading as="h2">Gün ve saat bazlı müsaitlik yönetimi</Heading>
        <MutedText>
          Günleri tamamen kapatabilir, müşteriye açıklayıcı not ekleyebilir veya
          saat aralıklarını tek tek ve toplu olarak düzenleyebilirsiniz.
        </MutedText>
      </InfoPanel>

      <CalendarPanel>
        <CalendarToolbar>
          <WeekTitle>
            <MutedText>Görüntülenen dönem</MutedText>
            <WeekRange>
              {dateFormatter.format(weekStart)} -{" "}
              {dateFormatter.format(weekEndDate)}
            </WeekRange>
          </WeekTitle>

          <ToolbarActions>
            <ToolbarButton
              type="button"
              onClick={() => handleWeekChange(-1)}>
              <HiOutlineChevronLeft />
              Önceki hafta
            </ToolbarButton>
            <ToolbarButton
              type="button"
              onClick={handleToday}>
              <HiOutlineCalendarDays />
              Bugün
            </ToolbarButton>
            <ToolbarButton
              type="button"
              onClick={() => handleWeekChange(1)}>
              Sonraki hafta
              <HiOutlineChevronRight />
            </ToolbarButton>
          </ToolbarActions>
        </CalendarToolbar>

        {isLoadingAdmin && <Spinner />}

        {!isLoadingAdmin && !admin?.user && (
          <EmptyState>
            <strong>Admin girişi gerekiyor.</strong>
            <span>Müsaitlik takvimini düzenlemek için giriş yapın.</span>
            <div>
              <Button
                as={Link}
                to="/login">
                Giriş yap
              </Button>
            </div>
          </EmptyState>
        )}

        {!isLoadingAdmin && admin?.user && !isAdmin && (
          <EmptyState>
            <strong>Admin yetkisi bekleniyor.</strong>
            <span>
              Bu hesap henüz admin olarak onaylanmadığı için müsaitlik
              düzenleyemez.
            </span>
          </EmptyState>
        )}

        {isAdmin && isLoading && <Spinner />}

        {isAdmin && isError && (
          <EmptyState>
            <strong>Müsaitlik bilgileri okunamadı.</strong>
            <span>{error.message}</span>
          </EmptyState>
        )}

        {isAdmin && !isLoading && !isError && days.length === 0 && (
          <EmptyState>
            <strong>Bu dönem için müsaitlik kaydı bulunamadı.</strong>
            <span>
              Bu tarihler henüz planlanmamış olabilir. Başka bir döneme geçin
              veya takvim kayıtlarını yeniden oluşturun.
            </span>
          </EmptyState>
        )}

        {isAdmin && !isLoading && !isError && days.length > 0 && (
          <WeekGrid>
            {days.map((day) => (
              <AvailabilityDayCard
                key={day.id}
                day={day}
                selectedSlotIds={selectedSlotIdsByDay[day.id] || []}
                onToggleSlotSelection={handleToggleSlotSelection}
                onSelectAllSlots={handleSelectAllSlots}
                onClearSelectedSlots={handleClearSelectedSlots}
                onToggleSlot={toggleSlot}
                onUpdateDay={updateDay}
                onBulkUpdateSlots={bulkUpdateSlots}
                isUpdating={isUpdating}
              />
            ))}
          </WeekGrid>
        )}
      </CalendarPanel>
    </Page>
  );
}

export default Availability;
