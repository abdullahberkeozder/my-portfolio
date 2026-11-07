import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import BookingSuccess from "./BookingSuccess";

vi.mock("../../../services/apiAnalytics", () => ({
  logEvent: vi.fn(),
}));

describe("BookingSuccess", () => {
  it("separates a saved request from an approved appointment", () => {
    render(
      <BookingSuccess
        selectedDay={{ fullDate: "20 Temmuz 2026 Pazartesi" }}
        selectedSlot={{ label: "09:00 - 11:00" }}
        selectedService="Kapı, korkuluk ve kaynak"
        customerPhone="0555 123 45 67"
        bookingId="12345678-abcd"
        publicToken="public-token"
        onReset={vi.fn()}
      />,
    );

    const heading = screen.getByRole("heading", { name: "Talebiniz alındı" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("Uygunluk teyidi bekleniyor")).toBeInTheDocument();
    expect(screen.getByText(/sizi arayacağız veya WhatsApp'tan yazacağız/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Talebi Takip Et" })).toHaveAttribute(
      "href",
      "/appointment/track/public-token",
    );
    expect(heading.closest("[tabindex='-1']")).toHaveFocus();
  });
});
