import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineShieldCheck,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

import Button from "../ui/Button";
import Heading from "../ui/Heading";
import SEO from "../ui/SEO";
import Spinner from "../ui/Spinner";
import {
  getPublicAppointmentRequest,
  submitAppointmentCustomerAction,
} from "../services/apiAppointmentRequests";
import { logEvent } from "../services/apiAnalytics";
import { ANALYTICS_EVENTS } from "../analytics/events";
import { formatDateKey } from "../utils/dateHelpers";
import { getResponseExpectation } from "../utils/businessHours";

const Page = styled.main`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding: 3.2rem 1.6rem 6.4rem;

  @media (max-width: 560px) {
    padding: 2rem 1.2rem 4rem;
  }
`;

const Shell = styled.div`
  width: min(82rem, 100%);
  margin: 0 auto;
  display: grid;
  gap: 1.6rem;
`;

const Card = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 1.8rem;

  @media (max-width: 560px) {
    padding: 1.6rem;
  }
`;

const BackLink = styled(Link)`
  width: fit-content;
  min-height: 4.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-brand-700);
  font-size: 1.4rem;
  font-weight: 800;

  & svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.6rem;

  @media (max-width: 560px) {
    display: grid;
  }
`;

const MutedText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
  line-height: 1.65;
`;

const StatusBadge = styled.span`
  flex-shrink: 0;
  border: 1px solid var(--color-brand-100);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  color: var(--color-brand-700);
  background: var(--color-brand-50);
  font-size: 1.2rem;
  font-weight: 800;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  padding: 1.4rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 1rem;
  background: var(--color-grey-50);

  & svg {
    grid-row: 1 / span 2;
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }
`;

const DetailLabel = styled.span`
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
`;

const DetailValue = styled.strong`
  color: var(--color-grey-900);
  font-size: 1.4rem;
`;

const NextStep = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 1.2rem;
  border-left: 3px solid var(--color-brand-600);
  padding: 1.2rem 1.4rem;
  background: var(--color-brand-50);

  & svg {
    grid-row: 1 / span 2;
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-brand-700);
  }

  & strong {
    color: var(--color-grey-900);
    font-size: 1.4rem;
  }
`;

const MetaRow = styled.p`
  color: var(--color-grey-500);
  font-size: 1.2rem;
`;

const ActionTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
  padding: 0.4rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-50);
`;

const TabButton = styled.button`
  min-height: 4.8rem;
  border: 1px solid
    ${(props) => (props.$active ? "var(--color-brand-600)" : "transparent")};
  border-radius: var(--border-radius-sm);
  color: ${(props) => (props.$active ? "var(--color-brand-800)" : "var(--color-grey-600)")};
  background: ${(props) => (props.$active ? "var(--color-grey-0)" : "transparent")};
  font-size: 1.35rem;
  font-weight: 800;
  cursor: pointer;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1.4rem;
`;

const Field = styled.label`
  display: grid;
  gap: 0.6rem;
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 800;
`;

const InputControl = styled.input`
  min-height: 4.6rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  color: var(--color-grey-800);
  background: var(--color-grey-0);
  font-size: 1.5rem;
`;

const Select = styled.select`
  min-height: 4.6rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  color: var(--color-grey-800);
  background: var(--color-grey-0);
  font-size: 1.5rem;
`;

const Textarea = styled.textarea`
  min-height: 10rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  resize: vertical;
  color: var(--color-grey-800);
  background: var(--color-grey-0);
  font-size: 1.5rem;
  line-height: 1.5;
`;

const Notice = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem 1rem;
  align-items: start;
  border: 1px solid ${(props) => props.$success ? "var(--color-green-100)" : "var(--color-yellow-100)"};
  border-radius: var(--border-radius-sm);
  padding: 1.2rem 1.4rem;
  color: ${(props) => props.$success ? "var(--color-status-success-text)" : "var(--color-status-warning-text)"};
  background: ${(props) => props.$success ? "var(--color-status-success-bg)" : "var(--color-status-warning-bg)"};
  font-size: 1.3rem;
  line-height: 1.55;

  & svg {
    width: 2rem;
    height: 2rem;
  }

  & strong {
    display: block;
    color: inherit;
  }
`;

const PrivacyBox = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem 1rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-grey-100);
  color: var(--color-grey-500);
  font-size: 1.25rem;
  line-height: 1.6;

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }

  & a {
    color: var(--color-brand-700);
    font-weight: 800;
  }
`;

const STATUS_META = {
  new: {
    label: "Talep alındı",
    next: "Ekip hizmet kapsamını ve zaman tercihinizi inceleyecek.",
  },
  contacted: {
    label: "İletişime geçildi",
    next: "Ekip ile görüştüğünüz ayrıntıların teyidini bekleyin.",
  },
  confirmed: {
    label: "Randevu onaylandı",
    next: "Onaylanan zaman için hazırlık yapabilirsiniz. Değişiklik gerekiyorsa aşağıdan istek gönderin.",
  },
  cancelled: {
    label: "İptal tamamlandı",
    next: "Bu talep için başka işlem yapmanız gerekmiyor.",
  },
  completed: {
    label: "Hizmet tamamlandı",
    next: "Deneyiminizle ilgili geri bildiriminizi ekiple paylaşabilirsiniz.",
  },
};

const ACTION_LABELS = {
  cancel_requested: "İptal isteği",
  change_requested: "Değişiklik isteği",
};

const CANCELLATION_REASONS = [
  "Planım değişti",
  "Başka bir usta ile anlaştım",
  "Fiyat/keşif beklentim değişti",
  "Acil durum oluştu",
  "Diğer",
];

const TIME_OPTIONS = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${String(dateValue).slice(0, 10)}T12:00:00`));
}

function formatDateTime(dateValue) {
  if (!dateValue) return "Henüz güncelleme yok";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function CustomerAppointmentManage() {
  const { publicToken } = useParams();
  const queryClient = useQueryClient();
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const responseExpectation = useMemo(() => getResponseExpectation(), []);
  const trackedView = useRef(false);
  const successNoticeRef = useRef(null);
  const [action, setAction] = useState("change_requested");
  const [requestedDate, setRequestedDate] = useState(todayKey);
  const [requestedTime, setRequestedTime] = useState("09:00");
  const [cancellationReason, setCancellationReason] = useState(CANCELLATION_REASONS[0]);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submittedAction, setSubmittedAction] = useState(null);

  const { data: request, isLoading, isError, error } = useQuery({
    queryKey: ["public-appointment-request", publicToken],
    queryFn: () => getPublicAppointmentRequest(publicToken),
    enabled: Boolean(publicToken),
    retry: false,
  });

  useEffect(() => {
    if (!request || trackedView.current) return;
    trackedView.current = true;
    logEvent(ANALYTICS_EVENTS.SELF_SERVICE_TRACKING_VIEWED, {
      operation_id: `tracking-${publicToken}`,
      status: request.status,
    });
  }, [publicToken, request]);

  const { mutate: submitAction, isLoading: isSubmitting, error: submitError } = useMutation({
    mutationFn: submitAppointmentCustomerAction,
    onSuccess: (result, variables) => {
      const isRepeat = request?.customer_action === variables.action;
      setSubmittedAction({
        action: variables.action,
        submittedAt: result?.submitted_at || new Date().toISOString(),
        isRepeat,
      });
      logEvent(ANALYTICS_EVENTS.SELF_SERVICE_ACTION_SUBMITTED, {
        operation_id: `${variables.action}-${result?.submitted_at || Date.now()}`,
        action: variables.action,
        cancellation_reason: variables.cancellationReason || null,
        is_repeat: isRepeat,
      });
      queryClient.invalidateQueries({
        queryKey: ["public-appointment-request", publicToken],
      });
    },
    onError: (mutationError, variables) => {
      logEvent(ANALYTICS_EVENTS.SELF_SERVICE_ACTION_FAILED, {
        action: variables.action,
        reason: mutationError.message,
      });
    },
  });

  useEffect(() => {
    if (submittedAction) successNoticeRef.current?.focus();
  }, [submittedAction]);

  function handleActionChange(nextAction) {
    setAction(nextAction);
    setSubmittedAction(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmittedAction(null);
    submitAction({
      publicToken,
      action,
      note: note.trim(),
      requestedDate: action === "change_requested" ? requestedDate : null,
      requestedTime: action === "change_requested" ? requestedTime : null,
      cancellationReason: action === "cancel_requested" ? cancellationReason : null,
      feedback: feedback.trim(),
    });
  }

  const statusMeta = STATUS_META[request?.status] || {
    label: "Talep inceleniyor",
    next: "Güncel bilgi için ekibin teyidini bekleyin.",
  };
  const sameActionAlreadySubmitted = request?.customer_action === action;
  const canSubmit = request && ["new", "contacted", "confirmed"].includes(request.status) && !isSubmitting;
  const lastUpdatedAt = request?.customer_action_at || request?.updated_at || request?.created_at;

  return (
    <Page>
      <SEO
        title="Talep Takibi ve Yönetimi | Umut Usta"
        description="Umut Usta hizmet talebinizin durumunu takip edin; değişiklik veya iptal isteği gönderin."
        canonicalPath="/appointment"
        noIndex
      />
      <Shell>
        <BackLink to="/appointment">
          <HiOutlineArrowLeft />
          Randevu ekranına dön
        </BackLink>

        <Card aria-labelledby="tracking-title">
          <HeaderRow>
            <div>
              <Heading as="h1" id="tracking-title">Talebinizi takip edin</Heading>
              <MutedText>Durumu kontrol edin veya ekibe değişiklik/iptal isteği iletin.</MutedText>
            </div>
            {request && <StatusBadge>{statusMeta.label}</StatusBadge>}
          </HeaderRow>

          {isLoading && <Spinner />}
          {isError && (
            <Notice role="alert">
              <HiOutlineExclamationTriangle />
              <div><strong>Talep bilgisi açılamadı</strong>{error.message}</div>
            </Notice>
          )}

          {request && (
            <>
              <DetailGrid>
                <DetailItem>
                  <HiOutlineWrenchScrewdriver />
                  <DetailLabel>Hizmet</DetailLabel>
                  <DetailValue>{request.service_type}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <HiOutlineCalendarDays />
                  <DetailLabel>Zaman tercihi</DetailLabel>
                  <DetailValue>{formatDate(request.requested_date)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <HiOutlineClock />
                  <DetailLabel>Saat aralığı</DetailLabel>
                  <DetailValue>{request.requested_time?.slice(0, 5)} - {String(Number(request.requested_time?.slice(0, 2)) + 2).padStart(2, "0")}:00</DetailValue>
                </DetailItem>
              </DetailGrid>

              <NextStep>
                <HiOutlineInformationCircle />
                <strong>Sıradaki adım</strong>
                <MutedText>{statusMeta.next}</MutedText>
              </NextStep>
              <MetaRow>Son güncelleme: {formatDateTime(lastUpdatedAt)}</MetaRow>

              {request.customer_action && (
                <Notice>
                  <HiOutlineChatBubbleLeftRight />
                  <div>
                    <strong>{ACTION_LABELS[request.customer_action]} ekip değerlendirmesinde</strong>
                    {formatDateTime(request.customer_action_at)} tarihinde iletildi. Bu istek otomatik değişiklik veya iptal oluşturmaz.
                  </div>
                </Notice>
              )}
            </>
          )}
        </Card>

        {request && ["new", "contacted", "confirmed"].includes(request.status) && (
          <Card as="form" onSubmit={handleSubmit} aria-labelledby="action-title" noValidate>
            <div>
              <Heading as="h2" id="action-title">Talebinizde işlem isteyin</Heading>
              <MutedText>Seçiminiz ekibe yeni bir değerlendirme isteği gönderir; mevcut randevuyu otomatik değiştirmez.</MutedText>
            </div>

            <ActionTabs role="tablist" aria-label="İşlem türü">
              <TabButton
                type="button"
                role="tab"
                aria-selected={action === "change_requested"}
                $active={action === "change_requested"}
                onClick={() => handleActionChange("change_requested")}>
                Tarih/Saat Değişikliği
              </TabButton>
              <TabButton
                type="button"
                role="tab"
                aria-selected={action === "cancel_requested"}
                $active={action === "cancel_requested"}
                onClick={() => handleActionChange("cancel_requested")}>
                İptal İsteği
              </TabButton>
            </ActionTabs>

            <MutedText>
              {action === "change_requested"
                ? "Yeni zaman tercihiniz uygunluk kontrolünden sonra ekip tarafından teyit edilir."
                : "İptal isteğiniz ekibe iletilir; işlem tamamlandığında size teyit verilir."}
            </MutedText>

            {sameActionAlreadySubmitted && !submittedAction && (
              <Notice>
                <HiOutlineChatBubbleLeftRight />
                <div>
                  <strong>Bu türde daha önce istek gönderdiniz</strong>
                  Son istek {formatDateTime(request.customer_action_at)} tarihinde iletildi. Yeniden gönderirseniz bu formdaki seçim ve not en güncel istek olur; önceki kayıt geçmişte korunur.
                </div>
              </Notice>
            )}

            {submittedAction && (
              <Notice $success role="status" tabIndex="-1" ref={successNoticeRef}>
                <HiOutlineCheckCircle />
                <div>
                  <strong>{submittedAction.isRepeat ? "Güncel isteğiniz alındı" : "İsteğiniz ilk kez alındı"}</strong>
                  {ACTION_LABELS[submittedAction.action]} {formatDateTime(submittedAction.submittedAt)} tarihinde ekibe iletildi. Ekip teyidi olmadan mevcut plan değişmez.
                </div>
              </Notice>
            )}

            {submitError && (
              <Notice role="alert">
                <HiOutlineExclamationTriangle />
                <div><strong>İstek gönderilemedi</strong>{submitError.message} Girdiğiniz bilgiler korundu; yeniden deneyebilirsiniz.</div>
              </Notice>
            )}

            <FormGrid>
              {action === "change_requested" ? (
                <>
                  <Field htmlFor="requestedDate">
                    Tercih ettiğiniz yeni tarih
                    <InputControl id="requestedDate" type="date" min={todayKey} required value={requestedDate} onChange={(event) => setRequestedDate(event.target.value)} />
                  </Field>
                  <Field htmlFor="requestedTime">
                    Tercih ettiğiniz yeni saat
                    <Select id="requestedTime" required value={requestedTime} onChange={(event) => setRequestedTime(event.target.value)}>
                      {TIME_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}
                    </Select>
                  </Field>
                </>
              ) : (
                <Field htmlFor="cancellationReason">
                  İptal nedeni
                  <Select id="cancellationReason" required value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)}>
                    {CANCELLATION_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                  </Select>
                </Field>
              )}

              <Field htmlFor="note">
                Ekibe iletilecek not (isteğe bağlı)
                <Textarea id="note" maxLength={1000} value={note} placeholder="İşlem isteğinizle ilgili gerekli ayrıntıyı yazın." onChange={(event) => setNote(event.target.value)} />
              </Field>

              <Field htmlFor="feedback">
                Deneyim geri bildirimi (isteğe bağlı)
                <Textarea id="feedback" maxLength={1000} value={feedback} placeholder="Hizmet veya randevu deneyiminizle ilgili görüşünüzü paylaşın." onChange={(event) => setFeedback(event.target.value)} />
              </Field>
            </FormGrid>

            <Notice>
              <HiOutlineClock />
              <div><strong>{responseExpectation.title}</strong>{responseExpectation.message}</div>
            </Notice>

            <PrivacyBox>
              <HiOutlineShieldCheck />
              <p>
                Bu sayfa yalnız bağlantıdaki güvenli takip anahtarıyla talebinizi bulur. İşlem türü, not ve geri bildirim ekip tarafından talebinizi yönetmek için kullanılır. <Link to="/privacy">Veri kullanımı açıklaması</Link>
              </p>
            </PrivacyBox>

            <Button type="submit" size="large" variation="cta" disabled={!canSubmit}>
              {isSubmitting ? "İsteğiniz gönderiliyor..." : action === "change_requested" ? "Değişiklik İsteğini Gönder" : "İptal İsteğini Gönder"}
            </Button>
          </Card>
        )}
      </Shell>
    </Page>
  );
}

export default CustomerAppointmentManage;
