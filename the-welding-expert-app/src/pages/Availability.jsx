import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled, { css } from "styled-components";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
} from "react-icons/hi2";

import Button from "../ui/Button";
import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import { getAdminProfile } from "../services/apiAuth";
import {
  getAvailabilityDays,
  updateAvailabilitySlot,
} from "../services/apiAvailability";

const OPENING_HOUR = 9;
const CLOSING_HOUR = 21;
const SLOT_DURATION_HOURS = 2;

const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
});

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
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
  padding: 2.4rem;
  display: grid;
  gap: 1.6rem;
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(7, minmax(16rem, 1fr));
    overflow-x: auto;
    padding-bottom: 0.6rem;
  }
`;

const DayCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.4rem;
  display: grid;
  gap: 1rem;
  align-content: start;
`;

const DayTitle = styled.div`
  display: grid;
  gap: 0.2rem;
`;

const DayName = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.5rem;
  font-weight: 800;
  text-transform: capitalize;
`;

const DayDate = styled.p`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
`;

const SlotList = styled.div`
  display: grid;
  gap: 0.7rem;
`;

const SlotToggle = styled.button`
  min-height: 4rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid
    ${(props) =>
      props.$available ? "var(--color-green-700)" : "var(--color-grey-300)"};
  padding: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  color: ${(props) =>
    props.$available ? "var(--color-green-700)" : "var(--color-grey-600)"};
  background: ${(props) =>
    props.$available ? "var(--color-green-100)" : "var(--color-grey-100)"};
  font-size: 1.2rem;
  font-weight: 800;

  ${(props) =>
    !props.$available &&
    css`
      text-decoration: line-through;
    `}

  & svg {
    width: 1.7rem;
    height: 1.7rem;
  }

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
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

  return (
    hour >= OPENING_HOUR &&
    hour + SLOT_DURATION_HOURS <= CLOSING_HOUR &&
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
    }));

  return {
    id: day.id,
    dateValue: day.work_date,
    dayName: dayFormatter.format(date),
    dateLabel: dateFormatter.format(date),
    slots,
  };
}

function Availability() {
  const queryClient = useQueryClient();
  const today = new Date();
  const weekStartKey = formatDateKey(today);
  const weekEndKey = formatDateKey(addDays(today, 6));

  const {
    data: admin,
    isLoading: isLoadingAdmin,
  } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });

  const isAdmin = admin?.isAdmin;

  const {
    data: availabilityDays = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["appointment-availability-days", weekStartKey, weekEndKey],
    queryFn: () =>
      getAvailabilityDays({
        startDate: weekStartKey,
        endDate: weekEndKey,
      }),
    enabled: Boolean(isAdmin),
    retry: false,
  });

  const { mutate: toggleSlot, isLoading: isUpdating } = useMutation({
    mutationFn: updateAvailabilitySlot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointment-availability-days"],
      });
      toast.success("Musaitlik guncellendi.");
    },
    onError: (updateError) => {
      toast.error(updateError.message);
    },
  });

  const days = availabilityDays.map(normalizeDay);

  return (
    <Page>
      <PageHeader>
        <HeaderCopy>
          <Heading as="h1">Availability</Heading>
          <MutedText>
            Haftalik takvimde 2 saatlik randevu bloklarini acip kapatin.
          </MutedText>
        </HeaderCopy>

        <PublicLink to="/appointment">
          Musteri ekranini ac
          <HiOutlineArrowTopRightOnSquare />
        </PublicLink>
      </PageHeader>

      <InfoPanel>
        <Heading as="h2">2 saatlik is varsayimi</Heading>
        <MutedText>
          Her blok ortalama bir kaynak isinin 2 saat surecegi varsayimiyla
          olusturulur. Bir gun icinde birden fazla blogu kapatabilirsiniz.
        </MutedText>
      </InfoPanel>

      <CalendarPanel>
        {isLoadingAdmin && <Spinner />}

        {!isLoadingAdmin && !admin?.user && (
          <EmptyState>
            <strong>Admin girisi gerekiyor.</strong>
            <span>Musaitlik takvimini duzenlemek icin giris yapin.</span>
            <div>
              <Button
                as={Link}
                to="/login">
                Giris yap
              </Button>
            </div>
          </EmptyState>
        )}

        {!isLoadingAdmin && admin?.user && !isAdmin && (
          <EmptyState>
            <strong>Admin yetkisi bekleniyor.</strong>
            <span>
              Bu hesap henuz admin olarak onaylanmadigi icin musaitlik
              duzenleyemez.
            </span>
          </EmptyState>
        )}

        {isAdmin && isLoading && <Spinner />}

        {isAdmin && isError && (
          <EmptyState>
            <strong>Musaitlik verisi okunamadi.</strong>
            <span>{error.message}</span>
          </EmptyState>
        )}

        {isAdmin && !isLoading && !isError && (
          <WeekGrid>
            {days.map((day) => (
              <DayCard key={day.id}>
                <DayTitle>
                  <DayName>{day.dayName}</DayName>
                  <DayDate>{day.dateLabel}</DayDate>
                </DayTitle>
                <SlotList>
                  {day.slots.map((slot) => (
                    <SlotToggle
                      key={slot.id}
                      type="button"
                      disabled={isUpdating}
                      $available={slot.isAvailable}
                      onClick={() =>
                        toggleSlot({
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
                  ))}
                </SlotList>
              </DayCard>
            ))}
          </WeekGrid>
        )}
      </CalendarPanel>
    </Page>
  );
}

export default Availability;
