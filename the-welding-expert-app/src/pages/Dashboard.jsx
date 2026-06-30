import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import {
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePhoto,
  HiOutlineUserGroup,
} from "react-icons/hi2";

import Button from "../ui/Button";
import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import { getAppointmentRequests } from "../services/apiAppointmentRequests";
import { getAvailabilityDays } from "../services/apiAvailability";
import { getAdminProfile } from "../services/apiAuth";
import { ROUTE_ROLES } from "../utils/adminPermissions";
import {
  OPENING_HOUR,
  CLOSING_HOUR,
  SLOT_DURATION_HOURS,
} from "../config/business";
import {
  formatDateKey,
  parseDateKey,
  addDays,
} from "../utils/dateHelpers";


const DAY_STATUS_LABELS = {
  available: "Müsait",
  limited: "Kısıtlı",
  closed: "Kapalı",
  missing: "Planlanmadı",
};

const REQUEST_STATUS_LABELS = {
  new: "Yeni",
  contacted: "İletişime geçildi",
  confirmed: "Onaylandı",
  cancelled: "İptal edildi",
  completed: "Tamamlandı",
};


const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
});

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
});

const requestDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});


function isStandardSlot(slotTime) {
  const hour = Number(slotTime.slice(0, 2));
  const minute = slotTime.slice(3, 5);

  return (
    hour >= OPENING_HOUR &&
    hour + SLOT_DURATION_HOURS <= CLOSING_HOUR &&
    minute === "00" &&
    (hour - OPENING_HOUR) % SLOT_DURATION_HOURS === 0
  );
}

function formatRequestDate(request) {
  if (!request.requested_date) return "Tarih belirtilmedi";

  return `${requestDateFormatter.format(
    parseDateKey(request.requested_date),
  )}, ${request.requested_time?.slice(0, 5) || "Saat yok"}`;
}

function buildWeekAvailability(days, startDate) {
  const daysByDate = new Map(days.map((day) => [day.work_date, day]));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startDate, index);
    const dateKey = formatDateKey(date);
    const databaseDay = daysByDate.get(dateKey);

    if (!databaseDay) {
      return {
        dateKey,
        day: dayFormatter.format(date),
        date: dateFormatter.format(date),
        status: "missing",
        slots: [],
      };
    }

    const availableSlots = [
      ...(databaseDay.appointment_availability_slots || []),
    ]
      .filter(
        (slot) => slot.is_available && isStandardSlot(slot.slot_time),
      )
      .sort((a, b) => a.slot_time.localeCompare(b.slot_time))
      .map((slot) => slot.slot_time.slice(0, 5));

    return {
      dateKey,
      day: dayFormatter.format(date),
      date: dateFormatter.format(date),
      status: databaseDay.status || "available",
      slots: databaseDay.status === "closed" ? [] : availableSlots,
    };
  });
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const Hero = styled.section`
  background: linear-gradient(
    135deg,
    var(--color-surface-dark) 0%,
    var(--color-surface-steel) 55%,
    var(--color-rust-700) 100%
  );
  color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(
      28rem,
      0.8fr
    );
  gap: 3.2rem;
  align-items: center;
  box-shadow: var(--shadow-md);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Eyebrow = styled.p`
  color: var(--color-accent-400);
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  max-width: 72rem;
  font-size: 4rem;
  line-height: 1.1;
  font-weight: 700;

  @media (max-width: 560px) {
    font-size: 3rem;
  }
`;

const HeroText = styled.p`
  max-width: 62rem;
  color: var(--color-grey-200);
  font-size: 1.7rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  min-height: 4.4rem;
  padding: 1.1rem 1.6rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(props) =>
    props.$secondary
      ? "var(--color-text-inverse)"
      : "var(--color-surface-dark)"};
  background: ${(props) =>
    props.$secondary
      ? "rgba(255, 255, 255, 0.12)"
      : "var(--color-accent-400)"};
  border: 1px solid
    ${(props) =>
      props.$secondary
        ? "rgba(255, 255, 255, 0.24)"
        : "var(--color-accent-400)"};

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const HeroPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  display: grid;
  gap: 1.6rem;
`;

const HeroPanelItem = styled.div`
  display: grid;
  grid-template-columns: 4.4rem 1fr;
  gap: 1.2rem;
  align-items: center;

  & svg {
    width: 4.4rem;
    height: 4.4rem;
    padding: 1rem;
    border-radius: 50%;
    color: var(--color-accent-400);
    background: rgba(255, 255, 255, 0.12);
  }
`;

const PanelLabel = styled.span`
  display: block;
  color: var(--color-text-inverse-muted);
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const PanelValue = styled.strong`
  display: block;
  color: var(--color-grey-0);
  font-size: 1.8rem;
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 1020px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  grid-template-columns: 4.8rem 1fr;
  gap: 1.2rem;
  align-items: center;
`;

const StatIcon = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-${(props) => props.$color}-700);
  background: var(--color-${(props) => props.$color}-100);

  & svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const StatLabel = styled.p`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const StatValue = styled.p`
  color: var(--color-grey-800);
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1.1;
`;

const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(
      32rem,
      0.85fr
    );
  gap: 2.4rem;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  margin-bottom: 2rem;
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1.2rem;
  padding-bottom: 0.4rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(7, minmax(14rem, 1fr));
    overflow-x: auto;
  }
`;

const DayCard = styled.article`
  min-width: 0;
  min-height: 18rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: ${(props) =>
    props.$closed
      ? "var(--color-grey-50)"
      : "var(--color-grey-0)"};
`;

const DayName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-grey-800);
  overflow-wrap: normal;
  hyphens: none;
`;

const DayDate = styled.p`
  color: var(--color-grey-500);
  font-size: 1.2rem;
`;

const StatusBadge = styled.span`
  align-self: flex-start;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) =>
    props.$status === "available"
      ? "var(--color-green-700)"
      : props.$status === "limited"
        ? "var(--color-yellow-700)"
        : "var(--color-grey-600)"};
  background: ${(props) =>
    props.$status === "available"
      ? "var(--color-green-100)"
      : props.$status === "limited"
        ? "var(--color-yellow-100)"
        : "var(--color-grey-100)"};
`;

const SlotList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-top: auto;
`;

const Slot = styled.li`
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 600;
`;

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const RequestCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.4rem;
  display: grid;
  gap: 0.6rem;
`;

const RequestTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
`;

const RequestTitle = styled.h3`
  color: var(--color-grey-800);
  font-size: 1.5rem;
  font-weight: 700;
`;

const RequestStatus = styled.span`
  white-space: nowrap;
  color: var(--color-selection-strong);
  background: var(--color-selection-soft);
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 1.1rem;
  font-weight: 700;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
  margin-top: 1.6rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ContactLink = styled.a`
  min-height: 5.6rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  color: var(--color-grey-700);
  background: var(--color-grey-50);

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-brand-600);
  }
`;

const DashboardState = styled.section`
  min-height: 28rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: grid;
  place-items: center;
  text-align: center;
  background: var(--color-grey-0);
`;

const StateContent = styled.div`
  max-width: 52rem;
  display: grid;
  justify-items: center;
  gap: 1.2rem;
`;

const EmptyState = styled.div`
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1.6rem;
  color: var(--color-grey-500);
  font-size: 1.4rem;
  font-weight: 600;
`;

function Dashboard() {
  const { data: admin } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });
  const canManageOperations = ROUTE_ROLES.bookings.includes(
    admin?.profile?.role,
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = addDays(today, 6);
  const todayKey = formatDateKey(today);
  const endDateKey = formatDateKey(endDate);

  const requestsQuery = useQuery({
    queryKey: ["appointment-requests"],
    queryFn: () => getAppointmentRequests(),
    refetchInterval: 30000,
  });

  const availabilityQuery = useQuery({
    queryKey: ["appointment-availability-days", todayKey, endDateKey],
    queryFn: () =>
      getAvailabilityDays({
        startDate: todayKey,
        endDate: endDateKey,
      }),
    refetchInterval: 30000,
  });

  const isLoading = requestsQuery.isLoading || availabilityQuery.isLoading;
  const isError = requestsQuery.isError || availabilityQuery.isError;

  if (isLoading) {
    return (
      <Page>
        <DashboardState>
          <StateContent>
            <Spinner />
            <Heading as="h2">Kontrol merkezi hazırlanıyor</Heading>
            <MutedText>
              Randevu talepleri ve müsaitlik bilgileri yükleniyor.
            </MutedText>
          </StateContent>
        </DashboardState>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <DashboardState>
          <StateContent>
            <Heading as="h2">Kontrol merkezi verileri alınamadı</Heading>
            <MutedText>
              Supabase bağlantısını kontrol edip yeniden deneyin. Admin paneli
              örnek veri göstermeyecektir.
            </MutedText>
            <Button
              type="button"
              onClick={() => {
                requestsQuery.refetch();
                availabilityQuery.refetch();
              }}>
              <HiOutlineArrowPath />
              Tekrar dene
            </Button>
          </StateContent>
        </DashboardState>
      </Page>
    );
  }

  const requests = requestsQuery.data || [];
  const availabilityDays = availabilityQuery.data || [];
  const weekAvailability = buildWeekAvailability(availabilityDays, today);
  const openSlotCount = availabilityDays.reduce((total, day) => {
    if (day.status === "closed") return total;

    return (
      total +
      (day.appointment_availability_slots || []).filter(
        (slot) => slot.is_available && isStandardSlot(slot.slot_time),
      ).length
    );
  }, 0);
  const newRequestCount = requests.filter(
    (request) => request.status === "new",
  ).length;
  const confirmedThisWeek = requests.filter(
    (request) =>
      request.status === "confirmed" &&
      request.requested_date >= todayKey &&
      request.requested_date <= endDateKey,
  ).length;
  const customerCount = new Set(
    requests.map(
      (request) =>
        request.customer_phone ||
        request.customer_email ||
        request.customer_name?.trim().toLocaleLowerCase("tr-TR"),
    ).filter(Boolean),
  ).size;
  const nextAppointment = requests
    .filter(
      (request) =>
        request.status === "confirmed" && request.requested_date >= todayKey,
    )
    .sort((a, b) =>
      `${a.requested_date}T${a.requested_time}`.localeCompare(
        `${b.requested_date}T${b.requested_time}`,
      ),
    )[0];
  const recentRequests = requests.slice(0, 5);

  return (
    <Page>
      <Hero>
        <HeroCopy>
          <Eyebrow>İş takip paneli</Eyebrow>
          <HeroTitle>Randevuları ve müşteri taleplerini tek yerden yönetin</HeroTitle>
          <HeroText>
            Yeni talepleri değerlendirin, müsaitlik takvimini güncel tutun ve
            onaylanan işleri yaklaşan tarihlere göre takip edin.
          </HeroText>
          <Actions>
            <ActionLink to="/appointment">
              <HiOutlineCalendarDays />
              Müşteri ekranını aç
            </ActionLink>
            {canManageOperations && (
              <ActionLink to="/admin/bookings" $secondary>
                <HiOutlineClock />
                Talepleri incele
              </ActionLink>
            )}
          </Actions>
        </HeroCopy>

        <HeroPanel>
          <HeroPanelItem>
            <HiOutlineCalendarDays />
            <div>
              <PanelLabel>Sıradaki onaylı randevu</PanelLabel>
              <PanelValue>
                {nextAppointment
                  ? formatRequestDate(nextAppointment)
                  : "Planlanmış randevu yok"}
              </PanelValue>
            </div>
          </HeroPanelItem>
          <HeroPanelItem>
            <HiOutlineClock />
            <div>
              <PanelLabel>İşlem bekleyen talepler</PanelLabel>
              <PanelValue>{newRequestCount} yeni talep</PanelValue>
            </div>
          </HeroPanelItem>
        </HeroPanel>
      </Hero>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="green">
            <HiOutlineCheckCircle />
          </StatIcon>
          <div>
            <StatLabel>Açık randevu aralığı</StatLabel>
            <StatValue>{openSlotCount}</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="blue">
            <HiOutlineCalendarDays />
          </StatIcon>
          <div>
            <StatLabel>Onaylanan iş / 7 gün</StatLabel>
            <StatValue>{confirmedThisWeek}</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="yellow">
            <HiOutlineClock />
          </StatIcon>
          <div>
            <StatLabel>Yeni talep</StatLabel>
            <StatValue>{newRequestCount}</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="indigo">
            <HiOutlineUserGroup />
          </StatIcon>
          <div>
            <StatLabel>Toplam müşteri</StatLabel>
            <StatValue>{customerCount}</StatValue>
          </div>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionHeader>
          <div>
            <Heading as="h2">Önümüzdeki 7 günün müsaitliği</Heading>
            <MutedText>
              Müşteri ekranında görünen açık ve kapalı randevu aralıkları.
            </MutedText>
          </div>
        </SectionHeader>

        <WeekGrid>
          {weekAvailability.map((day) => (
            <DayCard
              key={day.dateKey}
              $closed={["closed", "missing"].includes(day.status)}>
              <div>
                <DayName>{day.day}</DayName>
                <DayDate>{day.date}</DayDate>
              </div>
              <StatusBadge $status={day.status}>
                {DAY_STATUS_LABELS[day.status]}
              </StatusBadge>
              <SlotList>
                {day.slots.slice(0, 3).map((slot) => (
                  <Slot key={slot}>{slot}</Slot>
                ))}
                {day.slots.length > 3 && (
                  <Slot>+{day.slots.length - 3} saat daha</Slot>
                )}
                {day.slots.length === 0 && <Slot>Uygun saat yok</Slot>}
              </SlotList>
            </DayCard>
          ))}
        </WeekGrid>
      </Section>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Son müşteri talepleri</Heading>
              <MutedText>
                En son oluşturulan beş talep ve güncel durumları.
              </MutedText>
            </div>
          </SectionHeader>

          {recentRequests.length === 0 ? (
            <EmptyState>Henüz müşteri talebi bulunmuyor.</EmptyState>
          ) : (
            <RequestList>
              {recentRequests.map((request) => (
                <RequestCard key={request.id}>
                  <RequestTop>
                    <RequestTitle>
                      {request.customer_name || "İsimsiz müşteri"}
                    </RequestTitle>
                    <RequestStatus>
                      {REQUEST_STATUS_LABELS[request.status] || "Yeni"}
                    </RequestStatus>
                  </RequestTop>
                  <MutedText>
                    {request.service_type || "Hizmet türü belirtilmedi"}
                  </MutedText>
                  <Slot>{formatRequestDate(request)}</Slot>
                </RequestCard>
              ))}
            </RequestList>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Hızlı işlemler</Heading>
              <MutedText>Sık kullanılan yönetim ekranlarına ulaşın.</MutedText>
            </div>
          </SectionHeader>

          <ContactGrid>
            {canManageOperations && (
              <ContactLink as={Link} to="/admin/bookings">
                <HiOutlineUserGroup />
                Talepleri yönet
              </ContactLink>
            )}
            {canManageOperations && (
              <ContactLink as={Link} to="/admin/availability">
                <HiOutlineClock />
                Müsaitliği düzenle
              </ContactLink>
            )}
            <ContactLink
              as={Link}
              to="/appointment">
              <HiOutlineArrowTopRightOnSquare />
              Müşteri ekranını aç
            </ContactLink>
            <ContactLink
              as={Link}
              to="/gallery">
              <HiOutlinePhoto />
              Galeriyi görüntüle
            </ContactLink>
          </ContactGrid>
        </Section>
      </ContentGrid>
    </Page>
  );
}

export default Dashboard;
