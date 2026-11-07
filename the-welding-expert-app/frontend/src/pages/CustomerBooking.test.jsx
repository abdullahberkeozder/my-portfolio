import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAvailabilityDays } from "../services/apiAvailability";
import { logEvent } from "../services/apiAnalytics";
import { createAppointmentRequest } from "../services/apiAppointmentRequests";
import { getGalleryItems } from "../services/apiGallery";
import { getServiceConfigs } from "../services/apiServiceConfigs";
import CustomerBooking from "./CustomerBooking";

vi.mock("../services/apiAvailability", () => ({
  getAvailabilityDays: vi.fn(),
}));

vi.mock("../services/apiAppointmentRequests", () => ({
  createAppointmentRequest: vi.fn(),
}));

vi.mock("../services/apiAnalytics", () => ({
  logEvent: vi.fn(),
}));

vi.mock("../services/apiGallery", () => ({
  getGalleryItems: vi.fn(),
}));

vi.mock("../services/apiServiceConfigs", () => ({
  getServiceConfigs: vi.fn(),
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

function selectPaintingService() {
  fireEvent.click(screen.getByRole("button", { name: /boya ve küçük tadilat/i }));
  fireEvent.click(screen.getByRole("radio", { name: /duvar boya ve badana/i }));
}

describe("CustomerBooking availability safety", () => {
  beforeEach(() => {
    logEvent.mockClear();
    getGalleryItems.mockResolvedValue([]);
    getServiceConfigs.mockResolvedValue([]);
    getAvailabilityDays.mockRejectedValue(
      new Error("Müsaitlik servisine ulaşılamıyor"),
    );
  });

  it("keeps only current and future unverified dates visible and unavailable", async () => {
    renderPage();
    selectPaintingService();

    const nextBtn = screen.getByRole("button", {
      name: /zaman tercihini seç/i,
    });
    fireEvent.click(nextBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Randevu takvimi şu an yüklenemiyor",
    );

    const dateControls = document.querySelectorAll("[data-date-value]");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expect(dateControls.length).toBeGreaterThan(0);
    dateControls.forEach((control) => {
      const controlDate = new Date(`${control.dataset.dateValue}T00:00:00`);
      expect(controlDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
      expect(control).toBeDisabled();
    });
    expect(screen.getAllByText("Bağlantı hatası").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /bu hafta uygun saat yok/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /\d{2}:\d{2} - \d{2}:\d{2}, müsait/i }),
    ).not.toBeInTheDocument();
  });

  it("shows four static service categories with details behind disclosure", () => {
    renderPage();

    const hero = screen.getByRole("banner");

    expect(
      within(hero).getByRole("link", { name: /randevu al/i }),
    ).toHaveAttribute("href", "#appointment-calendar");
    expect(
      within(hero).getByRole("link", { name: /fotoğrafla danış/i }),
    ).toHaveAttribute("href", expect.stringContaining("wa.me"));
    const serviceSection = screen.getByRole("heading", {
      name: "Dört başlıkta hizmet kapsamı",
    }).closest("section");
    const serviceCategories = within(serviceSection).getAllByRole("article");
    expect(serviceCategories).toHaveLength(4);
    expect(within(serviceSection).queryByRole("button")).not.toBeInTheDocument();

    const firstService = within(serviceSection).getByRole("article", {
      name: "Boya ve küçük tadilat",
    });
    expect(within(firstService).getByText("Duvar boya ve badana")).toBeInTheDocument();
    const serviceDetails = within(firstService).getByText(/neler etkiler/i);
    expect(serviceDetails.closest("details")).not.toHaveAttribute("open");
    fireEvent.click(serviceDetails);
    expect(serviceDetails.closest("details")).toHaveAttribute("open");
    expect(within(firstService).getByText(/alan büyüklüğü/i)).toBeInTheDocument();
  });

  it("exposes trust, responsive navigation and measurable phone actions", () => {
    renderPage();

    const trustRegion = screen.getByRole("region", {
      name: "Doğrulanabilir işletme bilgileri",
    });
    expect(within(trustRegion).getByText("Yenimahalle, Ankara")).toBeInTheDocument();
    expect(within(trustRegion).getByText("09:00 - 21:00")).toBeInTheDocument();

    const mobileBottomNav = screen.getByRole("navigation", {
      name: "Alt navigasyon",
    });
    expect(within(mobileBottomNav).getByText("İşler")).toBeInTheDocument();
    expect(within(mobileBottomNav).getByText("Hizmetler")).toBeInTheDocument();
    expect(within(mobileBottomNav).getByText("Hakkında")).toBeInTheDocument();
    expect(within(mobileBottomNav).getByText("İletişim")).toBeInTheDocument();

    const heroWhatsapp = within(screen.getByRole("banner")).getByRole("link", {
      name: "Fotoğrafla Danış",
    });
    heroWhatsapp.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(heroWhatsapp);
    expect(logEvent).toHaveBeenCalledWith("hero_cta_clicked", {
      cta: "whatsapp",
      placement: "hero",
    });

    expect(within(screen.getByRole("banner")).queryByRole("link", {
      name: "Telefonla ara",
    })).not.toBeInTheDocument();

    const navigation = screen.getByRole("navigation", { name: /Müşteri sayfası/i });
    expect(within(navigation).getByRole("img", { name: "Umut Usta" }))
      .toHaveAttribute("data-brand-logo", "compact");
    expect(screen.getByRole("banner").querySelector("[data-brand-logo]"))
      .toBeNull();
    expect(trustRegion.children).toHaveLength(3);

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("navigation", { name: "Alt bilgi bağlantıları" }))
      .toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "İletişim" }))
      .toHaveAttribute("href", "tel:+905455199916");
  });

  it("keeps optional lower-page content progressive and removes inactive contact rows", async () => {
    getGalleryItems.mockResolvedValue([
      {
        id: "work-1",
        title: "Balkon korkuluğu onarımı",
        category: "Kaynak",
        location: "Yenimahalle",
        description: "Sallanan bağlantılar güvenli kullanımı zorlaştırıyordu.",
        image_url: "/images/railing_repair.png",
      },
    ]);
    renderPage();

    expect(await screen.findByText("Sorun")).toBeInTheDocument();
    const trustRegion = screen.getByRole("region", {
      name: "Doğrulanabilir işletme bilgileri",
    });
    expect(within(trustRegion).getByText("Gerçek iş örnekleri")).toBeInTheDocument();
    expect(within(trustRegion).getByText("Uygulama ve sonuçlarıyla")).toBeInTheDocument();
    expect(within(trustRegion).queryByText("1 yayınlanmış iş")).not.toBeInTheDocument();
    expect(within(trustRegion).queryByText("1 tamamlanmış iş")).not.toBeInTheDocument();
    expect(screen.getAllByText("Uygulama").length).toBeGreaterThan(0);
    expect(screen.getByText("Sonuç")).toBeInTheDocument();
    expect(screen.queryByText(/e-posta hizmeti yakında/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle("Umut Usta Atölye Konumu")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Haritayı göster" }));
    expect(screen.getByTitle("Umut Usta Atölye Konumu")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /acil kaynak/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "1 soru daha göster" }));
    expect(screen.getByRole("button", { name: /acil kaynak/i })).toBeInTheDocument();
  });

  it("preserves contact details and returns to time selection when a slot becomes unavailable", async () => {
    const today = new Date();
    const dateKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    getAvailabilityDays.mockResolvedValue([
      {
        id: "day-1",
        work_date: dateKey,
        status: "available",
        note: "Müsait",
        appointment_availability_slots: [
          { id: "slot-1", slot_time: "09:00", is_available: true, note: null },
          { id: "slot-2", slot_time: "11:00", is_available: true, note: null },
        ],
      },
    ]);
    createAppointmentRequest.mockRejectedValue(
      new Error("Seçtiğiniz gün veya saat artık müsait değil. Lütfen başka bir aralık seçin."),
    );

    renderPage();
    selectPaintingService();
    fireEvent.click(screen.getByRole("button", { name: /zaman tercihini seç/i }));

    const dateButton = await screen.findByTestId(`booking-day-${dateKey}`);
    await waitFor(() => expect(dateButton).toBeEnabled());
    fireEvent.click(dateButton);
    fireEvent.click(await screen.findByRole("button", { name: /09:00 - 11:00, müsait/i }));
    fireEvent.click(screen.getByRole("button", { name: /İletişime Geç/i }));

    fireEvent.change(screen.getByLabelText(/ad soyad/i), { target: { value: "Canan Yılmaz" } });
    fireEvent.change(screen.getByLabelText(/telefon numarası/i), { target: { value: "05551234567" } });
    fireEvent.click(screen.getByRole("button", { name: "Talebi Gönder" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("bu sırada doldu");

    fireEvent.click(screen.getByRole("button", { name: /11:00 - 13:00, müsait/i }));
    fireEvent.click(screen.getByRole("button", { name: /İletişime Geç/i }));

    expect(screen.getByLabelText(/ad soyad/i)).toHaveValue("Canan Yılmaz");
    expect(screen.getByLabelText(/telefon numarası/i)).toHaveValue("0555 123 45 67");
    expect(logEvent).toHaveBeenCalledWith("booking_submission_failed", {
      service_type: "Duvar boya ve badana",
      reason: "slot_unavailable",
    });
    expect(logEvent).toHaveBeenCalledWith("booking_wizard_started", {
      source: "service_selection",
    });
    expect(logEvent).toHaveBeenCalledWith("booking_service_changed", {
      service_type: "Duvar boya ve badana",
    });
    expect(logEvent).toHaveBeenCalledWith("booking_step_completed", {
      step: 1,
      service_type: "Duvar boya ve badana",
    });
    expect(logEvent).toHaveBeenCalledWith("booking_step_completed", {
      step: 2,
      service_type: "Duvar boya ve badana",
    });
    expect(logEvent).toHaveBeenCalledWith("booking_slot_selected", {
      slot_time: "09:00",
      service_type: "Duvar boya ve badana",
    });
  });
});
