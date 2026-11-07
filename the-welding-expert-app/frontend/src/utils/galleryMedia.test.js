import { describe, expect, it } from "vitest";

import { getGalleryImageAlt, hasBeforeAfterPair } from "./galleryMedia";

describe("getGalleryImageAlt", () => {
  const item = {
    title: "Bahçe kapısı onarımı",
    category: "Kaynak ve metal",
    location: "Yenimahalle",
    image_url: "/after.jpg",
    before_image_url: "/before.jpg",
  };

  it("describes the work, stage and context without a generic image label", () => {
    expect(getGalleryImageAlt(item, "before")).toBe(
      "Bahçe kapısı onarımı: uygulama öncesindeki mevcut durum; Kaynak ve metal, Yenimahalle",
    );
    expect(getGalleryImageAlt(item, "after")).toBe(
      "Bahçe kapısı onarımı: tamamlanan uygulama; Kaynak ve metal, Yenimahalle",
    );
  });

  it("prefers editorial alt metadata when supplied", () => {
    expect(getGalleryImageAlt({ ...item, image_alt: "Güçlendirilen kapının bitmiş menteşe detayı" })).toBe(
      "Güçlendirilen kapının bitmiş menteşe detayı",
    );
  });

  it("detects complete before and after media pairs", () => {
    expect(hasBeforeAfterPair(item)).toBe(true);
    expect(hasBeforeAfterPair({ ...item, before_image_url: null })).toBe(false);
  });
});
