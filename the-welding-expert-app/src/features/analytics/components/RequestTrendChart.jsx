import PropTypes from "prop-types";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ChartWrapper = styled.div`
  width: 100%;
  height: 28rem;
`;

const EmptyChart = styled.div`
  height: 28rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-400);
  font-size: 1.4rem;
  border: 1px dashed var(--color-grey-200);
  border-radius: var(--border-radius-sm);
`;

const TR_MONTHS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Pazar
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazartesiye hizala
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function formatWeekLabel(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]}`;
}

/**
 * Son N haftanın talep trendini gösteren çubuk grafik.
 *
 * @param {object[]} requests - appointment_requests dizisi
 * @param {number}   [weeks=8] - Kaç haftayı göster
 */
function RequestTrendChart({ requests, weeks = 8 }) {
  if (!requests || requests.length === 0) {
    return (
      <EmptyChart>
        Yeterli veri yok — Trend grafik için en az 1 randevu talebi gerekli.
      </EmptyChart>
    );
  }

  // Son N haftanın Pazartesi tarihlerini oluştur
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekKeys = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(today);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff - i * 7);
    weekKeys.push(d.toISOString().slice(0, 10));
  }

  // Talepleri haftalara göre grupla
  const grouped = {};
  weekKeys.forEach((key) => {
    grouped[key] = { weekKey: key, new: 0, confirmed: 0, cancelled: 0, completed: 0 };
  });

  requests.forEach((req) => {
    const wk = getWeekKey(req.created_at);
    if (grouped[wk]) {
      const status = req.status || "new";
      if (Object.prototype.hasOwnProperty.call(grouped[wk], status)) {
        grouped[wk][status] += 1;
      }
    }
  });

  const chartData = Object.values(grouped).map((row) => ({
    ...row,
    label: formatWeekLabel(row.weekKey),
  }));

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
          barSize={14}
          barCategoryGap="28%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-grey-100)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-grey-500)", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--color-grey-500)", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-grey-0)",
              border: "1px solid var(--color-grey-100)",
              borderRadius: "8px",
              fontSize: "13px",
              boxShadow: "var(--shadow-sm)",
            }}
            labelStyle={{ fontWeight: 700, color: "var(--color-grey-900)", marginBottom: "4px" }}
            formatter={(value, name) => {
              const labels = {
                new: "Yeni",
                confirmed: "Onaylı",
                cancelled: "İptal",
                completed: "Tamamlanan",
              };
              return [value, labels[name] || name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", fontWeight: 600, paddingTop: "12px" }}
            formatter={(value) => {
              const labels = {
                new: "Yeni",
                confirmed: "Onaylı",
                cancelled: "İptal",
                completed: "Tamamlanan",
              };
              return labels[value] || value;
            }}
          />
          <Bar dataKey="new" fill="#3B82F6" radius={[3, 3, 0, 0]} name="new" />
          <Bar dataKey="confirmed" fill="#22C55E" radius={[3, 3, 0, 0]} name="confirmed" />
          <Bar dataKey="completed" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="completed" />
          <Bar dataKey="cancelled" fill="#EF4444" radius={[3, 3, 0, 0]} name="cancelled" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

RequestTrendChart.propTypes = {
  requests: PropTypes.arrayOf(PropTypes.object).isRequired,
  weeks: PropTypes.number,
};

export default RequestTrendChart;
