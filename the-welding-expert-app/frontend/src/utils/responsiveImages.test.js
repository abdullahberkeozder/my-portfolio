import { describe, expect, it } from "vitest";
import {
  getResponsiveImageProps,
  getSupabasePreviewUrl,
} from "./responsiveImages";

describe("getResponsiveImageProps", () => {
  it("maps local PNG assets to responsive AVIF, WebP and JPEG sources", () => {
    const result = getResponsiveImageProps("/images/hero.png", "100vw");

    expect(result.src).toBe("/images/optimized/hero-1024.jpg");
    expect(result.srcSet).toContain("hero-320.jpg 320w");
    expect(result.sources[0]).toEqual(
      expect.objectContaining({ type: "image/avif" }),
    );
    expect(result.sources[1]).toEqual(
      expect.objectContaining({ type: "image/webp" }),
    );
    expect(result).toEqual(expect.objectContaining({ width: 1024, height: 1024 }));
  });

  it("leaves remote gallery URLs unchanged", () => {
    const src = "https://example.com/gallery/work.webp";
    expect(getResponsiveImageProps(src)).toEqual({ src });
  });
});

describe("getSupabasePreviewUrl", () => {
  it("uses the Supabase image renderer for compact gallery previews", () => {
    const result = getSupabasePreviewUrl(
      "https://project.supabase.co/storage/v1/object/public/gallery/work.png",
    );

    expect(result).toBe(
      "https://project.supabase.co/storage/v1/render/image/public/gallery/work.png?width=640&height=480&resize=cover&quality=70",
    );
  });

  it("keeps non-Supabase and invalid URLs unchanged", () => {
    expect(getSupabasePreviewUrl("https://example.com/work.png")).toBe(
      "https://example.com/work.png",
    );
    expect(getSupabasePreviewUrl("not-a-url")).toBe("not-a-url");
  });
});
