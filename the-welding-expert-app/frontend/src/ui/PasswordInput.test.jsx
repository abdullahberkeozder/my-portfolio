import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import PasswordInput from "./PasswordInput";

describe("PasswordInput", () => {
  it("toggles password visibility without changing the value", async () => {
    const user = userEvent.setup();

    render(<PasswordInput aria-label="Şifre" defaultValue="guvenli-sifre" />);

    const input = screen.getByLabelText("Şifre");
    const toggle = screen.getByRole("button", { name: "Şifreyi göster" });

    expect(input).toHaveAttribute("type", "password");

    await user.click(toggle);

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("guvenli-sifre");
    expect(
      screen.getByRole("button", { name: "Şifreyi gizle" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
