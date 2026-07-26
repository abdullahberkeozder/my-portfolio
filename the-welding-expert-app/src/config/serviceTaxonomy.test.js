import { describe, expect, it } from "vitest";

import {
  getGalleryGroupKey,
  getServiceGroupKey,
  isDiscoveryService,
  SERVICE_GROUPS,
} from "./serviceTaxonomy";

describe("service taxonomy", () => {
  it("exposes the four customer-facing service groups", () => {
    expect(SERVICE_GROUPS.map((group) => group.key)).toEqual([
      "finish",
      "metal",
      "access",
      "outdoor",
    ]);
  });

  it.each([
    ["Duvar boya ve badana", "finish"],
    ["Küçük inşaat ve ev tadilatı", "finish"],
    ["Kapı, korkuluk ve kaynak", "metal"],
    ["Raylı kapı sistemleri", "access"],
    ["Otomatik kapı motorları", "access"],
    ["Bina ve bahçe kapıları için akıllı kilit sistemleri", "access"],
    ["Bahçe peyzaj ve düzenleme", "outdoor"],
  ])("maps the %s booking service to %s", (service, expectedGroup) => {
    expect(getServiceGroupKey(service)).toBe(expectedGroup);
  });

  it.each([
    ["Boya ve badana", "finish"],
    ["İnşaat ve tadilat", "finish"],
    ["Kaynak ve metal", "metal"],
    ["Raylı kapı sistemleri", "access"],
    ["Otomatik kapı motorları", "access"],
    ["Bina ve bahçe kapıları için akıllı kilit sistemleri", "access"],
    ["Bahçe ve peyzaj", "outdoor"],
  ])("maps the %s gallery category to %s", (category, expectedGroup) => {
    expect(getGalleryGroupKey(category)).toBe(expectedGroup);
  });

  it("keeps discovery and unknown services outside the four fixed groups", () => {
    expect(isDiscoveryService("Yerinde keşif ve teklif")).toBe(true);
    expect(getGalleryGroupKey("Bilinmeyen kategori")).toBeNull();
  });
});
