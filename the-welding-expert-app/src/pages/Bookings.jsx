import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled, { css } from "styled-components";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineClipboard,
  HiOutlineEnvelope,
  HiOutlinePencilSquare,
  HiOutlinePhone,
  HiOutlineTrash,
  HiOutlineViewfinderCircle,
  HiOutlineChatBubbleLeftRight,
  HiOutlineWrenchScrewdriver,
  HiOutlineArrowUturnLeft,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import Button from "../ui/Button";
import { getAdminProfile } from "../services/apiAuth";
import {
  deleteAppointmentRequest,
  getAppointmentRequests,
  updateAppointmentRequest,
  restoreAppointmentRequest,
} from "../services/apiAppointmentRequests";

const STATUS_OPTIONS = [
  {
    value: "new",
    label: "Yeni",
    tone: "blue",
  },
  {
    value: "contacted",
    label: "İletişime geçildi",
    tone: "amber",
  },
  {
    value: "confirmed",
    label: "Onaylandı",
    tone: "green",
  },
  {
    value: "cancelled",
    label: "İptal edildi",
    tone: "red",
  },
  {
    value: "completed",
    label: "Tamamlandı",
    tone: "grey",
  },
];

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

const FilterToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;

  @media (min-width: 900px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 48rem;

  & input {
    width: 100%;
    min-height: 4.4rem;
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-sm);
    padding: 0.8rem 1.2rem 0.8rem 4rem;
    background: var(--color-grey-0);
    color: var(--color-grey-800);
    font-size: 1.4rem;

    &:focus {
      outline: 2px solid var(--color-action-primary);
      border-color: transparent;
    }
  }

  & svg {
    position: absolute;
    left: 1.4rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-400);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const FilterButton = styled.button`
  min-height: 3.8rem;
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.4rem;
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid
    ${(props) => (props.$active ? "var(--color-brand-600)" : "var(--color-grey-200)")};
  color: ${(props) => (props.$active ? "var(--color-brand-800)" : "var(--color-grey-600)")};
  background: ${(props) => (props.$active ? "var(--color-brand-100)" : "var(--color-grey-0)")};

  &:hover {
    border-color: var(--color-brand-400);
    background: var(--color-brand-50);
    color: var(--color-brand-800);
  }
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
  grid-template-columns: minmax(18rem, 0.8fr) minmax(0, 1.1fr) minmax(
      24rem,
      0.9fr
    );
  gap: 1.6rem;
  align-items: start;
  background: ${(props) => (props.$archived ? "var(--color-grey-50)" : "var(--color-grey-0)")};

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

const DetailSectionTitle = styled.p`
  color: var(--color-grey-900);
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
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

const CustomerNote = styled.div`
  border-left: 3px solid var(--color-brand-500);
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
  padding: 1rem 1.2rem;
  display: grid;
  gap: 0.4rem;
  color: var(--color-grey-700);
  background: var(--color-brand-50);
  font-size: 1.3rem;
  line-height: 1.5;

  & strong {
    color: var(--color-brand-800);
    font-size: 1.1rem;
    text-transform: uppercase;
  }
`;

const StatusBadge = styled.span`
  justify-self: start;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  color: var(--color-grey-700);
  background: var(--color-grey-100);
  font-size: 1.2rem;
  font-weight: 800;

  ${(props) =>
    props.$tone === "blue" &&
    css`
      color: var(--color-brand-700);
      background: var(--color-brand-50);
    `}

  ${(props) =>
    props.$tone === "amber" &&
    css`
      color: var(--color-status-warning-text);
      background: var(--color-status-warning-bg);
    `}

  ${(props) =>
    props.$tone === "green" &&
    css`
      color: var(--color-green-700);
      background: var(--color-green-100);
    `}

  ${(props) =>
    props.$tone === "red" &&
    css`
      color: var(--color-red-700);
      background: var(--color-red-100);
    `}
`;

const ManagementPanel = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const Select = styled.select`
  width: 100%;
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.4rem;
  font-weight: 700;
`;

const NotesArea = styled.textarea`
  width: 100%;
  min-height: 8.8rem;
  resize: vertical;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.4rem;
  line-height: 1.5;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ActionLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 4.4rem;
  border: 1px solid var(--color-green-700);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  color: var(--color-green-700);
  background: var(--color-green-100);
  font-size: 1.3rem;
  font-weight: 800;
  text-align: center;

  & svg {
    width: 1.7rem;
    height: 1.7rem;
  }
`;

const SmallButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 4.4rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  color: var(--color-grey-700);
  background: var(--color-grey-0);
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;

  & svg {
    width: 1.7rem;
    height: 1.7rem;
  }

  &:disabled {
    color: var(--color-grey-400);
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const DangerButton = styled(SmallButton)`
  color: var(--color-red-700);
  border-color: var(--color-red-100);
  background: var(--color-status-danger-bg);
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
  if (!date) return "Tarih belirtilmedi";

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

function getStatusMeta(status) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status) ||
    STATUS_OPTIONS[0]
  );
}

function formatTime(time) {
  if (!time) return "Saat belirtilmedi";

  return time.slice(0, 5);
}

function normalizePhoneForWhatsApp(phone) {
  const digits = (phone || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;

  return digits;
}

function buildWhatsAppMessage(request) {
  const statusText = getStatusMeta(request.status).label.toLowerCase();

  return [
    `Merhaba ${request.customer_name || ""}`.trim(),
    `${formatDate(request.requested_date)} ${formatTime(
      request.requested_time,
    )} için oluşturduğunuz kaynak işi talebiniz hakkında yazıyorum.`,
    `İşlem: ${request.service_type || "Belirtilmedi"}`,
    `Talep durumu: ${statusText}`,
    "Müsaitseniz ayrıntıları netleştirebiliriz.",
  ].join("\n");
}

function buildWhatsAppUrl(request) {
  const phone = normalizePhoneForWhatsApp(request.customer_phone);

  if (!phone) return "";

  return `https://wa.me/${phone}?text=${encodeURIComponent(
    buildWhatsAppMessage(request),
  )}`;
}

async function copyToClipboard(value, successMessage) {
  if (!value) {
    toast.error("Kopyalanacak bilgi bulunamadı.");
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("Bilgi kopyalanamadı.");
  }
}

function RequestItem({
  request,
  isUpdating,
  isDeleting,
  isRestoring,
  onUpdate,
  onDelete,
  onRestore,
}) {
  const customerNote = request.customer_note ?? request.notes ?? "";
  const [noteDraft, setNoteDraft] = useState(request.admin_note || "");
  const status = request.status || "new";
  const statusMeta = getStatusMeta(status);
  const whatsappUrl = buildWhatsAppUrl(request);

  function handleStatusChange(event) {
    onUpdate({
      id: request.id,
      updates: {
        status: event.target.value,
      },
      successMessage: "Talep durumu güncellendi.",
    });
  }

  function handleSaveNotes() {
    onUpdate({
      id: request.id,
      updates: {
        admin_note: noteDraft.trim() || null,
      },
      successMessage: "Admin notu kaydedildi.",
    });
  }

  function handleDelete() {
    const shouldDelete = window.confirm(
      "Bu talebi arşive kaldırmak istediğinizden emin misiniz?",
    );

    if (!shouldDelete) return;

    onDelete(request.id);
  }

  return (
    <RequestCard $archived={!!request.archived_at}>
      <Customer>
        <DetailSectionTitle>Müşteri</DetailSectionTitle>
        <CustomerName>
          {request.customer_name || "İsimsiz müşteri"}
        </CustomerName>
        <DetailLine>
          <HiOutlinePhone />
          <span>{request.customer_phone || "Telefon belirtilmedi"}</span>
        </DetailLine>
        <DetailLine>
          <HiOutlineEnvelope />
          <span>{request.customer_email || "E-posta belirtilmedi"}</span>
        </DetailLine>
        <StatusBadge $tone={statusMeta.tone}>
          {statusMeta.label}
        </StatusBadge>
      </Customer>

      <DetailGrid>
        <DetailSectionTitle>Talep ayrıntıları</DetailSectionTitle>
        <DetailLine>
          <HiOutlineCalendarDays />
          <span>{formatDate(request.requested_date)}</span>
        </DetailLine>
        <DetailLine>
          <HiOutlineClock />
          <span>{formatTime(request.requested_time)}</span>
        </DetailLine>
        <DetailLine>
          <HiOutlineWrenchScrewdriver />
          <span>{request.service_type || "Hizmet türü belirtilmedi"}</span>
        </DetailLine>
        {request.message && request.channel !== "system" && (
          <DetailLine>
            <HiOutlineViewfinderCircle />
            <span>{request.message}</span>
          </DetailLine>
        )}
        {customerNote && (
          <CustomerNote>
            <strong>Müşteri notu</strong>
            <span>{customerNote}</span>
          </CustomerNote>
        )}
        <MutedText>
          Oluşturulma: {formatCreatedAt(request.created_at)}
        </MutedText>
        {request.archived_at && (
          <MutedText style={{ color: "var(--color-red-600)", fontWeight: "bold" }}>
            Arşivlenme: {formatCreatedAt(request.archived_at)}
          </MutedText>
        )}
      </DetailGrid>

      <ManagementPanel>
        <DetailSectionTitle>Yönetim</DetailSectionTitle>
        <Select
          aria-label="Talep durumu"
          value={status}
          disabled={isUpdating || !!request.archived_at}
          onChange={handleStatusChange}>
          {STATUS_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <NotesArea
          aria-label="Admin notu"
          placeholder="Yalnızca adminlerin görebileceği bir not ekle..."
          value={noteDraft}
          maxLength={2000}
          disabled={!!request.archived_at}
          onChange={(event) => setNoteDraft(event.target.value)}
        />

        <ActionGrid>
          <SmallButton
            type="button"
            disabled={isUpdating || !!request.archived_at}
            onClick={handleSaveNotes}>
            <HiOutlinePencilSquare />
            Admin notunu kaydet
          </SmallButton>

          {whatsappUrl && !request.archived_at ? (
            <ActionLink
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer">
              <HiOutlineChatBubbleLeftRight />
              WhatsApp
            </ActionLink>
          ) : (
            <SmallButton
              type="button"
              disabled>
              <HiOutlineChatBubbleLeftRight />
              WhatsApp
            </SmallButton>
          )}

          <SmallButton
            type="button"
            onClick={() =>
              copyToClipboard(
                request.customer_phone,
                "Telefon numarası kopyalandı.",
              )
            }>
            <HiOutlineClipboard />
            Telefon
          </SmallButton>

          <SmallButton
            type="button"
            onClick={() =>
              copyToClipboard(
                request.customer_email,
                "E-posta adresi kopyalandı.",
              )
            }>
            <HiOutlineClipboard />
              E-posta
          </SmallButton>

          {request.archived_at ? (
            <SmallButton
              type="button"
              disabled={isRestoring}
              onClick={() => onRestore(request.id)}>
              <HiOutlineArrowUturnLeft />
              Arşivden çıkar
            </SmallButton>
          ) : (
            <DangerButton
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}>
              <HiOutlineTrash />
              Arşive kaldır
            </DangerButton>
          )}
        </ActionGrid>
      </ManagementPanel>
    </RequestCard>
  );
}

function Bookings() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: admin,
    isLoading: isLoadingAdmin,
  } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });

  const isAdmin = admin?.isAuthorized;
  const showArchived = statusFilter === "archived";

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["appointment-requests", showArchived],
    queryFn: () => getAppointmentRequests({ showArchived }),
    enabled: Boolean(isAdmin),
  });

  const newRequests = requests.filter(
    (request) => request.status === "new",
  ).length;
  const systemRequests = requests.filter(
    (request) => request.channel === "system",
  ).length;

  const {
    mutate: updateRequest,
    isLoading: isUpdatingRequest,
  } = useMutation({
    mutationFn: updateAppointmentRequest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["appointment-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["appointment-availability-days"],
      });
      toast.success(variables.successMessage || "Talep güncellendi.");
    },
    onError: (updateError) => {
      toast.error(updateError.message);
    },
  });

  const {
    mutate: removeRequest,
    isLoading: isDeletingRequest,
  } = useMutation({
    mutationFn: deleteAppointmentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointment-requests"],
      });
      toast.success("Talep arşive kaldırıldı.");
    },
    onError: (deleteError) => {
      toast.error(deleteError.message);
    },
  });

  const {
    mutate: restoreRequest,
    isLoading: isRestoringRequest,
  } = useMutation({
    mutationFn: restoreAppointmentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointment-requests"],
      });
      toast.success("Talep arşivden çıkarıldı.");
    },
    onError: (restoreError) => {
      toast.error(restoreError.message);
    },
  });

  const filteredRequests = requests.filter((request) => {
    // 1. Status Filter (when viewing active requests list, we can filter locally by specific status)
    if (statusFilter !== "all" && statusFilter !== "archived") {
      if (request.status !== statusFilter) return false;
    }

    // 2. Search Query filter (local text search)
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      const name = (request.customer_name || "").toLowerCase();
      const phone = (request.customer_phone || "").toLowerCase();
      const email = (request.customer_email || "").toLowerCase();
      const note = (request.customer_note || request.notes || "").toLowerCase();
      const adminNote = (request.admin_note || "").toLowerCase();
      const service = (request.service_type || "").toLowerCase();

      return (
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search) ||
        note.includes(search) ||
        adminNote.includes(search) ||
        service.includes(search)
      );
    }

    return true;
  });

  return (
    <Page>
      <PageHeader>
        <HeaderCopy>
          <Heading as="h1">Randevu talepleri</Heading>
          <MutedText>
            Müşterilerin randevu ekranından bıraktığı talepleri değerlendirin
            ve iş durumlarını güncelleyin.
          </MutedText>
        </HeaderCopy>

        <PublicLink to="/appointment">
          Müşteri ekranını aç
          <HiOutlineArrowTopRightOnSquare />
        </PublicLink>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <MutedText>{showArchived ? "Arşivlenen talep" : "Toplam aktif talep"}</MutedText>
          <StatValue>{requests.length}</StatValue>
        </StatCard>
        <StatCard>
          <MutedText>Yeni talep</MutedText>
          <StatValue>{showArchived ? "-" : newRequests}</StatValue>
        </StatCard>
        <StatCard>
          <MutedText>Sistem üzerinden</MutedText>
          <StatValue>{showArchived ? "-" : systemRequests}</StatValue>
        </StatCard>
      </StatsGrid>

      <RequestsPanel>
        <div>
          <Heading as="h2">Müşteri talepleri</Heading>
          <MutedText>
            Sistem üzerinden oluşturulan talepler burada görüntülenir.
            WhatsApp ve e-posta görüşmeleri kendi iletişim kanalında devam eder.
          </MutedText>
        </div>

        <FilterToolbar>
          <SearchContainer>
            <HiOutlineMagnifyingGlass />
            <input
              type="text"
              placeholder="Müşteri adı, tel, e-posta veya notlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>

          <FilterGroup>
            <FilterButton
              $active={statusFilter === "all"}
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}>
              Tümü
            </FilterButton>
            <FilterButton
              $active={statusFilter === "new"}
              onClick={() => setStatusFilter("new")}>
              Yeni
            </FilterButton>
            <FilterButton
              $active={statusFilter === "contacted"}
              onClick={() => setStatusFilter("contacted")}>
              İletişime geçildi
            </FilterButton>
            <FilterButton
              $active={statusFilter === "confirmed"}
              onClick={() => setStatusFilter("confirmed")}>
              Onaylandı
            </FilterButton>
            <FilterButton
              $active={statusFilter === "cancelled"}
              onClick={() => setStatusFilter("cancelled")}>
              İptal edildi
            </FilterButton>
            <FilterButton
              $active={statusFilter === "completed"}
              onClick={() => setStatusFilter("completed")}>
              Tamamlandı
            </FilterButton>
            <FilterButton
              $active={statusFilter === "archived"}
              onClick={() => {
                setStatusFilter("archived");
                setSearchQuery("");
              }}>
              Arşivlenenler
            </FilterButton>
          </FilterGroup>
        </FilterToolbar>

        {isLoadingAdmin && <Spinner />}

        {!isLoadingAdmin && !admin?.user && (
          <EmptyState>
            <strong>Admin girişi gerekiyor.</strong>
            <span>
              Müşteri talepleri kişisel bilgi içerir. Listeyi görebilmek için
              aktif bir admin hesabıyla giriş yapın.
            </span>
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
              Bu hesap henüz aktif admin olarak onaylanmadı.
            </span>
          </EmptyState>
        )}

        {isAdmin && isLoading && <Spinner />}

        {isAdmin && isError && (
          <ErrorState>
            <strong>Randevu talepleri okunamadı.</strong>
            <span>{error.message}</span>
            <span>
              Supabase bağlantısını ve randevu talepleri için tanımlanan erişim
              politikalarını kontrol edin.
            </span>
          </ErrorState>
        )}

        {isAdmin && !isLoading && !isError && requests.length === 0 && (
          <EmptyState>
            <strong>
              {showArchived
                ? "Henüz arşivlenmiş talep bulunmuyor."
                : "Henüz sistem üzerinden oluşturulmuş aktif talep yok."}
            </strong>
            <span>
              {showArchived
                ? "Silinen randevu talepleri arşive kaldırıldığında burada listelenir."
                : "Müşteri bir gün ve saat seçerek talep oluşturduğunda burada görüntülenecektir."}
            </span>
          </EmptyState>
        )}

        {isAdmin && !isLoading && !isError && requests.length > 0 && filteredRequests.length === 0 && (
          <EmptyState>
            <strong>Arama kriterlerinize veya seçili filtreye uygun sonuç bulunamadı.</strong>
            <span>Farklı bir arama kelimesi yazmayı veya filtre sekmesini değiştirmeyi deneyin.</span>
          </EmptyState>
        )}

        {isAdmin && !isLoading && !isError && filteredRequests.length > 0 && (
          <RequestList>
            {filteredRequests.map((request) => (
              <RequestItem
                key={request.id}
                request={request}
                isUpdating={isUpdatingRequest}
                isDeleting={isDeletingRequest}
                isRestoring={isRestoringRequest}
                onUpdate={updateRequest}
                onDelete={removeRequest}
                onRestore={restoreRequest}
              />
            ))}
          </RequestList>
        )}
      </RequestsPanel>
    </Page>
  );
}

export default Bookings;
