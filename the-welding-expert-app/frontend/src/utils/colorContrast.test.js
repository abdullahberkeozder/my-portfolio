import { describe, expect, it } from "vitest";
import { contrastRatio, meetsContrast } from "./colorContrast";

const normalTextPairs = [
  ["light body", "#555953", "#ffffff"],
  ["light muted", "#676b65", "#ffffff"],
  ["primary action", "#f7f6f2", "#8f4021"],
  ["success action", "#f7f6f2", "#11633f"],
  ["success status", "#0b6c43", "#e8f5e9"],
  ["warning status", "#854d0e", "#fffbeb"],
  ["danger status", "#b42318", "#fff4f2"],
  ["dark body", "#d9dbd5", "#181a18"],
  ["dark muted", "#a6aaa3", "#181a18"],
  ["dark success", "#90d6af", "#123d2b"],
];

describe("semantic color contrast", () => {
  it.each(normalTextPairs)("keeps %s at WCAG AA normal-text contrast", (_, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the focus ring distinguishable on light and dark surfaces", () => {
    expect(meetsContrast("#8f4021", "#ffffff", 3)).toBe(true);
    expect(meetsContrast("#c56a37", "#181a18", 3)).toBe(true);
  });
});
