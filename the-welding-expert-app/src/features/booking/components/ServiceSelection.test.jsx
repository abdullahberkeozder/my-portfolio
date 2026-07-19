import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ServiceSelection from "./ServiceSelection";

const services = [
  {
    title: "Duvar boya ve badana",
    serviceType: "Duvar boya ve badana",
    problem: "Eski boya görünümü",
    priceTagline: "950 TL'den başlayan fiyatlar",
  },
  {
    title: "Kapı, korkuluk ve kaynak",
    serviceType: "Kapı, korkuluk ve kaynak",
    problem: "Kopan metal bağlantı",
    priceTagline: "750 TL'den başlayan fiyatlar",
  },
];

const allGroupServices = [
  ...services,
  {
    title: "Otomatik kapı ve motor",
    serviceType: "Otomatik kapı ve motor",
    problem: "Kapı motoru ve geçiş sistemi",
  },
  {
    title: "Bahçe düzenleme",
    serviceType: "Bahçe düzenleme",
    problem: "Bahçe ve peyzaj işi",
  },
];

describe("ServiceSelection", () => {
  it("starts with need groups and no preselected service", () => {
    render(
      <ServiceSelection
        services={services}
        selectedService=""
        onServiceSelect={vi.fn()}
        onStepChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Ne yaptırmak istiyorsunuz?" })).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /zaman tercihini seç/i })).not.toBeInTheDocument();
  });

  it("returns a preselected service to the need groups for editing", async () => {
    render(
      <ServiceSelection
        services={services}
        selectedService="Duvar boya ve badana"
        onServiceSelect={vi.fn()}
        onStepChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Ne yaptırmak istiyorsunuz?" })).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /zaman tercihini seç/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /boya ve küçük tadilat/i }));
    expect(screen.getByRole("radio", { name: /duvar boya ve badana/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("keeps four main choices together and the unsure path separate", () => {
    render(
      <ServiceSelection
        services={allGroupServices}
        selectedService=""
        onServiceSelect={vi.fn()}
        onStepChange={vi.fn()}
      />,
    );

    const mainChoices = screen.getByRole("group", { name: "İş türleri" });
    expect(mainChoices.querySelectorAll("button")).toHaveLength(4);
    expect(mainChoices).not.toContainElement(
      screen.getByRole("button", { name: /birlikte belirleyelim/i }),
    );
  });

  it("reveals only relevant services after a need group is chosen", async () => {
    const onServiceSelect = vi.fn();
    render(
      <ServiceSelection
        services={services}
        selectedService=""
        onServiceSelect={onServiceSelect}
        onStepChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /kaynak ve metal işleri/i }));

    const options = screen.getAllByRole("radio");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveAttribute("aria-checked", "false");
    await userEvent.click(options[0]);
    expect(onServiceSelect).toHaveBeenCalledWith("Kapı, korkuluk ve kaynak");
  });

  it("supports standard arrow-key navigation inside the radio group", async () => {
    const onServiceSelect = vi.fn();
    const metalServices = [
      services[1],
      {
        title: "Metal raf onarımı",
        serviceType: "Metal raf onarımı",
        problem: "Eğilmiş metal raf bağlantısı",
      },
    ];
    render(
      <ServiceSelection
        services={metalServices}
        selectedService=""
        onServiceSelect={onServiceSelect}
        onStepChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /kaynak ve metal işleri/i }));
    const options = screen.getAllByRole("radio");
    expect(options[0]).toHaveAttribute("tabindex", "0");
    expect(options[1]).toHaveAttribute("tabindex", "-1");

    options[0].focus();
    await userEvent.keyboard("{ArrowDown}");

    expect(options[1]).toHaveFocus();
    expect(onServiceSelect).toHaveBeenCalledWith("Metal raf onarımı");
  });

  it("routes an unsure customer to a discovery request", async () => {
    const onServiceSelect = vi.fn();
    const onStepChange = vi.fn();
    const { rerender } = render(
      <ServiceSelection
        services={services}
        selectedService=""
        onServiceSelect={onServiceSelect}
        onStepChange={onStepChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /birlikte belirleyelim/i }));

    expect(onServiceSelect).toHaveBeenCalledWith("Yerinde keşif ve teklif");
    rerender(
      <ServiceSelection
        services={services}
        selectedService="Yerinde keşif ve teklif"
        onServiceSelect={onServiceSelect}
        onStepChange={onStepChange}
      />,
    );

    expect(screen.getByRole("heading", { name: "Keşif talebi" })).toBeInTheDocument();
    expect(screen.getAllByText("Yerinde keşif ve teklif")).toHaveLength(1);
    expect(screen.getAllByRole("radio")).toHaveLength(1);
    expect(screen.queryByText(/hizmet seçildi/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zaman Tercihini Seç" })).toBeEnabled();
  });

  it("keeps discovery out of the garden category", async () => {
    render(
      <ServiceSelection
        services={allGroupServices}
        selectedService=""
        onServiceSelect={vi.fn()}
        onStepChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /bahçe ve dış alan/i }));

    expect(screen.getAllByRole("radio")).toHaveLength(1);
    expect(screen.getByRole("radio", { name: /bahçe düzenleme/i })).toBeInTheDocument();
    expect(screen.queryByText("Yerinde keşif ve teklif")).not.toBeInTheDocument();
  });
});
