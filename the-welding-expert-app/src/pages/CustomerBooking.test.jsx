import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAvailabilityDays } from "../services/apiAvailability";
import CustomerBooking from "./CustomerBooking";

vi.mock("../services/apiAvailability", () => ({
  getAvailabilityDays: vi.fn(),
}));

vi.mock("../services/apiAppointmentRequests", () => ({
  createAppointmentRequest: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    logger: {
      log: console.log,
      warn: console.warn,
      error: vi.fn(),
    },
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CustomerBooking />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CustomerBooking availability safety", () => {
  beforeEach(() => {
    getAvailabilityDays.mockRejectedValue(
      new Error("Müsaitlik servisine ulaşılamıyor"),
    );
  });

  it("keeps calendar days closed when availability cannot be verified", async () => {
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Randevu takvimi şu an yüklenemiyor",
    );

    const closedDays = screen.getAllByRole("button", {
      name: /seçime kapalı/i,
    });

    expect(closedDays.length).toBeGreaterThan(0);
    closedDays.forEach((day) => expect(day).toBeDisabled());
    expect(
      screen.queryByRole("button", { name: /\d{2}:\d{2} - \d{2}:\d{2}, müsait/i }),
    ).not.toBeInTheDocument();
  });
});
