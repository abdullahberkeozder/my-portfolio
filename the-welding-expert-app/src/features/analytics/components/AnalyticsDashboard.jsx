import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAnalyticsEvents, getAppointmentFunnelData } from "../../../services/apiAnalytics";
import {
  buildChannelConversionData,
  buildCancellationReasonData,
  buildGalleryContributionData,
  buildHeroChannelData,
  buildJourneyTimingData,
  buildOperationalFunnelData,
  calcRate,
  countUniqueSessions,
} from "../analyticsMetrics";

const FunnelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1.2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FunnelStep = styled.div`
  padding: 1.6rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-0);
  position: relative;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 12rem;
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
    props.$insufficient
      ? "var(--color-grey-600)"
      : props.$rate >= 60
      ? "var(--color-green-700)"
      : props.$rate >= 30
      ? "var(--color-yellow-700)"
      : "var(--color-red-700)"};
`;

const NoDataNotice = styled.p`
  padding: 2.4rem;
  color: var(--color-grey-500);
  font-size: 1.3rem;
  text-align: center;
`;

const DashboardStack = styled.div`
  display: grid;
  gap: 2rem;
`;

const ChartPanel = styled.div`
  min-height: 28rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  background: var(--color-grey-0);
`;

const ChartTitle = styled.p`
  color: var(--color-grey-800);
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
`;

const ChartDescription = styled.p`
  margin: -0.6rem 0 1.2rem;
  color: var(--color-grey-500);
  font-size: 1.2rem;
  line-height: 1.5;
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
      ? "var(--color-green-700)"
      : props.$rate >= 30
      ? "var(--color-yellow-700)"
      : "var(--color-red-700)"};
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

function AnalyticsDashboard() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["analytics-events"],
    queryFn: () => getAnalyticsEvents({ days: 30 }),
    retry: false,
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["appointment-funnel", 30],
    queryFn: () => getAppointmentFunnelData({ days: 30 }),
    retry: false,
  });

  if (isLoading || requestsLoading) {
    return <NoDataNotice>Analitik veriler yükleniyor…</NoDataNotice>;
  }

  // Benzersiz session başına dönüşüm sayımı
  const countByEvent = (name) => countUniqueSessions(events, name);

  const visitors = countByEvent("public_page_viewed");
  const started = countByEvent("booking_wizard_started");
  const serviceChanged = countByEvent("booking_service_changed");
  const slotSelected = countByEvent("booking_slot_selected");
  const contactReached = countUniqueSessions(
    events,
    "booking_step_completed",
    (event) => event.properties?.step === 2,
  );
  const dateShortcuts = countByEvent("booking_date_shortcut_selected");
  const fullCalendarOpened = countByEvent("booking_full_calendar_opened");
  const optionalDetailsOpened = countUniqueSessions(
    events,
    "booking_optional_details_toggled",
    (event) => event.properties?.expanded === true,
  );
  const groupBack = countByEvent("booking_service_group_back_clicked");
  const submitted = countByEvent("booking_submitted");
  const whatsapp = countByEvent("booking_whatsapp_clicked");
  const catalogExpanded = countByEvent("service_catalog_expanded");
  const galleryViewed = countByEvent("gallery_case_viewed");
  const galleryBookingClicked = countByEvent("gallery_booking_cta_clicked");
  const trackingViewed = countByEvent("self_service_tracking_viewed");
  const selfServiceChanged = countUniqueSessions(
    events,
    "self_service_action_submitted",
    (event) => event.properties?.action === "change_requested",
  );
  const selfServiceCancelled = countUniqueSessions(
    events,
    "self_service_action_submitted",
    (event) => event.properties?.action === "cancel_requested",
  );

  if (visitors === 0 && started === 0 && whatsapp === 0 && galleryViewed === 0 && requests.length === 0) {
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
      label: "Hizmet seçildi",
      count: serviceChanged,
      rate: calcRate(serviceChanged, started),
      id: "service_changed",
    },
    {
      label: "Zaman tercihi seçildi",
      count: slotSelected,
      rate: calcRate(slotSelected, started),
      id: "slot_selected",
    },
    {
      label: "İletişim bilgileri adımına geçildi",
      count: contactReached,
      rate: calcRate(contactReached, started),
      id: "step1_completed",
    },
    {
      label: "Sistem talebi gönderildi",
      count: submitted,
      rate: calcRate(submitted, started),
      id: "submitted",
    },
    {
      label: "WhatsApp ile iletişim başlatıldı",
      count: whatsapp,
      rate: calcRate(whatsapp, started),
      id: "whatsapp",
    },
  ];

  const channelData = buildChannelConversionData(events, started);
  const heroChannelData = buildHeroChannelData(events, visitors || started);
  const galleryContributionData = buildGalleryContributionData(events);
  const cancellationReasonData = buildCancellationReasonData(events);
  const operationalFunnel = buildOperationalFunnelData(requests);
  const journeyTimingData = buildJourneyTimingData(events);

  return (
    <DashboardStack>
      {requests.length > 0 && (
        <>
          <FunnelGrid aria-label="Kapalı talep hunisi">
            <FunnelStep><StepLabel>Toplam talep</StepLabel><StepCount>{operationalFunnel.summary.requests}</StepCount></FunnelStep>
            <FunnelStep><StepLabel>Nitelikli talep</StepLabel><StepCount>{operationalFunnel.summary.qualified}</StepCount><StepRate $rate={operationalFunnel.summary.qualifiedRate}>{operationalFunnel.summary.qualifiedRate}%</StepRate></FunnelStep>
            <FunnelStep><StepLabel>Onaylanan</StepLabel><StepCount>{operationalFunnel.summary.confirmed}</StepCount><StepRate $rate={operationalFunnel.summary.confirmationRate}>{operationalFunnel.summary.confirmationRate}%</StepRate></FunnelStep>
            <FunnelStep><StepLabel>Tamamlanan iş</StepLabel><StepCount>{operationalFunnel.summary.completed}</StepCount><StepRate $rate={operationalFunnel.summary.completionRate}>{operationalFunnel.summary.completionRate}%</StepRate></FunnelStep>
          </FunnelGrid>

          <ChartPanel>
            <ChartTitle>Kanal → talep → onay → tamamlanan iş</ChartTitle>
            <ChartDescription>WhatsApp verisi yalnız sistemde talep kaydı oluşturulduysa hunide görünür; iletişim tıklaması satış olarak sayılmaz.</ChartDescription>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={operationalFunnel.byChannel}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="requests" name="Talep" fill="var(--color-grey-400)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qualified" name="Nitelikli" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="confirmed" name="Onaylanan" fill="var(--color-green-700)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Tamamlanan" fill="var(--color-grey-700)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel>
            <ChartTitle>Hizmet bazında nitelikli talep oranı</ChartTitle>
            <ResponsiveContainer width="100%" height={Math.max(260, operationalFunnel.byService.length * 44)}>
              <BarChart data={operationalFunnel.byService} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="label" width={170} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name, item) => [`${value}% (${item.payload.qualified}/${item.payload.requests})`, "Nitelikli talep oranı"]} />
                <Bar dataKey="qualifiedRate" fill="var(--color-brand-600)" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </>
      )}

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

      <FunnelGrid aria-label="Hizmet ve vaka keşfi özeti">
        <FunnelStep>
          <StepLabel>Hizmet kataloğu genişletildi</StepLabel>
          <StepCount>{catalogExpanded}</StepCount>
        </FunnelStep>
        <FunnelStep>
          <StepLabel>Vaka ayrıntısı incelendi</StepLabel>
          <StepCount>{galleryViewed}</StepCount>
        </FunnelStep>
        <FunnelStep>
          <StepLabel>Vakadan randevuya geçildi</StepLabel>
          <StepCount>{galleryBookingClicked}</StepCount>
          <ConversionBar>
            <ConversionFill $rate={calcRate(galleryBookingClicked, galleryViewed)} />
          </ConversionBar>
          <StepRate $rate={calcRate(galleryBookingClicked, galleryViewed)}>
            {calcRate(galleryBookingClicked, galleryViewed)}%
          </StepRate>
        </FunnelStep>
      </FunnelGrid>

      <FunnelGrid aria-label="Bilişsel akış etkileşimleri">
        <FunnelStep><StepLabel>Hızlı tarih kullanıldı</StepLabel><StepCount>{dateShortcuts}</StepCount></FunnelStep>
        <FunnelStep><StepLabel>Tam takvim açıldı</StepLabel><StepCount>{fullCalendarOpened}</StepCount></FunnelStep>
        <FunnelStep><StepLabel>Ek bilgi açıldı</StepLabel><StepCount>{optionalDetailsOpened}</StepCount></FunnelStep>
        <FunnelStep><StepLabel>İş türüne geri dönüldü</StepLabel><StepCount>{groupBack}</StepCount></FunnelStep>
      </FunnelGrid>

      <ChartPanel>
        <ChartTitle>Görev süreleri</ChartTitle>
        <ChartDescription>Medyan ve P75 saniye cinsindedir. Beşten az tamamlanmış oturum karar vermek için yetersiz veri olarak işaretlenir.</ChartDescription>
        <FunnelGrid>
          {journeyTimingData.map((item) => (
            <FunnelStep key={item.label}>
              <StepLabel>{item.label}</StepLabel>
              <StepCount>{item.sufficientData ? `${item.medianSeconds} sn` : "Yetersiz veri"}</StepCount>
              <StepRate $rate={60} $insufficient={!item.sufficientData}>
                n={item.sampleSize} · P75 {item.p75Seconds} sn
              </StepRate>
            </FunnelStep>
          ))}
        </FunnelGrid>
      </ChartPanel>

      <FunnelGrid aria-label="Self-servis talep özeti">
        <FunnelStep>
          <StepLabel>Takip ekranı görüntülendi</StepLabel>
          <StepCount>{trackingViewed}</StepCount>
        </FunnelStep>
        <FunnelStep>
          <StepLabel>Değişiklik isteği</StepLabel>
          <StepCount>{selfServiceChanged}</StepCount>
        </FunnelStep>
        <FunnelStep>
          <StepLabel>İptal isteği</StepLabel>
          <StepCount>{selfServiceCancelled}</StepCount>
        </FunnelStep>
      </FunnelGrid>

      <ChartPanel>
        <ChartTitle>Kanal bazlı ilk dönüşüm</ChartTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={channelData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="channel" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip
              formatter={(value, name, item) => [
                `${value}% (${item.payload.count} oturum)`,
                "Dönüşüm",
              ]}
              contentStyle={{
                background: "var(--color-grey-0)",
                border: "1px solid var(--color-grey-100)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="rate" fill="var(--color-brand-600)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel>
        <ChartTitle>Hero kanal tercihi</ChartTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={heroChannelData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="channel" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip
              formatter={(value, name, item) => [
                `${value}% (${item.payload.count} oturum)`,
                "Sayfa ziyaretinden kanal seçimine",
              ]}
              contentStyle={{
                background: "var(--color-grey-0)",
                border: "1px solid var(--color-grey-100)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="rate" fill="var(--color-brand-600)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      {galleryContributionData.length > 0 && (
        <ChartPanel>
          <ChartTitle>Vaka bazlı randevu katkısı</ChartTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={galleryContributionData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="caseName" width={140} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  `${value} oturum`,
                  name === "views" ? "Vaka görüntüleme" : "Randevu tıklaması",
                ]}
                contentStyle={{
                  background: "var(--color-grey-0)",
                  border: "1px solid var(--color-grey-100)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="views" fill="var(--color-grey-400)" radius={[0, 5, 5, 0]} />
              <Bar dataKey="bookingClicks" fill="var(--color-brand-600)" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}

      {cancellationReasonData.length > 0 && (
        <ChartPanel>
          <ChartTitle>İptal isteği nedenleri</ChartTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cancellationReasonData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="reason" width={160} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value} istek`, "İptal nedeni"]} />
              <Bar dataKey="count" fill="var(--color-brand-600)" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}
    </DashboardStack>
  );
}

export default AnalyticsDashboard;
