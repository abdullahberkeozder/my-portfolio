import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./services/apiAuth", () => ({
  getAdminProfile: vi.fn(),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
}));


describe("lazy application routes", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/login");
  });

  it("loads the login route on demand", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Yönetim paneli girişi" }),
    ).toBeInTheDocument();
  });

  it("loads the not-found route on demand", async () => {
    window.history.pushState({}, "", "/bilinmeyen-sayfa");
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "Aradığınız sayfa bulunamadı",
      }),
    ).toBeInTheDocument();
  });
});
