import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsEvents } from "../../../services/apiAnalytics";

const FunnelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FunnelStep = styled.div`
  padding: 1.6rem;
  border-right: 1px solid var(--color-grey-100);
  position: relative;

  &:last-child {
    border-right: none;
  }

  @media (max-width: 760px) {
    &:nth-child(2),
    &:nth-child(4) {
      border-right: none;
    }
    &:nth-child(1),
    &:nth-child(2) {
      border-bottom: 1px solid var(--color-grey-100);
    }
  }
`;

const StepLabel = styled.p`
  color: var(--color-grey-500);
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
`;

const StepCount = styled.p`
  color: var(--color-grey-900);
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1;
`;

const StepRate = styled.p`
  margin-top: 0.4rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${(props) =>
    props.$rate >= 60
      ? "var(--color-green-700)"
      : props.$rate >= 30
      ? "var(--color-yellow-700)"
      : "var(--color-red-700)"};
`;

const NoDataNotice = styled.p`
  padding: 2.4rem;
  color: var(--color-grey-400);
  font-size: 1.3rem;
  text-align: center;
`;

const ConversionBar = styled.div`
  height: 0.4rem;
  border-radius: 999px;
  background: var(--color-grey-100);
  overflow: hidden;
  margin-top: 0.8rem;
`;

const ConversionFill = styled.div`
  height: 100%;
  border-radius: 999px;
  width: ${(props) => Math.min(100, props.$rate)}%;
  background: ${(props) =>
    props.$rate >= 60
      ? "var(--color-green-500)"
      : props.$rate >= 30
      ? "var(--color-yellow-400)"
      : "var(--color-red-400)"};
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

function calcRate(num, denom) {
  if (!denom) return 0;
  return Math.round((num / denom) * 100);
}

function AnalyticsDashboard() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["analytics-events"],
    queryFn: () => getAnalyticsEvents({ days: 30 }),
    retry: false,
  });

  if (isLoading) {
    return <NoDataNotice>Analitik veriler yükleniyor…</NoDataNotice>;
  }

  // Benzersiz session başına dönüşüm sayımı
  const countByEvent = (name) =>
    new Set(
      events.filter((e) => e.event_name === name).map((e) => e.session_id),
    ).size;

  const started = countByEvent("booking_wizard_started");
  const step1 = countByEvent("booking_step_completed");
  const submitted = countByEvent("booking_submitted");
  const whatsapp = countByEvent("booking_whatsapp_clicked");

  if (started === 0 && whatsapp === 0) {
    return (
      <NoDataNotice>
        Son 30 günde kayıtlı analitik verisi yok. Lütfen migrasyonun Supabase&apos;e
        uygulandığını doğrulayın.
      </NoDataNotice>
    );
  }

  const steps = [
    {
      label: "Sihirbaz açıldı",
      count: started,
      rate: 100,
      id: "wizard_started",
    },
    {
      label: "Adım 1 tamamlandı",
      count: step1,
      rate: calcRate(step1, started),
      id: "step1_completed",
    },
    {
      label: "Form gönderildi",
      count: submitted,
      rate: calcRate(submitted, started),
      id: "submitted",
    },
    {
      label: "WhatsApp tıklandı",
      count: whatsapp,
      rate: calcRate(whatsapp, started),
      id: "whatsapp",
    },
  ];

  return (
    <FunnelGrid>
      {steps.map((step) => (
        <FunnelStep key={step.id}>
          <StepLabel>{step.label}</StepLabel>
          <StepCount>{step.count}</StepCount>
          {step.id !== "wizard_started" && (
            <>
              <ConversionBar>
                <ConversionFill $rate={step.rate} />
              </ConversionBar>
              <StepRate $rate={step.rate}>{step.rate}%</StepRate>
            </>
          )}
        </FunnelStep>
      ))}
    </FunnelGrid>
  );
}

export default AnalyticsDashboard;
