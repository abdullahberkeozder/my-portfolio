import { useState } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import {
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

import {
  DayCard,
  DayTitle,
  DayTitleCopy,
  DayName,
  DayDate,
  StatusBadge,
  Select,
  ActionRow,
  SmallButton,
  NoteArea,
  DaySummary,
  AdvancedControls,
  AdvancedBody,
  SlotList,
  SlotRow,
  SlotSelect,
  SlotToggle,
} from "../../../pages/Availability.styles";

import { DAY_STATUS_OPTIONS } from "../../../config/business";

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

AvailabilityDayCard.propTypes = {
  day: PropTypes.object.isRequired,
  selectedSlotIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleSlotSelection: PropTypes.func.isRequired,
  onSelectAllSlots: PropTypes.func.isRequired,
  onClearSelectedSlots: PropTypes.func.isRequired,
  onToggleSlot: PropTypes.func.isRequired,
  onUpdateDay: PropTypes.func.isRequired,
  onBulkUpdateSlots: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool,
};

export default AvailabilityDayCard;
