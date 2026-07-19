import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import SEO from "./SEO";

describe("SEO", () => {
  afterEach(() => {
    document.head.querySelector('meta[name="robots"]')?.remove();
    document.head.querySelector('link[rel="canonical"]')?.remove();
    document.head.querySelector('meta[property="og:url"]')?.remove();
  });

  it("keeps canonical and social URL metadata aligned", async () => {
    render(
      <SEO
        title="Galeri | Umut Usta"
        description="Tamamlanan işleri inceleyin."
        canonicalPath="/gallery"
      />,
    );

    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://umut-usta.vercel.app/gallery",
      );
    });

    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://umut-usta.vercel.app/gallery",
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow",
    );
  });

  it("marks internal authentication pages as noindex", async () => {
    render(
      <SEO
        title="Giriş Yap | Umut Usta Yönetim"
        description="Yönetim paneli girişi."
        canonicalPath="/login"
        noIndex
      />,
    );

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        "content",
        "noindex, nofollow",
      );
    });
  });
});
