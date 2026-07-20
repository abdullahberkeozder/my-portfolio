import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import BookingForm from "./BookingForm";

const logEventMock = vi.fn();

vi.mock("../../../services/apiAnalytics", () => ({
  logEvent: (...args) => logEventMock(...args),
}));

const defaultProps = {
  selectedDay: { fullDate: "20 Temmuz 2026 Pazartesi" },
  selectedSlot: { label: "09:00 - 11:00" },
  selectedService: "Kapı, korkuluk ve kaynak",
  customerName: "",
  customerPhone: "0555 123 45 67",
  customerEmail: "",
  notes: "",
  isLoading: false,
  canSend: true,
  fieldErrors: {},
  submissionError: "",
  rememberDetails: false,
  hasSavedDetails: false,
  onNameChange: vi.fn(),
  onPhoneChange: vi.fn(),
  onEmailChange: vi.fn(),
  onNotesChange: vi.fn(),
  onRememberDetailsChange: vi.fn(),
  onClearSavedDetails: vi.fn(),
  onSystemSubmit: vi.fn((event) => event.preventDefault()),
  onStepChange: vi.fn(),
};

describe("BookingForm", () => {
  it("programmatically associates phone validation with the field", () => {
    render(
      <BookingForm
        {...defaultProps}
        fieldErrors={{ customerPhone: "Geçerli bir telefon numarası girin." }}
      />,
    );

    const phone = screen.getByLabelText(/telefon numarası/i);
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(phone).toHaveAttribute("aria-describedby", expect.stringContaining("customerPhone-error"));
    expect(screen.getByRole("alert")).toHaveTextContent("Talep henüz gönderilmedi");
  });

  it("uses one semantic form submit path", () => {
    const onSystemSubmit = vi.fn((event) => event.preventDefault());
    render(<BookingForm {...defaultProps} onSystemSubmit={onSystemSubmit} />);

    fireEvent.submit(screen.getByRole("form", { name: "İletişim bilgileri" }));
    expect(onSystemSubmit).toHaveBeenCalledTimes(1);
  });

  it("keeps the active input focused when a cleared error has no message", () => {
    const { rerender } = render(<BookingForm {...defaultProps} />);
    const nameInput = screen.getByLabelText(/ad soyad/i);

    nameInput.focus();
    expect(nameInput).toHaveFocus();

    rerender(
      <BookingForm
        {...defaultProps}
        customerName="C"
        fieldErrors={{ customerName: undefined }}
      />,
    );

    expect(nameInput).toHaveFocus();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps optional fields behind a disclosure without losing controlled values", async () => {
    const { rerender } = render(<BookingForm {...defaultProps} />);

    expect(screen.queryByLabelText(/^e-posta/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/işle ilgili not/i)).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: /ek bilgi ekle/i });
    await userEvent.click(toggle);
    expect(screen.getByLabelText(/^e-posta/i)).toBeInTheDocument();

    rerender(
      <BookingForm
        {...defaultProps}
        customerEmail="musteri@example.com"
        notes="Korkuluk ölçüsü paylaşılacak."
      />,
    );
    await userEvent.click(toggle);
    await userEvent.click(toggle);

    expect(screen.getByLabelText(/^e-posta/i)).toHaveValue("musteri@example.com");
    expect(screen.getByPlaceholderText(/balkon korkuluğu/i)).toHaveValue("Korkuluk ölçüsü paylaşılacak.");
    expect(logEventMock).toHaveBeenCalledWith(
      "booking_optional_details_toggled",
      expect.objectContaining({ expanded: true, step: 3 }),
    );
  });

  it("opens optional details automatically when email has a validation error", () => {
    render(
      <BookingForm
        {...defaultProps}
        customerEmail="gecersiz"
        fieldErrors={{ customerEmail: "Geçerli bir e-posta adresi girin veya alanı boş bırakın." }}
      />,
    );

    expect(screen.getByLabelText(/^e-posta/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/geçerli bir e-posta adresi/i)).toBeInTheDocument();
  });
});
