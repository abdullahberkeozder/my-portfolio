import { expect, test } from "@playwright/test";

const FIXED_NOW = new Date("2026-07-19T09:00:00+03:00");
const FIXED_DATE_KEY = "2026-07-19";
const DEFAULT_VIEWPORT = { width: 390, height: 844 };
const PUX4_GALLERY_ITEMS = [
  {
    id: "pux4-work-1",
    title: "Balkon korkuluğu onarımı",
    category: "Kaynak",
    location: "Yenimahalle",
    description: "Sallanan bağlantılar güvenli kullanımı zorlaştırıyordu.",
    image_url: "/images/railing_repair.png",
    is_published: true,
  },
  {
    id: "pux4-work-2",
    title: "Duvar yüzeyi yenileme",
    category: "Boya",
    location: "Çankaya",
    description: "Kabaran boya ve yüzey çatlakları görünümü bozuyordu.",
    image_url: "/images/painting.png",
    is_published: true,
  },
  {
    id: "pux4-work-3",
    title: "Bahçe kapısı motoru",
    category: "Otomasyon",
    location: "Etimesgut",
    description: "Ağır kapı manuel kullanımda zorlanmaya neden oluyordu.",
    image_url: "/images/gate_motor_after.png",
    is_published: true,
  },
];

async function mockCustomerData(page, {
  trackingResult = null,
  galleryItems = [],
  serviceConfigs = [],
  rpcDelay = 0,
} = {}) {
  await page.route("**/rest/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname.endsWith("/analytics_events")) {
      await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      return;
    }

    if (pathname.endsWith("/service_configs")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(serviceConfigs) });
      return;
    }

    if (pathname.endsWith("/gallery_items")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(galleryItems) });
      return;
    }

    if (pathname.endsWith("/appointment_availability_days")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "pux-baseline-day",
            work_date: FIXED_DATE_KEY,
            status: "available",
            note: "PUX baseline müsaitlik günü",
            appointment_availability_slots: [
              { id: "pux-baseline-slot", slot_time: "09:00:00", is_available: true, note: null },
              { id: "pux-baseline-slot-2", slot_time: "11:00:00", is_available: true, note: null },
              { id: "pux-baseline-slot-3", slot_time: "13:00:00", is_available: true, note: null },
              { id: "pux-baseline-slot-4", slot_time: "15:00:00", is_available: true, note: null },
              { id: "pux-baseline-slot-5", slot_time: "17:00:00", is_available: true, note: null },
              { id: "pux-baseline-slot-6", slot_time: "19:00:00", is_available: true, note: null },
            ],
          },
        ]),
      });
      return;
    }

    if (pathname.endsWith("/rpc/create_appointment_request")) {
      if (rpcDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, rpcDelay));
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "12345678-abcd-4000-8000-123456789012",
          public_token: "11111111-1111-4111-8111-111111111111",
        }),
      });
      return;
    }

    if (pathname.endsWith("/rpc/get_public_appointment_request")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([trackingResult]),
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
}

async function waitForStableViewport(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const visibleImages = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });

    await Promise.all(visibleImages.map((image) => (
      image.complete ? image.decode().catch(() => undefined) : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      })
    )));
  });
}

async function openAppointment(page, {
  theme = "light",
  viewport = DEFAULT_VIEWPORT,
  galleryItems = [],
  rpcDelay = 0,
} = {}) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem("theme", selectedTheme);
  }, theme);
  await mockCustomerData(page, { galleryItems, rpcDelay });
  await page.goto("/appointment");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await waitForStableViewport(page);
}

const screenshotOptions = {
  animations: "disabled",
  caret: "hide",
  scale: "css",
};

test.describe("PUX-0 customer visual baselines", () => {
  test("mobile light first viewport", async ({ page }) => {
    await openAppointment(page);
    await expect(page).toHaveScreenshot("pux-customer-mobile-light.png", screenshotOptions);
  });

  test("mobile dark first viewport", async ({ page }) => {
    await openAppointment(page, { theme: "dark" });
    await expect(page).toHaveScreenshot("pux-customer-mobile-dark.png", screenshotOptions);
  });

  test("tablet light first viewport", async ({ page }) => {
    await openAppointment(page, { viewport: { width: 768, height: 1024 } });
    await expect(page).toHaveScreenshot("pux-customer-tablet-light.png", screenshotOptions);
  });

  test("desktop light first viewport", async ({ page }) => {
    await openAppointment(page, { viewport: { width: 1440, height: 900 } });
    await expect(page).toHaveScreenshot("pux-customer-desktop-light.png", screenshotOptions);
  });

  test("booking wizard step and success states", async ({ page }) => {
    await openAppointment(page);
    const wizard = page.locator("#appointment-calendar");
    await wizard.scrollIntoViewIfNeeded();

    await expect(wizard).toHaveScreenshot("pux-wizard-service.png", screenshotOptions);

    await page.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
    await page.getByRole("radio", { name: /duvar boya ve badana/i }).click();
    await page.getByRole("button", { name: "Zaman Tercihini Seç" }).click();
    await expect(page.getByRole("heading", { name: "Uygun zamanı seçin" })).toBeVisible();
    await expect(wizard.getByText(/Müsaitlik bilgileri yükleniyor/)).toHaveCount(0);
    await expect(wizard).toHaveScreenshot("pux-wizard-time.png", screenshotOptions);

    await page.locator('[data-date-value="2026-07-19"]').click();
    await page.mouse.move(0, 0);
    await expect(wizard).toHaveScreenshot("pux-wizard-time-slots.png", screenshotOptions);

    await page.setViewportSize({ width: 1440, height: 900 });
    await wizard.scrollIntoViewIfNeeded();
    await expect(wizard).toHaveScreenshot("pux-wizard-time-slots-desktop.png", screenshotOptions);

    await page.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
    await page.mouse.move(0, 0);
    await expect(wizard).toHaveScreenshot("pux-wizard-time-selected-desktop.png", screenshotOptions);

    await page.setViewportSize(DEFAULT_VIEWPORT);
    await page.getByRole("button", { name: "İletişime Geç" }).click();
    await expect(page.getByLabel("Ad soyad *")).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(wizard).toHaveScreenshot("pux-wizard-contact.png", screenshotOptions);

    await page.setViewportSize({ width: 1440, height: 900 });
    await wizard.scrollIntoViewIfNeeded();
    await expect(wizard).toHaveScreenshot("pux-wizard-contact-desktop.png", screenshotOptions);

    await page.setViewportSize(DEFAULT_VIEWPORT);
    await page.getByLabel("Ad soyad *").fill("Canan Yılmaz");
    await page.getByLabel("Telefon numarası *").fill("05551234567");
    await page.getByRole("button", { name: "Talebi Gönder" }).click();
    await expect(page.getByRole("heading", { name: "Talebiniz alındı" })).toBeVisible();
    await expect(wizard).toHaveScreenshot("pux-wizard-success.png", screenshotOptions);
  });

  test("tracking error dark baseline", async ({ page }) => {
    await page.setViewportSize(DEFAULT_VIEWPORT);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await mockCustomerData(page, { trackingResult: null });
    await page.goto("/appointment/track/00000000-0000-4000-8000-000000000000");
    await expect(page.getByRole("main")).toBeVisible();
    await waitForStableViewport(page);
    await expect(page.getByRole("main")).toHaveScreenshot("pux-tracking-invalid-dark.png", screenshotOptions);
  });
});

test.describe("PUX attention guardrails", () => {
  test("customer page has no runtime, asset, id or anchor integrity errors", async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await openAppointment(page, {
      viewport: { width: 1440, height: 1000 },
      galleryItems: PUX4_GALLERY_ITEMS,
    });
    await page.locator("#faq").scrollIntoViewIfNeeded();
    await page.locator("img").last().waitFor({ state: "visible" });

    const integrity = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
      const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
      const brokenImages = [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src);
      const missingAnchors = [...document.querySelectorAll('a[href^="#"]')]
        .map((link) => link.getAttribute("href"))
        .filter((href) => href.length > 1 && !document.querySelector(href));

      return { duplicateIds, brokenImages, missingAnchors };
    });

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(integrity).toEqual({ duplicateIds: [], brokenImages: [], missingAnchors: [] });
  });

  for (const theme of ["light", "dark"]) {
    test(`navigation logo asset renders in ${theme} theme`, async ({ page }) => {
      await openAppointment(page, { theme });
      const navigationLogo = page
        .getByRole("navigation", { name: "Müşteri sayfası" })
        .locator('img[data-brand-logo="compact"]');

      await expect(navigationLogo).toBeVisible();
      await expect(navigationLogo).toHaveJSProperty("complete", true);
      expect(await navigationLogo.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
      expect(await navigationLogo.evaluate((image) => image.naturalHeight)).toBeGreaterThan(0);
    });
  }

  test("first viewport exposes one brand and one primary task", async ({ page }) => {
    await openAppointment(page);

    const visibleLogoCount = await page.locator('img[data-brand-logo]').evaluateAll((logos) => (
      logos.filter((logo) => {
        const rect = logo.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      }).length
    ));

    expect(visibleLogoCount).toBe(1);
    await expect(page.locator('[aria-label="Hızlı işlem seçenekleri"]')).toBeHidden();
    await expect(page.locator("#top").getByRole("link", { name: /randevu al/i })).toBeVisible();
    await expect(page.locator("#trust > div")).toHaveCount(3);
  });

  test("customer navigation follows page order without a false active section", async ({ page }) => {
    await openAppointment(page, { viewport: { width: 1440, height: 900 } });
    const navigation = page.getByRole("navigation", { name: "Müşteri sayfası" });
    const navItems = navigation.locator('[data-customer-nav-list="true"]');

    await expect(navItems.locator('[aria-current="location"]')).toHaveCount(0);
    expect(await navItems.locator("a").allTextContents()).toEqual(["İşler", "Hizmetler", "İletişim"]);

    await page.locator("#services").scrollIntoViewIfNeeded();
    await expect(navigation.locator('[data-nav-appointment="desktop"]')).toBeVisible();
    await expect(navItems.getByRole("link", { name: "Hizmetler" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("sticky follows hero and wizard visibility without overlap", async ({ page }) => {
    await openAppointment(page);

    await expect(page.locator("#top").getByRole("link", { name: /randevu al/i })).toBeVisible();
    const sticky = page.locator('[aria-label="Hızlı işlem seçenekleri"]');
    await expect(sticky).toBeHidden();

    await page.locator("#services").scrollIntoViewIfNeeded();
    await expect(sticky).toBeVisible();
    await expect(sticky.getByRole("button", { name: /randevu al/i })).toBeVisible();
    await expect(sticky.getByRole("link", { name: /fotoğrafla danış/i })).toBeVisible();

    await page.locator("#appointment-calendar").scrollIntoViewIfNeeded();
    await expect(sticky).toBeHidden();
  });

  test("booking starts with four main choices and no automatic date or time", async ({ page }) => {
    await openAppointment(page);
    const wizard = page.locator("#appointment-calendar");
    await wizard.scrollIntoViewIfNeeded();

    const mainChoices = wizard.getByRole("group", { name: "İş türleri" });
    await expect(mainChoices.getByRole("button")).toHaveCount(4);
    await expect(mainChoices.getByRole("button", { name: /birlikte belirleyelim/i })).toHaveCount(0);

    await wizard.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
    await wizard.getByRole("radio", { name: /duvar boya ve badana/i }).click();
    await wizard.getByRole("button", { name: "Zaman Tercihini Seç" }).click();

    await expect(wizard.getByLabel("Hızlı tarih seçimi")).toHaveCount(0);
    await expect(wizard.getByRole("button", { name: "Bugün" })).toHaveCount(0);
    await expect(wizard.getByRole("button", { name: "Yarın" })).toHaveCount(0);
    await expect(wizard.locator('[data-date-value][aria-pressed="true"]')).toHaveCount(0);
    await expect(wizard.getByText("Önce bir tarih seçin")).toHaveCount(0);
    await expect(wizard.getByText("Gün seçin")).toBeVisible();
    await expect(wizard.getByRole("button", { name: /09:00 - 11:00/ })).toHaveCount(0);
  });

  test("step navigation unlocks progressively and preserves the booking state", async ({ page }) => {
    await openAppointment(page);
    const wizard = page.locator("#appointment-calendar");
    await wizard.scrollIntoViewIfNeeded();

    const timeStep = wizard.getByRole("button", { name: "2 Zaman Tercihi adımına git" });
    const contactStep = wizard.getByRole("button", { name: "3 İletişim adımına git" });
    await expect(timeStep).toBeDisabled();
    await expect(contactStep).toBeDisabled();

    await wizard.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
    await wizard.getByRole("radio", { name: /duvar boya ve badana/i }).click();
    await expect(timeStep).toBeEnabled();
    await timeStep.click();

    await wizard.locator('[data-date-value="2026-07-19"]').click();
    await wizard.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
    await expect(contactStep).toBeEnabled();
    await contactStep.click();
    await expect(wizard.getByLabel("Ad soyad *")).toBeVisible();

    await wizard.getByRole("button", { name: "1 Hizmet adımına git" }).click();
    await expect(wizard.getByRole("heading", { name: "Ne yaptırmak istiyorsunuz?" })).toBeVisible();
    await expect(wizard.getByRole("radio")).toHaveCount(0);
    await wizard.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
    await expect(wizard.getByRole("radio", { name: /duvar boya ve badana/i })).toHaveAttribute("aria-checked", "true");
    await contactStep.click();
    await expect(wizard.getByText("Duvar boya ve badana")).toBeVisible();
  });

  test("discovery request appears once and does not repeat in the summary", async ({ page }) => {
    await openAppointment(page, { viewport: { width: 1440, height: 1000 } });
    const wizard = page.locator("#appointment-calendar");
    await wizard.scrollIntoViewIfNeeded();

    await wizard.getByRole("button", { name: /birlikte belirleyelim/i }).click();

    await expect(wizard.getByRole("heading", { name: "Keşif talebi" })).toBeVisible();
    await expect(wizard.getByText("Yerinde keşif ve teklif", { exact: true })).toHaveCount(1);
    await expect(wizard.getByRole("radio", { name: /yerinde keşif ve teklif/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(wizard.getByText("Hizmet seçildi")).toHaveCount(0);
    await expect(wizard.getByRole("button", { name: "Zaman Tercihini Seç" })).toBeEnabled();
    await expect(page.locator("#services").getByText("Yerinde keşif ve teklif")).toHaveCount(0);

    const optionBox = await wizard.getByRole("radio").boundingBox();
    const wizardBox = await wizard.boundingBox();
    expect(optionBox).not.toBeNull();
    expect(wizardBox).not.toBeNull();
    expect(Math.abs(
      optionBox.x + optionBox.width / 2 - (wizardBox.x + wizardBox.width / 2),
    )).toBeLessThanOrEqual(1);
    expect(optionBox.width).toBeLessThan(wizardBox.width * 0.6);
    await expect(wizard).toHaveScreenshot("pux-wizard-discovery-desktop.png", screenshotOptions);
  });

  test("desktop wizard aligns with the main content grid", async ({ page }) => {
    await openAppointment(page, { viewport: { width: 1440, height: 1000 } });
    const wizard = page.locator("#appointment-calendar");
    await wizard.scrollIntoViewIfNeeded();
    const wizardBox = await wizard.boundingBox();
    const proofBox = await page.locator("#trust").boundingBox();

    expect(wizardBox).not.toBeNull();
    expect(proofBox).not.toBeNull();
    expect(Math.abs(wizardBox.width - proofBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(wizardBox.x - proofBox.x)).toBeLessThanOrEqual(1);
    await expect(wizard).toHaveScreenshot("pux-wizard-service-desktop.png", screenshotOptions);
  });
});

test.describe("PUX-4 lower-page architecture", () => {
  test("desktop presents proof, service scope and contact progressively", async ({ page }) => {
    await openAppointment(page, {
      viewport: { width: 1440, height: 1000 },
      galleryItems: PUX4_GALLERY_ITEMS,
    });

    const portfolio = page.locator("#portfolio-preview");
    await portfolio.scrollIntoViewIfNeeded();
    await expect(portfolio.getByRole("article")).toHaveCount(3);
    await expect(portfolio.getByText("Sorun", { exact: true })).toHaveCount(3);
    await expect(portfolio.getByText("Uygulama", { exact: true })).toHaveCount(3);
    await expect(portfolio.getByText("Sonuç", { exact: true })).toHaveCount(3);
    await expect(portfolio).toHaveScreenshot("pux4-portfolio-desktop.png", screenshotOptions);

    const services = page.locator("#services");
    await services.scrollIntoViewIfNeeded();
    await expect(services.getByRole("article")).toHaveCount(4);
    await expect(services.getByRole("button")).toHaveCount(0);
    await expect(services).toHaveScreenshot("pux4-services-desktop.png", screenshotOptions);

    const location = page.locator("#location");
    await location.scrollIntoViewIfNeeded();
    await expect(location.getByTitle("Umut Usta Atölye Konumu")).toHaveCount(0);
    await expect(location.getByText(/e-posta hizmeti yakında/i)).toHaveCount(0);
    await expect(location).toHaveScreenshot("pux4-location-desktop.png", screenshotOptions);
    await location.getByRole("button", { name: "Haritayı göster" }).click();
    await expect(location.getByTitle("Umut Usta Atölye Konumu")).toBeVisible();
  });

  test("mobile avoids horizontal content rails and keeps details optional", async ({ page }) => {
    await openAppointment(page, { galleryItems: PUX4_GALLERY_ITEMS });

    const sectionWidths = await page
      .locator("#portfolio-preview, #services, #process, #location, #faq")
      .evaluateAll((sections) => sections.map((section) => ({
        id: section.id,
        fits: section.scrollWidth <= section.clientWidth + 1,
      })));
    expect(sectionWidths).toEqual(sectionWidths.map((section) => ({ ...section, fits: true })));

    await expect(page.getByRole("button", { name: /acil kaynak/i })).toHaveCount(0);
    await page.getByRole("button", { name: "1 soru daha göster" }).click();
    await expect(page.getByRole("button", { name: /acil kaynak/i })).toBeVisible();

    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByRole("link", { name: "Gizlilik" })).toBeVisible();
    await expect(footer.getByText(/ekip teyidinden sonra/i)).toHaveCount(0);
    const screenshotStyle = await page.addStyleTag({
      content: '[aria-label="Hızlı işlem seçenekleri"] { visibility: hidden !important; }',
    });
    await expect(page.locator("#services")).toHaveScreenshot("pux4-services-mobile.png", {
      ...screenshotOptions,
      maxDiffPixels: 500,
    });
    await screenshotStyle.evaluate((element) => element.remove());
    await expect(footer).toHaveScreenshot("pux4-footer-mobile.png", screenshotOptions);
  });
});

test.describe("PUX-5 media system", () => {
  test("customer proof media uses optimized formats, stable dimensions and descriptive alternatives", async ({ page }) => {
    await openAppointment(page, { galleryItems: PUX4_GALLERY_ITEMS });

    const heroImage = page.locator("#top picture img");
    await expect(heroImage).toHaveAttribute("src", /\/images\/optimized\/hero-1024\.jpg$/);
    await expect(heroImage).toHaveAttribute("srcset", /hero-400\.webp 400w/);
    await expect(heroImage).toHaveAttribute("width", "1024");
    await expect(heroImage).toHaveAttribute("height", "1024");

    const portfolio = page.locator("#portfolio-preview");
    await portfolio.scrollIntoViewIfNeeded();
    const proofImages = portfolio.locator("picture img");
    await expect(proofImages).toHaveCount(3);

    for (let index = 0; index < await proofImages.count(); index += 1) {
      const image = proofImages.nth(index);
      await expect(image).toHaveAttribute("loading", "lazy");
      await expect(image).toHaveAttribute("src", /\/images\/optimized\/.+-1024\.jpg$/);
      await expect(image).toHaveAttribute("srcset", /-320\.jpg 320w/);
      await expect(image).toHaveAttribute("width", "1024");
      await expect(image).toHaveAttribute("height", "1024");
      await expect(image).toHaveAttribute("alt", /tamamlanan uygulama/);

      const sourceTypes = await image.locator("xpath=../source").evaluateAll((sources) =>
        sources.map((source) => source.type),
      );
      expect(sourceTypes).toEqual(["image/avif", "image/webp"]);
    }

    const localPngRequests = await page.evaluate(() =>
      performance.getEntriesByType("resource")
        .map((entry) => new URL(entry.name).pathname)
        .filter((pathname) => /^\/images\/[^/]+\.png$/.test(pathname)),
    );
    expect(localPngRequests).toEqual([]);
  });
});

test.describe("PUX-6 calm motion system", () => {
  test("reduced motion preserves the full flow and focuses each new step heading", async ({ page }) => {
    await openAppointment(page);
    const wizard = page.locator("#appointment-calendar");

    await expect(wizard).not.toHaveAttribute("data-reveal", /.*/);
    await wizard.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
    await wizard.getByRole("radio", { name: /duvar boya ve badana/i }).click();
    await wizard.getByRole("button", { name: "Zaman Tercihini Seç" }).click();
    await expect(page.locator("#booking-time-title")).toBeFocused();

    await wizard.locator('[data-date-value="2026-07-19"]').click();
    await wizard.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
    await wizard.getByRole("button", { name: "İletişime Geç" }).click();
    await expect(page.locator("#booking-contact-title")).toBeFocused();

    const reducedMotionState = await page.evaluate(() => {
      const styles = [...document.querySelectorAll("body *")].map((element) => getComputedStyle(element));
      const durations = styles.flatMap((style) => style.animationDuration.split(","))
        .map((value) => Number.parseFloat(value) || 0);
      const iterations = styles.flatMap((style) => style.animationIterationCount.split(","));
      return {
        maxAnimationSeconds: Math.max(0, ...durations),
        hasInfiniteAnimation: iterations.includes("infinite"),
      };
    });

    expect(reducedMotionState.maxAnimationSeconds).toBeLessThanOrEqual(0.02);
    expect(reducedMotionState.hasInfiniteAnimation).toBe(false);
  });

  test("task transitions stay within 320ms and submit feedback keeps button geometry stable", async ({ page }) => {
    await page.setViewportSize(DEFAULT_VIEWPORT);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.setFixedTime(FIXED_NOW);
    await mockCustomerData(page, { rpcDelay: 650 });
    await page.goto("/appointment");

    const wizard = page.locator("#appointment-calendar");
    await wizard.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
    await wizard.getByRole("radio", { name: /duvar boya ve badana/i }).click();
    await wizard.getByRole("button", { name: "Zaman Tercihini Seç" }).click();
    await wizard.locator('[data-date-value="2026-07-19"]').click();
    await wizard.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
    await wizard.getByRole("button", { name: "İletişime Geç" }).click();
    await wizard.getByLabel("Ad soyad *").fill("Canan Yılmaz");
    await wizard.getByLabel("Telefon numarası *").fill("05551234567");

    const submit = wizard.locator('button[type="submit"]');
    const before = await submit.boundingBox();
    await submit.click();
    await expect(wizard.getByText("Talep gönderiliyor")).toBeVisible();
    const during = await submit.boundingBox();
    expect(during?.width).toBe(before?.width);
    expect(during?.height).toBe(before?.height);
    await expect(wizard.getByRole("heading", { name: "Talebiniz alındı" })).toBeVisible();

    const motionBudget = await page.evaluate(() => {
      const parseDurations = (value) => value.split(",").map((item) => {
        const duration = Number.parseFloat(item) || 0;
        return item.trim().endsWith("ms") ? duration / 1000 : duration;
      });
      const styles = [...document.querySelectorAll("#appointment-calendar *, [data-route-surface]")]
        .map((element) => getComputedStyle(element));
      return Math.max(0, ...styles.flatMap((style) => [
        ...parseDurations(style.animationDuration),
        ...parseDurations(style.transitionDuration),
      ]));
    });

    expect(motionBudget).toBeLessThanOrEqual(0.32);
  });
});

test.describe("PUX-1 brand asset guardrails", () => {
  test("logo SVG variants are vector-only and font independent", async ({ page }) => {
    await page.goto("/umut-usta-logo.svg");
    const assetPaths = [
      "/umut-usta-logo.svg",
      "/umut-usta-logo-compact.svg",
      "/umut-usta-logo-horizontal.svg",
      "/umut-usta-logo-monochrome.svg",
      "/umut-usta-favicon.svg",
    ];

    for (const assetPath of assetPaths) {
      const asset = await page.evaluate(async (path) => {
        const response = await fetch(path);
        return { ok: response.ok, source: await response.text() };
      }, assetPath);

      expect(asset.ok).toBe(true);
      expect(asset.source).toContain("<svg");
      expect(asset.source).not.toMatch(/<text\b/i);
    }
  });

  test("Forged U remains legible across size and surface variants", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/");
    await page.setContent(`
      <!doctype html>
      <html lang="tr">
        <head>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 32px; font-family: Arial, sans-serif; background: #d8d7d1; }
            main { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            section { min-height: 400px; padding: 24px; border-radius: 12px; display: grid; align-content: start; gap: 20px; overflow: hidden; }
            .light { color: #181a18; background: #f7f6f2; }
            .white { color: #181a18; background: #fff; }
            .dark { color: #f7f6f2; background: #181a18; }
            .photo {
              color: #fff;
              background:
                linear-gradient(rgba(24, 26, 24, .48), rgba(24, 26, 24, .68)),
                url('/images/optimized/custom_metal-1024.webp') center / cover;
            }
            h1 { margin: 0; font-size: 18px; }
            .sizes { display: flex; align-items: end; gap: 22px; }
            figure { margin: 0; display: grid; justify-items: center; gap: 8px; }
            figcaption { font-size: 12px; }
            img { width: var(--size); height: var(--size); object-fit: contain; }
            .dark img { filter: grayscale(1) brightness(0) invert(.94); }
            .lockups { display: flex; align-items: center; gap: 32px; }
            .lockups img { width: auto; height: 56px; }
            .surface-demo { display: flex; align-items: end; gap: 32px; min-height: 150px; }
            .surface-demo img:first-child { width: 128px; height: 128px; }
            .surface-demo img:last-child { width: auto; height: 64px; }
            .photo .surface-demo img { filter: grayscale(1) brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,.55)); }
          </style>
        </head>
        <body>
          <main>
            <section class="light">
              <h1>Bone / full color</h1>
              <div class="sizes">
                ${[16, 24, 32, 48, 96, 128].map((size) => `
                  <figure><img src="/umut-usta-logo.svg" style="--size:${size}px" alt="${size} px"><figcaption>${size}px</figcaption></figure>
                `).join("")}
              </div>
              <div class="lockups"><img src="/umut-usta-logo-compact.svg" alt="Kompakt logo"><img src="/umut-usta-logo-monochrome.svg" alt="Tek renk logo"></div>
            </section>
            <section class="dark">
              <h1>Obsidian / inverse</h1>
              <div class="sizes">
                ${[16, 24, 32, 48, 96, 128].map((size) => `
                  <figure><img src="/umut-usta-logo.svg" style="--size:${size}px" alt="${size} px inverse"><figcaption>${size}px</figcaption></figure>
                `).join("")}
              </div>
              <div class="lockups"><img src="/umut-usta-logo-compact.svg" alt="Kompakt inverse logo"><img src="/umut-usta-logo-monochrome.svg" alt="Tek renk inverse logo"></div>
            </section>
            <section class="white">
              <h1>Paper white / full color</h1>
              <div class="surface-demo"><img src="/umut-usta-logo.svg" alt="Beyaz zeminde logo"><img src="/umut-usta-logo-horizontal.svg" alt="Beyaz zeminde yatay logo"></div>
            </section>
            <section class="photo">
              <h1>Real work photo / inverse</h1>
              <div class="surface-demo"><img src="/umut-usta-logo-monochrome.svg" alt="Fotoğraf üzerinde logo"><img src="/umut-usta-logo-horizontal.svg" alt="Fotoğraf üzerinde yatay logo"></div>
            </section>
          </main>
        </body>
      </html>
    `);

    await waitForStableViewport(page);
    for (const logo of await page.locator("img").all()) {
      expect(await logo.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    }
    await expect(page).toHaveScreenshot("pux-logo-size-surface-matrix.png", screenshotOptions);
  });
});
