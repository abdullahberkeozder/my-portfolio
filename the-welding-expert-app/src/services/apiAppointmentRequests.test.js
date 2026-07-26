import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAppointmentRequest,
  getAppointmentRequests,
  getPublicAppointmentRequest,
  submitAppointmentCustomerAction,
} from "./apiAppointmentRequests";

const { from, query, rpc } = vi.hoisted(() => {
  const queryBuilder = {
    select: vi.fn(),
    is: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };

  Object.values(queryBuilder).forEach((method) => method.mockReturnValue(queryBuilder));

  return {
    from: vi.fn(() => queryBuilder),
    query: queryBuilder,
    rpc: vi.fn(),
  };
});

vi.mock("./supabase", () => ({
  default: { from, rpc },
}));

describe("public appointment RPC client", () => {
  beforeEach(() => rpc.mockReset());

  it("applies an explicit lead-quality filter to admin request queries", async () => {
    query.range.mockResolvedValueOnce({
      data: [{ id: "outside-1", lead_quality: "outside_area" }],
      count: 1,
      error: null,
    });

    await expect(getAppointmentRequests({
      leadQuality: "outside_area",
    })).resolves.toEqual({
      data: [{ id: "outside-1", lead_quality: "outside_area" }],
      count: 1,
    });

    expect(query.eq).toHaveBeenCalledWith("lead_quality", "outside_area");
  });

  it("preserves the id and public token returned by request creation", async () => {
    const result = {
      id: "request-1",
      public_token: "11111111-1111-4111-8111-111111111111",
    };
    rpc.mockResolvedValue({ data: result, error: null });

    await expect(createAppointmentRequest({
      customer_name: "Test Müşteri",
      customer_phone: "05555555555",
      service_type: "Kapı, korkuluk ve kaynak",
      requested_date: "2026-07-24",
      requested_time: "15:00",
      customer_note: "Kapı menteşesi",
    })).resolves.toEqual(result);

    expect(rpc).toHaveBeenCalledWith("create_appointment_request", expect.objectContaining({
      p_notes: "Kapı menteşesi",
    }));
  });

  it("normalizes a table response to one public request", async () => {
    const request = { id: "request-1", status: "new" };
    rpc.mockResolvedValue({ data: [request], error: null });

    await expect(getPublicAppointmentRequest("public-token")).resolves.toEqual(request);
    expect(rpc).toHaveBeenCalledWith("get_public_appointment_request", {
      p_public_token: "public-token",
    });
  });

  it("sends cancellation metadata to the customer action RPC", async () => {
    const result = {
      submitted: true,
      submitted_at: "2026-07-19T12:00:00.000Z",
      action_count: 1,
    };
    rpc.mockResolvedValue({ data: result, error: null });

    await expect(submitAppointmentCustomerAction({
      publicToken: "public-token",
      action: "cancel_requested",
      note: "Program değişti",
      cancellationReason: "Planım değişti",
      feedback: "Hızlı dönüş aldım",
    })).resolves.toEqual(result);

    expect(rpc).toHaveBeenCalledWith("submit_appointment_customer_action", {
      p_public_token: "public-token",
      p_customer_action: "cancel_requested",
      p_customer_action_note: "Program değişti",
      p_customer_requested_date: null,
      p_customer_requested_time: null,
      p_cancellation_reason: "Planım değişti",
      p_customer_feedback: "Hızlı dönüş aldım",
    });
  });
});
