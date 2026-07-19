import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { logEvent } from "../services/apiAnalytics";
import { getGalleryItems } from "../services/apiGallery";
import Gallery from "./Gallery";

vi.mock("../services/apiGallery", () => ({
  getGalleryItems: vi.fn(),
}));

vi.mock("../services/apiAnalytics", () => ({
  logEvent: vi.fn(),
}));

vi.mock("../hooks/useScrollReveal", () => ({
  default: vi.fn(),
}));

const galleryItems = [
  {
    id: "case-1",
    title: "Bahçe kapısı onarımı",
    category: "Kaynak ve metal",
    location: "Yenimahalle",
    description: "Sarkan kapı yeniden hizalandı ve menteşe bağlantıları güçlendirildi.",
    image_url: "/images/gate-after.png",
    before_image_url: "/images/gate-before.png",
    before_label: "Onarım öncesi",
    after_label: "Onarım sonrası",
    price_tagline: "Keşif sonrası netleşir",
    points: ["Menteşe kontrolü", "Kaynak güçlendirmesi"],
  },
  {
    id: "case-2",
    title: "Salon boya uygulaması",
    category: "Boya ve badana",
    location: "Etimesgut",
    description: "Yüzey hazırlığı sonrası boya uygulandı.",
    image_url: "/images/paint-after.png",
    before_image_url: null,
    points: ["Yüzey hazırlığı"],
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Gallery />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Gallery discovery", () => {
  beforeEach(() => {
    getGalleryItems.mockResolvedValue(galleryItems);
    logEvent.mockClear();
  });

  it("filters published cases by service category", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Kaynak ve metal" }));

    expect(screen.getAllByText("Bahçe kapısı onarımı").length).toBeGreaterThan(0);
    expect(screen.queryByText("Salon boya uygulaması")).not.toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith("gallery_filter_selected", {
      category: "Kaynak ve metal",
    });
  });

  it("opens an accessible case detail, tracks booking intent and restores focus", async () => {
    renderPage();

    const opener = await screen.findByRole("button", { name: "Vaka detayını incele" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Bahçe kapısı onarımı" });
    expect(dialog).toHaveTextContent("Yenimahalle");
    expect(dialog).toHaveTextContent("Sarkan kapı yeniden hizalandı");

    fireEvent.click(screen.getByRole("link", { name: /benzer iş için randevu al/i }));
    expect(logEvent).toHaveBeenCalledWith("gallery_booking_cta_clicked", {
      case_id: "case-1",
      case_title: "Bahçe kapısı onarımı",
      category: "Kaynak ve metal",
      placement: "case_dialog",
    });

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});
