import { describe, expect, it, vi } from "vitest";
import { validateGalleryImage } from "./apiGallery";

vi.mock("./supabase", () => ({ default: {} }));

describe("gallery image validation", () => {
  it("accepts supported images up to 8 MB", () => {
    const file = new File(["image"], "work.webp", { type: "image/webp" });
    expect(() => validateGalleryImage(file)).not.toThrow();
  });

  it("rejects unsupported file formats", () => {
    const file = new File(["file"], "work.pdf", {
      type: "application/pdf",
    });
    expect(() => validateGalleryImage(file)).toThrow(
      "Görsel JPEG, PNG veya WebP formatında olmalıdır.",
    );
  });

  it("rejects images larger than 8 MB", () => {
    const file = { name: "large.jpg", type: "image/jpeg", size: 8 * 1024 * 1024 + 1 };
    expect(() => validateGalleryImage(file)).toThrow(
      "Görsel boyutu 8 MB'den küçük olmalıdır.",
    );
  });
});
