import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import Button from "../ui/Button";
import { getAdminProfile } from "../services/apiAuth";
import { getAppointmentRequests } from "../services/apiAppointmentRequests";

const Page = styled.div`
  display: flex;
  flex-direction: column;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.article`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  display: grid;
  gap: 0.4rem;
`;

const StatValue = styled.p`
  color: var(--color-grey-900);
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1;
`;

const RequestsPanel = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  gap: 1.6rem;
`;

const RequestList = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const RequestCard = styled.article`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  grid-template-columns: minmax(18rem, 0.8fr) minmax(0, 1.2fr) auto;
  gap: 1.6rem;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Customer = styled.div`
  display: grid;
  gap: 0.7rem;
`;

const CustomerName = styled.h3`
  color: var(--color-grey-900);
  font-size: 1.7rem;
  font-weight: 800;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: 0.7rem;
`;

const DetailLine = styled.div`
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.8rem;
  align-items: start;
  color: var(--color-grey-700);
  font-size: 1.4rem;
  font-weight: 600;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-brand-600);
  }
`;

const StatusBadge = styled.span`
  justify-self: end;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  color: var(--color-green-700);
  background: var(--color-green-100);
  font-size: 1.2rem;
  font-weight: 800;

  @media (max-width: 980px) {
    justify-self: start;
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

const ErrorState = styled(EmptyState)`
  color: var(--color-red-700);
  background: var(--color-red-100);
`;

function formatDate(date) {
  if (!date) return "Tarih yok";

  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatCreatedAt(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function Bookings() {
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
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["appointment-requests"],
    queryFn: getAppointmentRequests,
    enabled: Boolean(isAdmin),
  });

  const newRequests = requests.filter(
    (request) => request.status === "new",
  ).length;
  const systemRequests = requests.filter(
    (request) => request.channel === "system",
  ).length;

  return (
    <Page>
      <PageHeader>
        <HeaderCopy>
          <Heading as="h1">Appointment requests</Heading>
          <MutedText>
            Musterilerin public randevu ekranindan biraktigi talepleri buradan
            takip edin.
          </MutedText>
        </HeaderCopy>

        <PublicLink to="/appointment">
          Musteri ekranini ac
          <HiOutlineArrowTopRightOnSquare />
        </PublicLink>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <MutedText>Toplam talep</MutedText>
          <StatValue>{requests.length}</StatValue>
        </StatCard>
        <StatCard>
          <MutedText>Yeni talep</MutedText>
          <StatValue>{newRequests}</StatValue>
        </StatCard>
        <StatCard>
          <MutedText>Sistem uzerinden</MutedText>
          <StatValue>{systemRequests}</StatValue>
        </StatCard>
      </StatsGrid>

      <RequestsPanel>
        <div>
          <Heading as="h2">Musteri talepleri</Heading>
          <MutedText>
            WhatsApp veya email ile gelenler ilgili kanalda kalir; sistem
            uzerinden birakilan talepler Supabase tablosundan burada gorunur.
          </MutedText>
        </div>

        {isLoadingAdmin && <Spinner />}

        {!isLoadingAdmin && !admin?.user && (
          <EmptyState>
            <strong>Admin girisi gerekiyor.</strong>
            <span>
              Musteri talepleri kisisel bilgi icerir. Listeyi gorebilmek icin
              Supabase Auth ile admin kullanicisi olarak giris yapin.
            </span>
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
              Bu hesap giris yapti ama henuz admin olarak onaylanmadi.
              Supabase SQL Editor uzerinden kullanici rolunu admin yapin.
            </span>
          </EmptyState>
        )}

        {isAdmin && isLoading && <Spinner />}

        {isAdmin && isError && (
          <ErrorState>
            <strong>Supabase talepleri okunamadi.</strong>
            <span>{error.message}</span>
            <span>
              appointment_requests tablosunu ve RLS politikalarini ekledikten
              sonra bu panel talepleri listeleyecek.
            </span>
          </ErrorState>
        )}

        {isAdmin && !isLoading && !isError && requests.length === 0 && (
          <EmptyState>
            <strong>Henuz sistem talebi yok.</strong>
            <span>
              Musteri public ekrandan gun/saat secip Sisteme talep birak
              dediginde burada gorunecek.
            </span>
          </EmptyState>
        )}

        {isAdmin && !isLoading && !isError && requests.length > 0 && (
          <RequestList>
            {requests.map((request) => (
              <RequestCard key={request.id}>
                <Customer>
                  <CustomerName>
                    {request.customer_name || "Isimsiz musteri"}
                  </CustomerName>
                  <DetailLine>
                    <HiOutlinePhone />
                    <span>{request.customer_phone || "Telefon yok"}</span>
                  </DetailLine>
                  <DetailLine>
                    <HiOutlineEnvelope />
                    <span>{request.customer_email || "Email yok"}</span>
                  </DetailLine>
                </Customer>

                <DetailGrid>
                  <DetailLine>
                    <HiOutlineCalendarDays />
                    <span>{formatDate(request.requested_date)}</span>
                  </DetailLine>
                  <DetailLine>
                    <HiOutlineClock />
                    <span>{request.requested_time || "Saat yok"}</span>
                  </DetailLine>
                  <DetailLine>
                    <HiOutlineWrenchScrewdriver />
                    <span>{request.service_type || "Is tipi yok"}</span>
                  </DetailLine>
                  {request.notes && (
                    <DetailLine>
                      <HiOutlineUser />
                      <span>{request.notes}</span>
                    </DetailLine>
                  )}
                  <MutedText>
                    Olusturulma: {formatCreatedAt(request.created_at)}
                  </MutedText>
                </DetailGrid>

                <StatusBadge>{request.status || "new"}</StatusBadge>
              </RequestCard>
            ))}
          </RequestList>
        )}
      </RequestsPanel>
    </Page>
  );
}

export default Bookings;
