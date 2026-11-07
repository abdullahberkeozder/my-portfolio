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
  {
    id: "case-3",
    title: "Mutfak küçük tadilatı",
    category: "İnşaat ve tadilat",
    location: "Çankaya",
    description: "Hasarlı yüzey onarıldı ve kullanıma hazır teslim edildi.",
    image_url: "/images/renovation-after.png",
    before_image_url: null,
    points: ["Yüzey onarımı"],
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

  it("filters cases through main groups and contextual subcategories", async () => {
    renderPage();

    expect(await screen.findByText("Adresinizde hizmet")).toBeInTheDocument();
    expect(
      screen.getByText("Ankara'da yerinde keşif ve uygulama"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Atölyede üretim"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Özel ölçü imalat ve kontrollü onarım"),
    ).toBeInTheDocument();
    expect(screen.queryByText("2 saatlik dilim")).not.toBeInTheDocument();
    expect(screen.queryByText("09-21")).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Boya ve badana" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      await screen.findByRole("button", { name: "Boya ve küçük tadilat" }),
    );

    expect(
      screen.getByRole("button", { name: "Bu gruptaki tüm işler" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Boya ve badana" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Salon boya uygulaması").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mutfak küçük tadilatı").length).toBeGreaterThan(0);
    expect(screen.queryByText("Bahçe kapısı onarımı")).not.toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith("gallery_filter_selected", {
      group: "finish",
      subcategory: null,
      result_count: 2,
    });

    fireEvent.click(screen.getByRole("button", { name: "Boya ve badana" }));

    expect(screen.getAllByText("Salon boya uygulaması").length).toBeGreaterThan(0);
    expect(screen.queryByText("Mutfak küçük tadilatı")).not.toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith("gallery_filter_selected", {
      group: "finish",
      subcategory: "Boya ve badana",
      result_count: 1,
    });
  });

  it("hides a redundant subcategory step for single-category groups", async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Kaynak ve metal işleri" }),
    );

    expect(screen.getAllByText("Bahçe kapısı onarımı").length).toBeGreaterThan(0);
    expect(screen.queryByText("Salon boya uygulaması")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Bu gruptaki tüm işler" }),
    ).not.toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith("gallery_filter_selected", {
      group: "metal",
      subcategory: null,
      result_count: 1,
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
