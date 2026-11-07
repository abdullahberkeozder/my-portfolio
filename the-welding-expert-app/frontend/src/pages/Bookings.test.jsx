import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import { getAppointmentRequests, updateAppointmentRequest } from "../services/apiAppointmentRequests";
import Bookings, { RequestItem } from "./Bookings";

vi.mock("../services/springAdmin", () => ({ springAdminEnabled: true }));
vi.mock("../services/apiAuth", () => ({ getAdminProfile: async () => ({ isAuthorized: true }) }));
vi.mock("../services/apiAppointmentRequests", () => ({ getAppointmentRequests: vi.fn(), updateAppointmentRequest: vi.fn(),
  deleteAppointmentRequest: vi.fn(), restoreAppointmentRequest: vi.fn() }));
vi.mock("../services/apiAppointmentAttachments", () => ({ getAppointmentAttachments: async () => [] }));
vi.mock("../features/bookings/components/AppointmentAttachmentGallery", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../services/supabase", () => ({ default: {
  channel: () => { const channel = { on: () => channel, subscribe: () => channel }; return channel; },
  removeChannel: vi.fn(),
} }));
const request = { id: "a", customer_name: "Test Customer", status: "confirmed", requested_date: "2026-10-01", requested_time: "09:00:00" };
beforeEach(() => vi.clearAllMocks());

it("submits a date/time move and disables unsupported status transitions", () => {
  const onUpdate = vi.fn();
  render(<RequestItem request={request} attachments={[]} onUpdate={onUpdate} />);
  fireEvent.change(screen.getByLabelText("Yeni tarih"), { target: { value: "2026-10-02" } });
  fireEvent.change(screen.getByLabelText("Yeni saat"), { target: { value: "11:00" } });
  fireEvent.click(screen.getByRole("button", { name: "Randevuyu taşı" }));
  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: "a", updates: { requested_date: "2026-10-02", requested_time: "11:00" } }));
  const options = within(screen.getByLabelText("Talep durumu")).getAllByRole("option");
  expect(options.find(option => option.value === "completed")).toBeDisabled();
  expect(options.find(option => option.value === "cancelled")).not.toBeDisabled();
});

it.each(["new", "cancelled", "completed"])("does not offer a move for %s", status => {
  render(<RequestItem request={{ ...request, status }} attachments={[]} />);
  expect(screen.queryByRole("button", { name: "Randevuyu taşı" })).not.toBeInTheDocument();
});

it("disables the move while pending and hides it in the archive", () => {
  const { rerender } = render(<RequestItem request={request} attachments={[]} isUpdating />);
  expect(screen.getByRole("button", { name: "Randevuyu taşı" })).toBeDisabled();
  rerender(<RequestItem request={{ ...request, archived_at: "2026-10-01" }} attachments={[]} />);
  expect(screen.queryByLabelText("Yeni tarih")).not.toBeInTheDocument();
});

it.each([true, false])("refreshes requests and availability after a command (conflict=%s)", async conflict => {
  getAppointmentRequests.mockResolvedValue({ data: [request], count: 1 });
  if (conflict) updateAppointmentRequest.mockRejectedValue(Object.assign(new Error("Seçilen saat artık müsait değil."), { status: 409 }));
  else updateAppointmentRequest.mockResolvedValue({ id: "a", status: "confirmed" });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  render(<QueryClientProvider client={client}><MemoryRouter><Bookings /></MemoryRouter></QueryClientProvider>);
  fireEvent.click(await screen.findByRole("button", { name: "Randevuyu taşı" }));
  await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["appointment-availability-days"] }));
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ["appointment-requests"] });
  await waitFor(() => expect(getAppointmentRequests.mock.calls.length).toBeGreaterThan(1));
  if (conflict) { expect(toast.error).toHaveBeenCalledWith("Seçilen saat artık müsait değil."); expect(toast.success).not.toHaveBeenCalled(); }
  else expect(toast.success).toHaveBeenCalledWith("Randevu yeni zamana taşındı.");
});

it("sends the selected page and resets pagination when filters change", async () => {
  getAppointmentRequests.mockResolvedValue({ data: [request], count: 42 });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter><Bookings /></MemoryRouter></QueryClientProvider>);
  fireEvent.click(await screen.findByRole("button", { name: "Sonraki sayfa" }));
  await waitFor(() => expect(getAppointmentRequests).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, pageSize: 20 })));
  fireEvent.change(screen.getByLabelText("Talep kalitesi filtresi"), { target: { value: "untagged" } });
  await waitFor(() => expect(getAppointmentRequests).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, leadQuality: "untagged" })));
  fireEvent.change(screen.getByPlaceholderText("Müşteri adı, tel, e-posta veya notlarda ara..."), { target: { value: "  Ada  " } });
  await waitFor(() => expect(getAppointmentRequests).toHaveBeenLastCalledWith(expect.objectContaining({ search: "Ada", page: 1 })));
});
