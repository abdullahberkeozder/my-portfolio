import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
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
import AvailabilityDayCard from "../features/availability/components/AvailabilityDayCard";

import {
  Page,
  PageHeader,
  HeaderCopy,
  MutedText,
  PublicLink,
  InfoPanel,
  CalendarPanel,
  CalendarToolbar,
  WeekTitle,
  WeekRange,
  ToolbarActions,
  ToolbarButton,
  WeekGrid,
  EmptyState,
} from "./Availability.styles";

import {
  OPENING_HOUR,
  CLOSING_HOUR,
  SLOT_DURATION_HOURS,
} from "../config/business";

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
