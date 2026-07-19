import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getPublicAppointmentRequest,
  submitAppointmentCustomerAction,
} from "../services/apiAppointmentRequests";
import CustomerAppointmentManage from "./CustomerAppointmentManage";

vi.mock("../services/apiAppointmentRequests", () => ({
  getPublicAppointmentRequest: vi.fn(),
  submitAppointmentCustomerAction: vi.fn(),
}));

vi.mock("../services/apiAnalytics", () => ({ logEvent: vi.fn() }));

const PUBLIC_TOKEN = "11111111-1111-4111-8111-111111111111";
const baseRequest = {
  service_type: "Kapı, korkuluk ve kaynak",
  requested_date: "2026-07-20",
  requested_time: "15:00:00",
  status: "new",
  customer_action: null,
  created_at: "2026-07-19T10:00:00.000Z",
  updated_at: "2026-07-19T10:00:00.000Z",
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/appointment/track/${PUBLIC_TOKEN}`]}>
        <Routes>
          <Route path="/appointment/track/:publicToken" element={<CustomerAppointmentManage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CustomerAppointmentManage", () => {
  beforeEach(() => {
    getPublicAppointmentRequest.mockResolvedValue(baseRequest);
    submitAppointmentCustomerAction.mockResolvedValue({
      submitted: true,
      submitted_at: "2026-07-19T12:00:00.000Z",
      action_count: 1,
    });
  });

  it("shows status, last update and the next step without exposing a record id", async () => {
    renderPage();

    expect(await screen.findByText("Kapı, korkuluk ve kaynak")).toBeInTheDocument();
    expect(screen.getByText("Talep alındı")).toBeInTheDocument();
    expect(screen.getByText("Sıradaki adım")).toBeInTheDocument();
    expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();
    expect(screen.queryByText(/request-1/)).not.toBeInTheDocument();
  });

  it("submits a first change request without implying automatic approval", async () => {
    renderPage();
    await screen.findByText("Kapı, korkuluk ve kaynak");

    fireEvent.change(screen.getByLabelText("Tercih ettiğiniz yeni tarih"), {
      target: { value: "2026-07-24" },
    });
    fireEvent.change(screen.getByLabelText("Tercih ettiğiniz yeni saat"), {
      target: { value: "17:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Değişiklik İsteğini Gönder" }));

    await waitFor(() => expect(submitAppointmentCustomerAction).toHaveBeenCalledWith({
      publicToken: PUBLIC_TOKEN,
      action: "change_requested",
      note: "",
      requestedDate: "2026-07-24",
      requestedTime: "17:00",
      cancellationReason: null,
      feedback: "",
    }));
    expect(await screen.findByText("İsteğiniz ilk kez alındı")).toBeInTheDocument();
    expect(screen.getByText(/Ekip teyidi olmadan mevcut plan değişmez/)).toBeInTheDocument();
  });

  it("submits cancellation reason separately from feedback", async () => {
    renderPage();
    await screen.findByText("Kapı, korkuluk ve kaynak");

    fireEvent.click(screen.getByRole("tab", { name: "İptal İsteği" }));
    fireEvent.change(screen.getByLabelText("İptal nedeni"), {
      target: { value: "Acil durum oluştu" },
    });
    fireEvent.change(screen.getByLabelText("Deneyim geri bildirimi (isteğe bağlı)"), {
      target: { value: "Planlama süreci açıktı." },
    });
    fireEvent.click(screen.getByRole("button", { name: "İptal İsteğini Gönder" }));

    await waitFor(() => expect(submitAppointmentCustomerAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "cancel_requested",
        cancellationReason: "Acil durum oluştu",
        feedback: "Planlama süreci açıktı.",
      }),
    ));
  });

  it("shows the previous timestamp only for a repeated action type", async () => {
    getPublicAppointmentRequest.mockResolvedValue({
      ...baseRequest,
      customer_action: "cancel_requested",
      customer_action_at: "2026-07-18T12:00:00.000Z",
    });
    renderPage();
    await screen.findByText("Kapı, korkuluk ve kaynak");

    expect(screen.queryByText("Bu türde daha önce istek gönderdiniz")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "İptal İsteği" }));
    expect(screen.getByText("Bu türde daha önce istek gönderdiniz")).toBeInTheDocument();
  });

  it("keeps invalid-token errors inside the tracking page", async () => {
    getPublicAppointmentRequest.mockRejectedValue(new Error("Randevu takip kaydı bulunamadı."));
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Randevu takip kaydı bulunamadı.");
    expect(screen.queryByRole("button", { name: "Değişiklik İsteğini Gönder" })).not.toBeInTheDocument();
  });
});
