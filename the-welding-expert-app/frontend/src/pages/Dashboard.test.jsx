import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAdminProfile } from "../services/apiAuth";
import { getAppointmentRequests } from "../services/apiAppointmentRequests";
import { getAvailabilityDays } from "../services/apiAvailability";
import Dashboard from "./Dashboard";

vi.mock("../services/apiAuth", () => ({
  getAdminProfile: vi.fn(),
}));

vi.mock("../services/apiAppointmentRequests", () => ({
  getAppointmentRequests: vi.fn(),
}));

vi.mock("../services/apiAvailability", () => ({
  getAvailabilityDays: vi.fn(),
}));

vi.mock("../features/analytics/components/AnalyticsDashboard", () => ({
  default: () => null,
}));

vi.mock("../features/analytics/components/RequestTrendChart", () => ({
  default: () => null,
}));

function isoHoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Dashboard operational KPIs", () => {
  beforeEach(() => {
    getAdminProfile.mockResolvedValue({
      isAuthorized: true,
      profile: { role: "operator" },
    });
    getAvailabilityDays.mockResolvedValue([]);
  });

  it("shows honest partial-data KPIs and applies the service filter to all three", async () => {
    getAppointmentRequests.mockResolvedValue({
      data: [
        {
          id: "qualified-confirmed",
          created_at: isoHoursAgo(26),
          first_contacted_at: isoHoursAgo(24),
          service_type: "Duvar boya ve badana",
          lead_quality: "qualified",
          status: "confirmed",
        },
        {
          id: "qualified-new",
          created_at: isoHoursAgo(20),
          first_contacted_at: null,
          service_type: "Duvar boya ve badana",
          lead_quality: "qualified",
          status: "new",
        },
        {
          id: "outside",
          created_at: isoHoursAgo(10),
          first_contacted_at: isoHoursAgo(9),
          service_type: "Kapı, korkuluk ve kaynak",
          lead_quality: "outside_area",
          status: "contacted",
        },
        {
          id: "untagged",
          created_at: isoHoursAgo(5),
          first_contacted_at: null,
          service_type: "Kapı, korkuluk ve kaynak",
          lead_quality: null,
          status: "new",
        },
      ],
      count: 4,
    });

    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: "Medyan ilk yanıt süresi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1,5 sa")).toBeInTheDocument();
    expect(screen.getByText("%50")).toBeInTheDocument();
    expect(screen.getByText("%33")).toBeInTheDocument();
    expect(screen.getByText(/2 talepte ölçüm eksik/i)).toBeInTheDocument();
    expect(screen.getByText(/1 talep etiketlenmemiş/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Hizmet Türü:"), {
      target: { value: "Duvar boya ve badana" },
    });

    expect(screen.getByText("2 sa")).toBeInTheDocument();
    expect(screen.getByText("%50")).toBeInTheDocument();
    expect(screen.getByText("%0")).toBeInTheDocument();
    expect(screen.getByText(/0 talep etiketlenmemiş/i)).toBeInTheDocument();
  });

  it("does not invent values when operational data is empty", async () => {
    getAppointmentRequests.mockResolvedValue({ data: [], count: 0 });

    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: "Medyan ilk yanıt süresi" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Veri yok")).toHaveLength(3);
    expect(
      screen.getByText("Bu dönemde ilk temas zamanı kaydedilmiş talep yok."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/bu dönemde kalite etiketi atanmış talep yok/i),
    ).toBeInTheDocument();
  });
});
