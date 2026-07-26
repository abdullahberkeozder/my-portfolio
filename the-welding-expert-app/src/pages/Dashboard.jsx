import { Fragment, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlinePhoto,
  HiOutlineUserGroup,
  HiOutlineXCircle,
  HiOutlineChartBar,
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
  serviceTypes,
} from "../config/business";
import {
  formatDateKey,
  parseDateKey,
  addDays,
} from "../utils/dateHelpers";
import RequestTrendChart from "../features/analytics/components/RequestTrendChart";
import AnalyticsDashboard from "../features/analytics/components/AnalyticsDashboard";
import {
  buildOperationalKpis,
  splitRequestsByPeriod,
} from "../features/analytics/operationalKpis";


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

function formatResponseTime(hours) {
  if (hours === null) return "Veri yok";
  if (hours < 1) return `${Math.round(hours * 60)} dk`;
  return `${hours.toLocaleString("tr-TR")} sa`;
}

function formatDelta(value, unit, lowerIsBetter = false) {
  if (value === null) return "Önceki dönem verisi yok";
  if (value === 0) return "Önceki dönemle aynı";

  const improved = lowerIsBetter ? value < 0 : value > 0;
  const direction = value > 0 ? "artış" : "azalış";
  return {
    text: `${Math.abs(value).toLocaleString("tr-TR")} ${unit} ${direction}`,
    improved,
  };
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

const FilterToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  padding: 1.6rem 2rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
`;

const ToolbarFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.6rem;
`;

const SelectLabel = styled.label`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-grey-600);
`;

const SelectInput = styled.select`
  min-height: 3.8rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 1.2rem;
  background: var(--color-grey-0);
  color: var(--color-grey-800);
  font-size: 1.35rem;
  font-weight: 600;
  cursor: pointer;

  &:focus {
    outline: 2px solid var(--color-brand-600);
  }
`;

const TargetCard = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.8rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TargetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TargetLabel = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-grey-500);
`;

const TargetValue = styled.strong`
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-brand-700);
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 0.8rem;
  background: var(--color-grey-100);
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background: var(--color-brand-600);
  border-radius: 999px;
  transition: width 0.4s ease-out;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2.4rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PanelValue = styled.strong`
  display: block;
  color: var(--color-grey-0);
  font-size: 1.8rem;
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const OperationalKpiGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.6rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const OperationalKpiCard = styled.article`
  min-width: 0;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  display: grid;
  gap: 1.2rem;
  color: var(--color-grey-800);
  background: var(--color-grey-0);
  box-shadow: var(--shadow-sm);

  &[href]:hover {
    border-color: var(--color-brand-400);
  }
`;

const KpiHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const KpiLabel = styled.h2`
  color: var(--color-grey-600);
  font-size: 1.3rem;
  font-weight: 800;
`;

const KpiIcon = styled.span`
  width: 3.8rem;
  height: 3.8rem;
  border-radius: var(--border-radius-sm);
  display: grid;
  place-items: center;
  color: var(--color-${(props) => props.$color}-700);
  background: var(--color-${(props) => props.$color}-100);

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

const KpiValue = styled.strong`
  color: var(--color-grey-900);
  font-size: 3.2rem;
  line-height: 1;
`;

const KpiContext = styled.p`
  min-height: 3.8rem;
  color: var(--color-grey-600);
  font-size: 1.25rem;
  line-height: 1.5;
`;

const KpiFooter = styled.div`
  border-top: 1px solid var(--color-grey-100);
  padding-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

const KpiTrend = styled.span`
  color: ${(props) =>
    props.$neutral
      ? "var(--color-grey-500)"
      : props.$improved
        ? "var(--color-green-700)"
        : "var(--color-red-700)"};
  font-size: 1.15rem;
  font-weight: 700;
`;

const KpiAction = styled.span`
  color: var(--color-brand-700);
  font-size: 1.15rem;
  font-weight: 800;
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

const StatTrend = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) => (props.$up ? "var(--color-green-700)" : "var(--color-red-700)")};
  background: ${(props) => (props.$up ? "var(--color-green-100)" : "var(--color-red-100)")};
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin-top: 0.4rem;
  width: max-content;
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

const HeatmapGrid = styled.div`
  display: grid;
  grid-template-columns: 8rem repeat(6, minmax(4.8rem, 1fr));
  gap: 0.6rem;
  overflow-x: auto;
`;

const HeatmapCell = styled.div`
  min-height: 4rem;
  border-radius: var(--border-radius-sm);
  display: grid;
  place-items: center;
  color: ${(props) => (props.$level >= 3 ? "#fff" : "var(--color-grey-700)")};
  background: ${(props) => {
    if (props.$header) return "var(--color-grey-100)";
    if (props.$level >= 4) return "var(--color-brand-800)";
    if (props.$level === 3) return "var(--color-brand-600)";
    if (props.$level === 2) return "var(--color-brand-200)";
    if (props.$level === 1) return "var(--color-brand-50)";
    return "var(--color-grey-50)";
  }};
  border: 1px solid var(--color-grey-100);
  font-size: 1.2rem;
  font-weight: 800;
  white-space: nowrap;
`;

function ServiceDistributionPieChart({ requests }) {
  const data = useMemo(() => {
    const counts = {};
    requests.forEach((req) => {
      const type = req.service_type || "Bilinmeyen";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [requests]);

  const COLORS = ["#0d8050", "#2563eb", "#d97706", "#dc2626", "#7c3aed"];

  if (data.length === 0) {
    return (
      <div style={{ height: "28rem", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "var(--color-grey-400)", border: "1px dashed var(--color-grey-200)", borderRadius: "var(--border-radius-sm)", fontSize: "1.4rem" }}>
        Yeterli veri yok
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "28rem" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-grey-0)",
              border: "1px solid var(--color-grey-100)",
              borderRadius: "8px",
              fontSize: "13px",
              boxShadow: "var(--shadow-sm)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ServiceApprovalRateChart({ requests }) {
  const data = useMemo(() => {
    const counts = {};

    requests.forEach((request) => {
      const type = request.service_type || "Bilinmeyen";
      if (!counts[type]) counts[type] = { service: type, total: 0, approved: 0 };
      counts[type].total += 1;
      if (["confirmed", "completed"].includes(request.status)) {
        counts[type].approved += 1;
      }
    });

    return Object.values(counts)
      .filter((item) => item.total > 0)
      .map((item) => ({
        service:
          item.service.length > 18 ? `${item.service.slice(0, 18)}...` : item.service,
        approvalRate: Math.round((item.approved / item.total) * 100),
        total: item.total,
      }))
      .sort((a, b) => b.approvalRate - a.approvalRate)
      .slice(0, 8);
  }, [requests]);

  if (data.length === 0) {
    return (
      <EmptyState>
        Hizmet onay oranı için yeterli randevu verisi yok.
      </EmptyState>
    );
  }

  return (
    <div style={{ width: "100%", height: "30rem" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <YAxis type="category" dataKey="service" width={132} />
          <Tooltip
            formatter={(value, name, item) => [
              `${value}% (${item.payload.total} talep)`,
              "Onay oranı",
            ]}
            contentStyle={{
              background: "var(--color-grey-0)",
              border: "1px solid var(--color-grey-100)",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="approvalRate" fill="var(--color-brand-600)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RequestHeatmap({ requests }) {
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const slots = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

  const matrix = useMemo(() => {
    const values = new Map();

    requests.forEach((request) => {
      if (!request.requested_date || !request.requested_time) return;
      const date = parseDateKey(request.requested_date);
      const dayIndex = (date.getDay() + 6) % 7;
      const time = request.requested_time.slice(0, 5);
      const key = `${dayIndex}-${time}`;
      values.set(key, (values.get(key) || 0) + 1);
    });

    return values;
  }, [requests]);

  const maxValue = Math.max(0, ...matrix.values());
  const getLevel = (value) => {
    if (!value || !maxValue) return 0;
    return Math.max(1, Math.ceil((value / maxValue) * 4));
  };

  return (
    <HeatmapGrid>
      <HeatmapCell $header />
      {slots.map((slot) => (
        <HeatmapCell key={slot} $header>
          {slot}
        </HeatmapCell>
      ))}
      {days.map((day, dayIndex) => (
        <Fragment key={day}>
          <HeatmapCell key={`${day}-label`} $header>
            {day}
          </HeatmapCell>
          {slots.map((slot) => {
            const value = matrix.get(`${dayIndex}-${slot}`) || 0;
            return (
              <HeatmapCell key={`${day}-${slot}`} $level={getLevel(value)}>
                {value}
              </HeatmapCell>
            );
          })}
        </Fragment>
      ))}
    </HeatmapGrid>
  );
}

function Dashboard() {
  const [daysRange, setDaysRange] = useState(30);
  const [serviceFilter, setServiceFilter] = useState("all");
  const reportingNow = useMemo(() => new Date(), []);

  const { data: admin } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    retry: false,
  });
  const canManageOperations = ROUTE_ROLES.bookings.includes(
    admin?.profile?.role,
  );
  const today = new Date(reportingNow);
  today.setHours(0, 0, 0, 0);
  const endDate = addDays(today, 6);
  const todayKey = formatDateKey(today);
  const endDateKey = formatDateKey(endDate);
  
  const sinceDate = new Date(reportingNow);
  sinceDate.setDate(sinceDate.getDate() - daysRange * 2);
  sinceDate.setHours(0, 0, 0, 0);
  const sinceDateISO = sinceDate.toISOString();

  const requestsQuery = useQuery({
    queryKey: ["appointment-requests", "dashboard", daysRange],
    queryFn: () => getAppointmentRequests({ fetchAll: true, createdAfter: sinceDateISO }),
    refetchInterval: 30000,
    select: (result) => result.data,
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

  const serviceRequests = useMemo(() => {
    const rawRequests = requestsQuery.data || [];
    if (serviceFilter === "all") return rawRequests;
    return rawRequests.filter(r => r.service_type === serviceFilter);
  }, [requestsQuery.data, serviceFilter]);

  const periodRequests = useMemo(
    () => splitRequestsByPeriod(serviceRequests, {
      now: reportingNow,
      days: daysRange,
    }),
    [daysRange, reportingNow, serviceRequests],
  );
  const requests = periodRequests.current;
  const operationalKpis = useMemo(
    () => buildOperationalKpis(requests, periodRequests.previous),
    [periodRequests.previous, requests],
  );
  const responseTrend = formatDelta(
    operationalKpis.responseTime.delta,
    "saat",
    true,
  );
  const confirmationTrend = formatDelta(
    operationalKpis.confirmation.delta,
    "puan",
  );
  const outsideAreaTrend = formatDelta(
    operationalKpis.outsideArea.delta,
    "puan",
    true,
  );

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

  // Cleaned up rawRequests and useMemo hooks here
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
  const cancelledCount = requests.filter(
    (r) => r.status === "cancelled",
  ).length;
  const completedCount = requests.filter(
    (r) => r.status === "completed",
  ).length;
  // Removed unused customerCount
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
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const newThisWeek = requests.filter(
    (r) => r.status === "new" && r.created_at >= sevenDaysAgo.toISOString()
  ).length;
  const newPrevWeek = requests.filter(
    (r) => r.status === "new" && r.created_at >= fourteenDaysAgo.toISOString() && r.created_at < sevenDaysAgo.toISOString()
  ).length;
  const newRequestsDiff = newThisWeek - newPrevWeek;
  const newRequestsTrendPct = newPrevWeek > 0 ? Math.round((newRequestsDiff / newPrevWeek) * 100) : null;

  const confirmedThisWeekCount = requests.filter(
    (r) => r.status === "confirmed" && r.created_at >= sevenDaysAgo.toISOString()
  ).length;
  const confirmedPrevWeekCount = requests.filter(
    (r) => r.status === "confirmed" && r.created_at >= fourteenDaysAgo.toISOString() && r.created_at < sevenDaysAgo.toISOString()
  ).length;
  const confirmedDiff = confirmedThisWeekCount - confirmedPrevWeekCount;
  const confirmedTrendPct = confirmedPrevWeekCount > 0 ? Math.round((confirmedDiff / confirmedPrevWeekCount) * 100) : null;

  const cancelledThisWeek = requests.filter(
    (r) => r.status === "cancelled" && r.created_at >= sevenDaysAgo.toISOString()
  ).length;
  const cancelledPrevWeek = requests.filter(
    (r) => r.status === "cancelled" && r.created_at >= fourteenDaysAgo.toISOString() && r.created_at < sevenDaysAgo.toISOString()
  ).length;
  const cancelledDiff = cancelledThisWeek - cancelledPrevWeek;
  const cancelledTrendPct = cancelledPrevWeek > 0 ? Math.round((cancelledDiff / cancelledPrevWeek) * 100) : null;

  const recentRequests = requests
    .filter((r) => r.status === "new")
    .slice(0, 5);

  const lastUpdated = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

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
              <PanelLabel>Öncelikli geri dönüşler</PanelLabel>
              <PanelValue>{newRequestCount} yeni talep</PanelValue>
            </div>
          </HeroPanelItem>
        </HeroPanel>
      </Hero>

      <FilterToolbar>
        <ToolbarFilters>
          <div>
            <SelectLabel htmlFor="days-range-select">Zaman Aralığı: </SelectLabel>
            <SelectInput
              id="days-range-select"
              value={daysRange}
              onChange={(e) => setDaysRange(Number(e.target.value))}
            >
              <option value={7}>Son 7 Gün</option>
              <option value={30}>Son 30 Gün</option>
              <option value={90}>Son 90 Gün</option>
            </SelectInput>
          </div>

          <div>
            <SelectLabel htmlFor="service-type-select">Hizmet Türü: </SelectLabel>
            <SelectInput
              id="service-type-select"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">Tüm Hizmetler</option>
              {serviceTypes && serviceTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </SelectInput>
          </div>
        </ToolbarFilters>

        <MutedText style={{ fontSize: "1.25rem", fontWeight: "700" }}>
          Son Güncelleme: {lastUpdated}
        </MutedText>
      </FilterToolbar>

      <OperationalKpiGrid aria-label="Operasyonel performans göstergeleri">
        <OperationalKpiCard
          {...(canManageOperations
            ? { as: Link, to: "/admin/bookings?status=new" }
            : {})}>
          <KpiHeader>
            <KpiLabel>Medyan ilk yanıt süresi</KpiLabel>
            <KpiIcon $color="indigo"><HiOutlineClock /></KpiIcon>
          </KpiHeader>
          <KpiValue>
            {formatResponseTime(operationalKpis.responseTime.medianHours)}
          </KpiValue>
          <KpiContext>
            {operationalKpis.responseTime.sampleSize > 0
              ? `Ortalama ${formatResponseTime(operationalKpis.responseTime.averageHours)} · ${operationalKpis.responseTime.sampleSize} ölçümlü talep`
              : "Bu dönemde ilk temas zamanı kaydedilmiş talep yok."}
            {operationalKpis.responseTime.missingCount > 0 &&
              ` ${operationalKpis.responseTime.missingCount} talepte ölçüm eksik.`}
          </KpiContext>
          <KpiFooter>
            <KpiTrend
              $neutral={typeof responseTrend === "string"}
              $improved={responseTrend.improved}>
              {responseTrend.text || responseTrend}
            </KpiTrend>
            {canManageOperations && <KpiAction>Yanıt bekleyenler</KpiAction>}
          </KpiFooter>
        </OperationalKpiCard>

        <OperationalKpiCard>
          <KpiHeader>
            <KpiLabel>Nitelikli talep teyit oranı</KpiLabel>
            <KpiIcon $color="green"><HiOutlineCheckCircle /></KpiIcon>
          </KpiHeader>
          <KpiValue>
            {operationalKpis.confirmation.rate === null
              ? "Veri yok"
              : `%${operationalKpis.confirmation.rate}`}
          </KpiValue>
          <KpiContext>
            {operationalKpis.confirmation.qualifiedCount > 0
              ? `${operationalKpis.confirmation.confirmedCount} / ${operationalKpis.confirmation.qualifiedCount} nitelikli talep onaylandı veya tamamlandı.`
              : "Bu dönemde nitelikli olarak etiketlenmiş talep yok."}
          </KpiContext>
          <KpiFooter>
            <KpiTrend
              $neutral={typeof confirmationTrend === "string"}
              $improved={confirmationTrend.improved}>
              {confirmationTrend.text || confirmationTrend}
            </KpiTrend>
            <KpiAction>Payda: nitelikli talepler</KpiAction>
          </KpiFooter>
        </OperationalKpiCard>

        <OperationalKpiCard
          {...(canManageOperations
            ? {
              as: Link,
              to: "/admin/bookings?lead_quality=outside_area",
            }
            : {})}>
          <KpiHeader>
            <KpiLabel>Hizmet bölgesi dışı oranı</KpiLabel>
            <KpiIcon $color="red"><HiOutlineMapPin /></KpiIcon>
          </KpiHeader>
          <KpiValue>
            {operationalKpis.outsideArea.rate === null
              ? "Veri yok"
              : `%${operationalKpis.outsideArea.rate}`}
          </KpiValue>
          <KpiContext>
            {operationalKpis.outsideArea.taggedCount > 0
              ? `${operationalKpis.outsideArea.outsideAreaCount} / ${operationalKpis.outsideArea.taggedCount} etiketli talep bölge dışında.`
              : "Bu dönemde kalite etiketi atanmış talep yok."}
            {` ${operationalKpis.outsideArea.untaggedCount} talep etiketlenmemiş.`}
          </KpiContext>
          <KpiFooter>
            <KpiTrend
              $neutral={typeof outsideAreaTrend === "string"}
              $improved={outsideAreaTrend.improved}>
              {outsideAreaTrend.text || outsideAreaTrend}
            </KpiTrend>
            {canManageOperations && <KpiAction>Filtreli listeyi aç</KpiAction>}
          </KpiFooter>
        </OperationalKpiCard>
      </OperationalKpiGrid>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="green">
            <HiOutlineCheckCircle />
          </StatIcon>
          <div>
            <StatLabel>Açık zaman aralığı</StatLabel>
            <StatValue>{openSlotCount}</StatValue>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="blue">
            <HiOutlineCalendarDays />
          </StatIcon>
          <div>
            <StatLabel>Bu hafta onaylanan iş</StatLabel>
            <StatValue>{confirmedThisWeek}</StatValue>
            {confirmedTrendPct !== null && (
              <StatTrend $up={confirmedDiff >= 0}>
                {confirmedDiff >= 0 ? "↑" : "↓"} {Math.abs(confirmedTrendPct)}%
              </StatTrend>
            )}
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="yellow">
            <HiOutlineClock />
          </StatIcon>
          <div>
            <StatLabel>Yanıt bekleyen yeni talep</StatLabel>
            <StatValue>{newRequestCount}</StatValue>
            {newRequestsTrendPct !== null && (
              <StatTrend $up={newRequestsDiff >= 0}>
                {newRequestsDiff >= 0 ? "↑" : "↓"} {Math.abs(newRequestsTrendPct)}%
              </StatTrend>
            )}
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="red">
            <HiOutlineXCircle />
          </StatIcon>
          <div>
            <StatLabel>İptal edilen</StatLabel>
            <StatValue>{cancelledCount}</StatValue>
            {cancelledTrendPct !== null && (
              <StatTrend $up={cancelledDiff <= 0}>
                {cancelledDiff <= 0 ? "↓" : "↑"} {Math.abs(cancelledTrendPct)}%
              </StatTrend>
            )}
          </div>
        </StatCard>
        <StatCard>
          <StatIcon $color="purple">
            <HiOutlineChartBar />
          </StatIcon>
          <div>
            <StatLabel>Tamamlanan</StatLabel>
            <StatValue>{completedCount}</StatValue>
          </div>
        </StatCard>
      </StatsGrid>

      <TargetCard>
        <TargetHeader>
          <TargetLabel>Haftalık Onaylı İş Hedefi</TargetLabel>
          <TargetValue>{confirmedThisWeek} / 15 onaylı iş</TargetValue>
        </TargetHeader>
        <ProgressBarContainer>
          <ProgressBarFill $percentage={Math.min(100, (confirmedThisWeek / 15) * 100)} />
        </ProgressBarContainer>
      </TargetCard>

      <Section>
        <SectionHeader>
          <div>
            <Heading as="h2">Önümüzdeki 7 günün müsaitliği</Heading>
            <MutedText>
              Müşterinin seçebildiği açık ve kapalı zaman aralıkları. Değişiklikler randevu ekranına yansır.
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

      <ChartsGrid>
        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Son 8 haftanın talep trendi</Heading>
              <MutedText>
                Sistem kaydı olan taleplerin haftalık durumu: yeni, onaylanan, tamamlanan ve iptal edilen.
              </MutedText>
            </div>
          </SectionHeader>
          <RequestTrendChart requests={requests} weeks={8} />
        </Section>

        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Hizmet dağılımı</Heading>
              <MutedText>
                Sistem üzerinden kaydedilen taleplerin hizmet türlerine göre dağılımı.
              </MutedText>
            </div>
          </SectionHeader>
          <ServiceDistributionPieChart requests={requests} />
        </Section>
      </ChartsGrid>

      <ChartsGrid>
        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Hizmet türüne göre onay oranı</Heading>
              <MutedText>
                Her hizmette onaylanan veya tamamlanan işlerin, sistemdeki toplam talebe oranı.
              </MutedText>
            </div>
          </SectionHeader>
          <ServiceApprovalRateChart requests={requests} />
        </Section>

        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Gün/saat yoğunluk haritası</Heading>
              <MutedText>
                Müşterilerin seçtiği zaman tercihlerinin gün ve saat dağılımı; ekip planlaması için kullanılır.
              </MutedText>
            </div>
          </SectionHeader>
          <RequestHeatmap requests={requests} />
        </Section>
      </ChartsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <div>
          <Heading as="h2">Öncelikli geri dönüş listesi</Heading>
              <MutedText>
                Henüz müşteriyle iletişim kurulmamış sistem talepleri — güncelleme: {lastUpdated}
              </MutedText>
            </div>
          </SectionHeader>

          {recentRequests.length === 0 ? (
            <EmptyState>Şu anda ilk geri dönüş bekleyen sistem talebi yok.</EmptyState>
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

      {ROUTE_ROLES.analytics.includes(admin?.profile?.role) && (
        <Section>
          <SectionHeader>
            <div>
              <Heading as="h2">Dönüşüm hunisi — Son 30 gün</Heading>
              <MutedText>
                Web üzerindeki adımları tamamlayan oturumların oranı. WhatsApp&apos;taki sonraki görüşmeler ve telefon talepleri bu veriye otomatik dahil değildir.
              </MutedText>
            </div>
          </SectionHeader>
          <AnalyticsDashboard />
        </Section>
      )}
    </Page>
  );
}

export default Dashboard;
