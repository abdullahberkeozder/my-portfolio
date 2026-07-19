import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BrandLogo from "./BrandLogo";

describe("BrandLogo", () => {
  it("renders the Forged U mark by default", () => {
    render(<BrandLogo />);

    const logo = screen.getByRole("img", { name: "Umut Usta" });
    expect(logo).toHaveAttribute("src", "/umut-usta-logo.svg");
    expect(logo).toHaveAttribute("data-brand-logo", "mark");
    expect(logo).toHaveStyle({ width: "3.6rem", height: "3.6rem" });
  });

  it("uses stable dimensions for the compact vector lockup", () => {
    render(<BrandLogo variant="compact" size={4} alt="Umut Usta kompakt logo" />);

    const logo = screen.getByRole("img", { name: "Umut Usta kompakt logo" });
    expect(logo).toHaveAttribute("src", "/umut-usta-logo-compact.svg");
    expect(logo).toHaveAttribute("data-brand-logo", "compact");
    expect(logo).toHaveStyle({ width: "16rem", height: "4rem" });
  });

  it("supports monochrome and textured production variants", () => {
    const { rerender } = render(<BrandLogo variant="monochrome" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/umut-usta-logo-monochrome.svg");

    rerender(<BrandLogo variant="textured" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/umut-usta-logo.png");
  });
});
