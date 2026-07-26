import { expect, test } from "@playwright/test";

const GALLERY_ITEMS = [
  {
    id: "gallery-metal",
    title: "Bahçe kapısı onarımı",
    category: "Kaynak ve metal",
    image_url: "/images/gate-after.png",
    is_published: true,
  },
  {
    id: "gallery-paint",
    title: "Salon boya uygulaması",
    category: "Boya ve badana",
    image_url: "/images/painting.png",
    is_published: true,
  },
  {
    id: "gallery-renovation",
    title: "Mutfak küçük tadilatı",
    category: "İnşaat ve tadilat",
    image_url: "/images/renovation_after.png",
    is_published: true,
  },
];

async function openGallery(page, width) {
  await page.setViewportSize({ width, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/rest/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname.endsWith("/gallery_items")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(GALLERY_ITEMS),
      });
      return;
    }

    await route.fulfill({
      status: pathname.endsWith("/analytics_events") ? 201 : 200,
      contentType: "application/json",
      body: pathname.endsWith("/analytics_events") ? "{}" : "[]",
    });
  });

  await page.goto("/gallery");
  await expect(
    page.getByRole("heading", { name: "İş örneklerini filtreleyin" }),
  ).toBeVisible();
}

for (const width of [320, 390]) {
  test(`gallery taxonomy remains usable at ${width}px`, async ({ page }) => {
    await openGallery(page, width);

    const mainFilters = page.getByRole("group", {
      name: "Ana hizmet kategorileri",
    });
    await expect(mainFilters.getByRole("button")).toHaveCount(3);

    await mainFilters
      .getByRole("button", { name: "Boya ve küçük tadilat" })
      .click();

    const subfilters = page.getByRole("group", {
      name: "Boya ve küçük tadilat alt kategorileri",
    });
    await expect(subfilters).toBeVisible();
    await expect(subfilters.getByRole("button")).toHaveCount(3);

    const layoutAudit = await page.evaluate(() => {
      const buttons = Array.from(
        document.querySelectorAll(
          '[aria-label="Ana hizmet kategorileri"] button, ' +
          '[aria-label$="alt kategorileri"] button',
        ),
      );

      return {
        rootOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        undersizedButtons: buttons.filter(
          (button) => button.getBoundingClientRect().height < 44,
        ).length,
      };
    });

    expect(layoutAudit).toEqual({
      rootOverflow: false,
      undersizedButtons: 0,
    });

    await mainFilters
      .getByRole("button", { name: "Kaynak ve metal işleri" })
      .click();
    await expect(
      page.getByRole("group", {
        name: "Boya ve küçük tadilat alt kategorileri",
      }),
    ).toHaveCount(0);
    await expect(page.getByText("Bahçe kapısı onarımı")).toBeVisible();
    await expect(page.getByText("Salon boya uygulaması")).toHaveCount(0);
  });
}
