import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProgressiveImage from "./ProgressiveImage";

describe("ProgressiveImage", () => {
  it("renders art-directed picture sources and a stable frame ratio", () => {
    const { container } = render(
      <ProgressiveImage
        src="/fallback.jpg"
        srcSet="/fallback-320.jpg 320w, /fallback-640.jpg 640w"
        sizes="100vw"
        alt="Tamamlanan metal kapı uygulaması"
        aspectRatio="4 / 3"
        sources={[
          {
            type: "image/avif",
            media: "(max-width: 640px)",
            sizes: "100vw",
            srcSet: "/mobile-320.avif 320w",
          },
          {
            type: "image/webp",
            srcSet: "/desktop-640.webp 640w",
          },
        ]}
      />,
    );

    const frame = container.firstElementChild;
    const sources = container.querySelectorAll("source");
    const image = container.querySelector("img");

    expect(getComputedStyle(frame).aspectRatio).toBe("4/3");
    expect(sources[0]).toHaveAttribute("media", "(max-width: 640px)");
    expect(sources[0]).toHaveAttribute("sizes", "100vw");
    expect(sources[1]).not.toHaveAttribute("media");
    expect(image).toHaveAttribute("src", "/fallback.jpg");
    expect(image).toHaveAttribute("alt", "Tamamlanan metal kapı uygulaması");
  });
});
