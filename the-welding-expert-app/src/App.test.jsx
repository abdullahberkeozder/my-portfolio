import { render, screen, waitFor } from "@testing-library/react";
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
      await screen.findByRole(
        "heading",
        { name: "Yönetim paneli girişi" },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  });

  it("loads the not-found route on demand", async () => {
    window.history.pushState({}, "", "/bilinmeyen-sayfa");
    render(<App />);

    expect(
      await screen.findByRole(
        "heading",
        { name: "Aradığınız sayfa bulunamadı" },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        "content",
        "noindex, nofollow",
      );
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://umut-usta.vercel.app/bilinmeyen-sayfa",
      );
    });
  });
});
