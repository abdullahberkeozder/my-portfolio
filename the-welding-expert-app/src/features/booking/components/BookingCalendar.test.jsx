import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BookingCalendar from "./BookingCalendar";

const mockWeekDays = [
  {
    dateValue: "2026-07-06",
    dayName: "Pazartesi",
    dateLabel: "6 Tem",
    fullDate: "6 Temmuz Pazartesi",
    status: "available",
    slots: [
      { id: "1", slot_time: "09:00", isAvailable: true, time: "09:00", label: "09:00" },
      { id: "2", slot_time: "11:00", isAvailable: true, time: "11:00", label: "11:00" },
    ],
  },
  {
    dateValue: "2026-07-07",
    dayName: "Salı",
    dateLabel: "7 Tem",
    fullDate: "7 Temmuz Salı",
    status: "closed",
    slots: [],
  },
];

const defaultProps = {
  todayKey: "2026-07-06",
  selectedDate: "2026-07-06",
  selectedSlot: null,
  selectedService: "Kaynak",
  weekStart: new Date("2026-07-06T00:00:00"),
  weekEnd: new Date("2026-07-12T00:00:00"),
  weekStartKey: "2026-07-06",
  weekDays: mockWeekDays,
  selectedDay: mockWeekDays[0],
  selectedDateIsPast: false,
  availableSlots: mockWeekDays[0].slots,
  isLoadingAvailability: false,
  isFetchingAvailability: false,
  availabilityError: false,
  refetchAvailability: vi.fn(),
  quickWhatsappUrl: "https://wa.me/905455199916",
  onDateSelect: vi.fn(),
  onSlotSelect: vi.fn(),
  onWeekChange: vi.fn(),
  onStepChange: vi.fn(),
};

describe("BookingCalendar Component", () => {
  it("renders the week name and days correctly", () => {
    render(<BookingCalendar {...defaultProps} />);

    expect(screen.getAllByText(/pazartesi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/salı/i).length).toBeGreaterThan(0);
  });

  it("calls onDateSelect when an available day is clicked", async () => {
    const onDateSelect = vi.fn();
    render(<BookingCalendar {...defaultProps} onDateSelect={onDateSelect} />);

    const days = screen.getAllByRole("button");
    const mondayButton = days.find((btn) => btn.textContent?.includes("Pazartesi"));
    expect(mondayButton).toBeInTheDocument();

    await userEvent.click(mondayButton);
    expect(onDateSelect).toHaveBeenCalledWith("2026-07-06");
  });

  it("lists slots for the selected day and calls onSlotSelect when clicked", async () => {
    const onSlotSelect = vi.fn();
    render(<BookingCalendar {...defaultProps} onSlotSelect={onSlotSelect} />);

    const slot09 = screen.getByRole("button", { name: /09:00/ });
    expect(slot09).toBeInTheDocument();

    await userEvent.click(slot09);
    expect(onSlotSelect).toHaveBeenCalled();
  });

  it("calls onWeekChange when navigation buttons are clicked", async () => {
    const onWeekChange = vi.fn();
    render(<BookingCalendar {...defaultProps} onWeekChange={onWeekChange} />);

    const nextWeekButton = screen.getByRole("button", { name: /sonraki hafta/i });
    expect(nextWeekButton).toBeInTheDocument();

    await userEvent.click(nextWeekButton);
    expect(onWeekChange).toHaveBeenCalledWith(1);
  });

  it("shows an alert notice when availabilityError is true", () => {
    render(<BookingCalendar {...defaultProps} availabilityError={true} />);

    const errorAlert = screen.getByRole("alert");
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(/yüklenemiyor/i);
  });
});
