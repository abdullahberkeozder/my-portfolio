import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.classList.remove("dark-mode", "theme-transitioning");
    localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.documentElement.classList.remove("dark-mode", "theme-transitioning");
  });

  it("switches themes and keeps the transition bounded to the slow motion token", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: "Karanlık temaya geç" });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle.querySelectorAll("svg")).toHaveLength(1);
    fireEvent.click(toggle);

    expect(document.documentElement).toHaveClass("dark-mode", "theme-transitioning");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveAccessibleName("Açık temaya geç");
    expect(toggle.querySelectorAll("svg")).toHaveLength(1);

    vi.advanceTimersByTime(320);
    expect(document.documentElement).not.toHaveClass("theme-transitioning");
  });
});
