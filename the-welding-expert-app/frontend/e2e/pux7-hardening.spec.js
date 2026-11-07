import { expect, test } from "@playwright/test";

const FIXED_NOW = new Date("2026-07-19T09:00:00+03:00");
const PUBLIC_TOKEN = "11111111-1111-4111-8111-111111111111";
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const MOBILE_CONTACT_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 430, height: 932 },
  { width: 667, height: 375 },
];

const availability = [{
  id: "pux7-day",
  work_date: "2026-07-19",
  status: "available",
  note: null,
  appointment_availability_slots: [
    { id: "pux7-slot", slot_time: "09:00:00", is_available: true, note: null },
    { id: "pux7-slot-2", slot_time: "11:00:00", is_available: true, note: null },
    { id: "pux7-slot-3", slot_time: "13:00:00", is_available: true, note: null },
    { id: "pux7-slot-4", slot_time: "15:00:00", is_available: true, note: null },
    { id: "pux7-slot-5", slot_time: "17:00:00", is_available: true, note: null },
    { id: "pux7-slot-6", slot_time: "19:00:00", is_available: true, note: null },
  ],
}];

const trackingRequest = {
  service_type: "Kapı, korkuluk ve kaynak",
  requested_date: "2026-07-24",
  requested_time: "15:00:00",
  status: "new",
  created_at: "2026-07-19T09:00:00.000Z",
  updated_at: "2026-07-19T09:00:00.000Z",
  customer_action: null,
  customer_action_at: null,
  customer_action_count: 0,
};

async function mockPublicData(page, { tracking = trackingRequest } = {}) {
  await page.route("**/rest/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname.endsWith("/analytics_events")) {
      await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
      return;
    }
    if (pathname.endsWith("/appointment_availability_days")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(availability) });
      return;
    }
    if (pathname.endsWith("/rpc/create_appointment_request")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "12345678-abcd-4000-8000-123456789012", public_token: PUBLIC_TOKEN }),
      });
      return;
    }
    if (pathname.endsWith("/rpc/get_public_appointment_request")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([tracking]) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
}

async function openAppointment(page, viewport = { width: 390, height: 844 }) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.setFixedTime(FIXED_NOW);
  await mockPublicData(page);
  await page.goto("/appointment");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#faq")).toBeAttached();
}

async function selectBookingTime(page) {
  const wizard = page.locator("#appointment-calendar");
  await wizard.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
  await wizard.getByRole("radio", { name: /duvar boya ve badana/i }).click();
  await wizard.getByRole("button", { name: "Zaman Tercihini Seç" }).click();
  await wizard.locator('[data-date-value="2026-07-19"]').click();
  await wizard.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
  return wizard;
}

async function expectWizardSurfacesToFit(page) {
  const overflow = await page.locator("#appointment-calendar").evaluate((wizard) => {
    const surfaces = [
      ["wizard", wizard],
      ["progress", wizard.querySelector('[data-wizard-progress="true"]')],
      ["step-body", wizard.querySelector('[data-wizard-step-body="true"]')],
      ["summary", wizard.querySelector('[data-booking-summary="true"]')],
      ["form", wizard.querySelector("form")],
    ];

    return surfaces
      .filter(([, element]) => element)
      .filter(([, element]) => element.scrollWidth > element.clientWidth + 1)
      .map(([name, element]) => ({
        name,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
  });

  expect(overflow).toEqual([]);
}

test.describe("PUX-7 responsive matrix", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} has no root overflow or undersized controls`, async ({ page }) => {
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await openAppointment(page, viewport);

      const audit = await page.evaluate(() => {
        const interactiveSelector = 'a[href], button, input, select, textarea, summary, [role="radio"]';
        const visibleControls = [...document.querySelectorAll(interactiveSelector)].filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        });
        const undersized = visibleControls.filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width < 24 || rect.height < 24;
        }).map((element) => element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 60));
        const overflowingControls = visibleControls.filter((element) => (
          element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX !== "auto"
        )).map((element) => element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 60));

        return {
          rootOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          undersized,
          overflowingControls,
        };
      });

      expect(pageErrors).toEqual([]);
      expect(audit.rootOverflow).toBe(false);
      expect(audit.undersized).toEqual([]);
      expect(audit.overflowingControls).toEqual([]);
    });
  }

  test("edge viewports keep stable visual baselines", async ({ page }) => {
    await openAppointment(page, { width: 320, height: 568 });
    await expect(page).toHaveScreenshot("pux7-customer-320x568.png", { animations: "disabled", caret: "hide" });

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.locator("#top").scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot("pux7-customer-1024x768.png", { animations: "disabled", caret: "hide" });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.locator("#top").scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot("pux7-customer-1920x1080.png", { animations: "disabled", caret: "hide" });
  });

  test("320px wizard surfaces stay within bounds through every step", async ({ page }) => {
    await openAppointment(page, { width: 320, height: 568 });
    const wizard = page.locator("#appointment-calendar");

    await expectWizardSurfacesToFit(page);
    await wizard.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
    await wizard.getByRole("radio", { name: /duvar boya ve badana/i }).click();
    await wizard.getByRole("button", { name: "Zaman Tercihini Seç" }).click();

    await expectWizardSurfacesToFit(page);
    await expect(wizard.getByText("Önce bir tarih seçin")).toHaveCount(0);
    await wizard.locator('[data-date-value="2026-07-19"]').click();
    await wizard.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
    await wizard.getByRole("button", { name: "İletişime Geç" }).click();

    await expectWizardSurfacesToFit(page);
    await expect(wizard.getByRole("heading", { name: "İletişim bilgileri" })).toHaveCount(1);
    await expect(wizard.getByRole("button", { name: "Değiştir" })).toHaveCount(1);
  });

  for (const viewport of MOBILE_CONTACT_VIEWPORTS) {
    test(`contact step fits ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await openAppointment(page, viewport);
      const wizard = await selectBookingTime(page);
      await wizard.getByRole("button", { name: "İletişime Geç" }).click();
      await expect(wizard.getByRole("heading", { name: "İletişim bilgileri" })).toBeVisible();
      await expectWizardSurfacesToFit(page);

      const geometry = await wizard.evaluate((element) => {
        const layout = element.querySelector('[data-contact-layout="true"]');
        const summary = element.querySelector('[data-booking-summary="true"]');
        const form = element.querySelector("form");
        const submit = form?.querySelector('button[type="submit"]');
        const edit = summary?.querySelector("button");
        const inputs = [...(form?.querySelectorAll("input, textarea") || [])];
        const rect = (node) => {
          const box = node.getBoundingClientRect();
          return {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            right: box.right,
            bottom: box.bottom,
          };
        };
        const layoutBox = rect(layout);
        const formBox = rect(form);
        const clippedControls = [edit, submit, ...inputs]
          .filter(Boolean)
          .filter((node) => node.scrollWidth > node.clientWidth + 1)
          .map((node) => node.getAttribute("aria-label") || node.name || node.textContent?.trim());

        return {
          rootOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          wizardOverflow: element.scrollWidth > element.clientWidth + 1,
          layout: layoutBox,
          summary: rect(summary),
          form: formBox,
          submit: rect(submit),
          edit: rect(edit),
          inputsInsideForm: inputs.every((node) => {
            const box = node.getBoundingClientRect();
            return box.x >= formBox.x - 1 && box.right <= formBox.right + 1;
          }),
          clippedControls,
        };
      });

      expect(geometry.rootOverflow).toBe(false);
      expect(geometry.wizardOverflow).toBe(false);
      expect(geometry.form.y).toBeGreaterThanOrEqual(geometry.layout.y - 1);
      expect(geometry.summary.y).toBeGreaterThan(geometry.form.y);
      expect(geometry.summary.bottom).toBeLessThanOrEqual(geometry.submit.y);
      expect(Math.abs(geometry.summary.x - geometry.form.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.summary.width - geometry.form.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.submit.x - geometry.form.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.submit.width - geometry.form.width)).toBeLessThanOrEqual(1);
      expect(geometry.submit.bottom).toBeLessThanOrEqual(geometry.layout.bottom + 1);
      expect(geometry.submit.height).toBeGreaterThanOrEqual(44);
      expect(geometry.edit.height).toBeGreaterThanOrEqual(44);
      expect(geometry.inputsInsideForm).toBe(true);
      expect(geometry.clippedControls).toEqual([]);

      if ([320, 430, 667].includes(viewport.width)) {
        await wizard.scrollIntoViewIfNeeded();
        await expect(wizard).toHaveScreenshot(
          `pux7-contact-${viewport.width}x${viewport.height}.png`,
          { animations: "disabled", caret: "hide" },
        );
      }
    });
  }

  test("weekly calendar remains visible and overflow-free across breakpoints", async ({ page }) => {
    await openAppointment(page, { width: 1440, height: 900 });
    const wizard = await selectBookingTime(page);
    const calendarPanel = wizard.locator('[data-time-calendar-panel="true"]');

    const desktopAudit = await calendarPanel.evaluate((element) => ({
      visible: element.getBoundingClientRect().height > 0,
      overflow: element.scrollWidth > element.clientWidth + 1,
    }));
    expect(desktopAudit).toEqual({ visible: true, overflow: false });

    await page.setViewportSize({ width: 320, height: 568 });
    const mobileAudit = await calendarPanel.evaluate((element) => ({
      overflow: element.scrollWidth > element.clientWidth + 1,
    }));
    expect(mobileAudit).toEqual({ overflow: false });
  });

  test("wizard gutters, weekly calendar and form grid follow one responsive rhythm", async ({ page }) => {
    for (const width of [320, 390]) {
      await openAppointment(page, { width, height: 844 });
      const wizard = page.locator("#appointment-calendar");
      const wizardBox = await wizard.boundingBox();
      const progress = wizard.locator('[data-wizard-progress="true"]');
      const progressBox = await progress.boundingBox();
      const bodyBox = await wizard.locator('[data-wizard-step-body="true"]').boundingBox();
      const progressGeometry = await progress.evaluate((element) => {
        const steps = [...element.querySelectorAll("button")].map((button) => {
          const [number, label] = button.querySelectorAll("span");
          const buttonBox = button.getBoundingClientRect();
          const numberBox = number.getBoundingClientRect();
          const labelBox = label.getBoundingClientRect();

          return {
            left: buttonBox.left,
            right: buttonBox.right,
            height: buttonBox.height,
            numberBottom: numberBox.bottom,
            labelTop: labelBox.top,
          };
        });

        return {
          labelOverlap: steps.some((step) => step.numberBottom > step.labelTop),
          stepOverlap: steps.some(
            (step, index) => index > 0 && step.left < steps[index - 1].right,
          ),
          undersized: steps.some((step) => step.height < 44),
        };
      });

      expect(wizardBox).not.toBeNull();
      expect(progressBox).not.toBeNull();
      expect(bodyBox).not.toBeNull();
      expect(Math.abs(wizardBox.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(wizardBox.width - width)).toBeLessThanOrEqual(1);
      expect(Math.abs(progressBox.x - 16)).toBeLessThanOrEqual(1);
      expect(Math.abs(bodyBox.x - 16)).toBeLessThanOrEqual(1);
      expect(Math.abs(width - (progressBox.x + progressBox.width) - 16)).toBeLessThanOrEqual(1);
      expect(Math.abs(width - (bodyBox.x + bodyBox.width) - 16)).toBeLessThanOrEqual(1);
      expect(progressGeometry).toEqual({
        labelOverlap: false,
        stepOverlap: false,
        undersized: false,
      });
    }

    await openAppointment(page, { width: 1440, height: 900 });
    const wizard = page.locator("#appointment-calendar");
    await wizard.getByRole("button", { name: /boya ve küçük tadilat/i }).click();
    await wizard.getByRole("radio", { name: /duvar boya ve badana/i }).click();
    await wizard.getByRole("button", { name: "Zaman Tercihini Seç" }).click();

    const weekRailBox = await wizard.getByRole("group", { name: "Haftanın günleri" }).boundingBox();
    const firstDayBox = await wizard.locator("[data-date-value]").first().boundingBox();
    const calendarBox = await wizard.locator('[data-time-calendar-panel="true"]').boundingBox();
    const slotPanelBox = await wizard.locator('[data-time-slot-panel="true"]').boundingBox();
    const scheduleBoardBox = await wizard.locator('[data-time-schedule-board="true"]').boundingBox();
    const serviceSummaryBox = await wizard.locator('[data-selected-service-summary="true"]').boundingBox();
    const serviceEditBox = await wizard.getByRole("button", { name: "Hizmeti değiştir" }).boundingBox();
    expect(weekRailBox).not.toBeNull();
    expect(firstDayBox).not.toBeNull();
    expect(calendarBox).not.toBeNull();
    expect(slotPanelBox).not.toBeNull();
    expect(scheduleBoardBox).not.toBeNull();
    expect(serviceSummaryBox).not.toBeNull();
    expect(serviceEditBox).not.toBeNull();
    expect(Math.abs(firstDayBox.x - weekRailBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(serviceSummaryBox.x - scheduleBoardBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(serviceSummaryBox.width - scheduleBoardBox.width)).toBeLessThanOrEqual(1);
    expect(scheduleBoardBox.y - (serviceSummaryBox.y + serviceSummaryBox.height)).toBeLessThanOrEqual(20);
    expect(serviceEditBox.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(slotPanelBox.x - calendarBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(slotPanelBox.width - calendarBox.width)).toBeLessThanOrEqual(1);
    expect(slotPanelBox.y).toBeGreaterThanOrEqual(calendarBox.y + calendarBox.height);
    expect(slotPanelBox.y - (calendarBox.y + calendarBox.height)).toBeLessThanOrEqual(20);

    await wizard.locator('[data-date-value="2026-07-19"]').click();

    const daySummaryBox = await wizard.locator('[data-slot-heading="true"]').boundingBox();
    const slotGridBox = await wizard.locator('[data-time-slot-grid="true"]').boundingBox();
    expect(daySummaryBox).not.toBeNull();
    expect(slotGridBox).not.toBeNull();
    expect(scheduleBoardBox.width).toBeLessThanOrEqual(840);
    expect(slotGridBox.width).toBeLessThanOrEqual(720);
    expect(Math.abs(
      (slotGridBox.x + slotGridBox.width / 2) -
      (daySummaryBox.x + daySummaryBox.width / 2),
    )).toBeLessThanOrEqual(1);
    expect(slotGridBox.y).toBeGreaterThanOrEqual(daySummaryBox.y + daySummaryBox.height);

    await wizard.getByRole("button", { name: "09:00 - 11:00, müsait" }).click();
    const slotActionsBox = await wizard.locator('[data-time-slot-actions="true"]').boundingBox();
    const continueButtonBox = await wizard.getByRole("button", { name: "İletişime Geç" }).boundingBox();
    expect(slotActionsBox).not.toBeNull();
    expect(continueButtonBox).not.toBeNull();
    expect(Math.abs(slotActionsBox.x - daySummaryBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(slotActionsBox.width - daySummaryBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(continueButtonBox.x - slotActionsBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(continueButtonBox.width - slotActionsBox.width)).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletDaySummaryBox = await wizard.locator('[data-slot-heading="true"]').boundingBox();
    const tabletSlotGridBox = await wizard.locator('[data-time-slot-grid="true"]').boundingBox();
    expect(tabletSlotGridBox.y).toBeGreaterThanOrEqual(
      tabletDaySummaryBox.y + tabletDaySummaryBox.height,
    );

    await page.setViewportSize({ width: 1440, height: 900 });
    await wizard.getByRole("button", { name: "İletişime Geç" }).click();

    const summaryBox = await wizard.locator('[data-booking-summary="true"]').boundingBox();
    const formBox = await wizard.locator("form").boundingBox();
    const submitBox = await wizard.locator('form button[type="submit"]').boundingBox();
    expect(summaryBox).not.toBeNull();
    expect(formBox).not.toBeNull();
    expect(submitBox).not.toBeNull();
    expect(summaryBox.width).toBeLessThanOrEqual(840);
    expect(Math.abs(summaryBox.x - formBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(summaryBox.width - formBox.width)).toBeLessThanOrEqual(1);
    expect(summaryBox.y).toBeGreaterThan(formBox.y);
    expect(summaryBox.y + summaryBox.height).toBeLessThanOrEqual(submitBox.y);
    expect(Math.abs(submitBox.x - formBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(submitBox.width - formBox.width)).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletSummaryBox = await wizard.locator('[data-booking-summary="true"]').boundingBox();
    const tabletFormBox = await wizard.locator("form").boundingBox();
    const tabletSubmitBox = await wizard.locator('form button[type="submit"]').boundingBox();
    expect(tabletSummaryBox).not.toBeNull();
    expect(tabletFormBox).not.toBeNull();
    expect(tabletSubmitBox).not.toBeNull();
    expect(tabletSummaryBox.y).toBeGreaterThan(tabletFormBox.y);
    expect(tabletSummaryBox.y + tabletSummaryBox.height).toBeLessThanOrEqual(tabletSubmitBox.y);
    expect(Math.abs(tabletSummaryBox.x - tabletFormBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(tabletSummaryBox.width - tabletFormBox.width)).toBeLessThanOrEqual(1);
  });
});

test.describe("PUX-7 accessibility and mobile resilience", () => {
  test("safe-area viewport and deferred third-party map remain enforced", async ({ page }) => {
    await openAppointment(page);
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewportMeta).toContain("viewport-fit=cover");

    await page.locator("#location").scrollIntoViewIfNeeded();
    const mapRequestsBeforeConsent = await page.evaluate(() => performance.getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((url) => /maps\.google|google\.com\/maps/i.test(url)));
    expect(mapRequestsBeforeConsent).toEqual([]);
    await expect(page.getByTitle("Umut Usta Atölye Konumu")).toHaveCount(0);
  });

  test("booking can be completed with keyboard input", async ({ page }) => {
    await openAppointment(page);
    const wizard = page.locator("#appointment-calendar");

    const heroCta = page.locator("#top").getByRole("link", { name: /randevu al/i });
    await heroCta.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#booking-service-title")).toBeFocused();
    const serviceCategory = wizard.getByRole("button", { name: /boya ve küçük tadilat/i });
    await serviceCategory.focus();
    await expect(serviceCategory).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(wizard.getByRole("radiogroup", { name: "Hizmet seçenekleri" })).toBeVisible();
    await wizard.getByRole("radio", { name: /duvar boya ve badana/i }).focus();
    await page.keyboard.press("Space");
    await wizard.getByRole("button", { name: "Zaman Tercihini Seç" }).focus();
    await page.keyboard.press("Enter");
    const availableDay = wizard.locator('[data-date-value="2026-07-19"]');
    await expect(availableDay).toBeEnabled();
    await availableDay.focus();
    await page.keyboard.press("Enter");
    await expect(availableDay).toHaveAttribute("aria-pressed", "true");
    await wizard.getByRole("button", { name: "09:00 - 11:00, müsait" }).focus();
    await page.keyboard.press("Space");
    await wizard.getByRole("button", { name: "İletişime Geç" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#booking-contact-title")).toBeFocused();

    const nameInput = wizard.getByLabel("Ad soyad *");
    const phoneInput = wizard.getByLabel("Telefon numarası *");
    await nameInput.focus();
    await page.keyboard.insertText("Canan Yılmaz");
    await phoneInput.focus();
    await page.keyboard.insertText("05551234567");
    await expect(nameInput).toHaveValue("Canan Yılmaz");
    await expect(phoneInput).toHaveValue(/0555.*123.*45.*67/);
    await wizard.locator('button[type="submit"]').focus();
    await page.keyboard.press("Enter");
    await expect(wizard.getByRole("heading", { name: "Talebiniz alındı" })).toBeVisible();
  });

  test("virtual keyboard viewport keeps validation, optional details and submit reachable", async ({ page }) => {
    await openAppointment(page);
    const wizard = await selectBookingTime(page);
    await wizard.getByRole("button", { name: "İletişime Geç" }).click();
    await wizard.getByLabel("Telefon numarası *").fill("05551234567");

    await page.setViewportSize({ width: 390, height: 430 });
    await wizard.locator('button[type="submit"]').click();
    await expect(wizard.getByRole("alert")).toBeVisible();
    await expect(page.locator('[aria-label="Hızlı işlem seçenekleri"]')).toBeHidden();

    await wizard.getByRole("button", { name: "Ek bilgi ekle" }).click();
    await expect(wizard.getByLabel(/E-posta/)).toBeVisible();
    await wizard.locator('button[type="submit"]').scrollIntoViewIfNeeded();
    const submitBox = await wizard.locator('button[type="submit"]').boundingBox();
    expect(submitBox?.width).toBeLessThanOrEqual(390);
    expect(submitBox?.height).toBeGreaterThanOrEqual(44);
  });

  test("sticky CTA clears both wizard and footer", async ({ page }) => {
    await openAppointment(page);
    const sticky = page.locator('[aria-label="Hızlı işlem seçenekleri"]');
    await page.locator("#services").scrollIntoViewIfNeeded();
    await expect(sticky).toBeVisible();
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(sticky).toBeHidden();
  });

  test("forced colors preserves focus and selected-state visibility", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.setFixedTime(FIXED_NOW);
    await mockPublicData(page);
    await page.goto("/appointment");

    const serviceButton = page.getByRole("button", { name: /boya ve küçük tadilat/i });
    await serviceButton.focus();
    const focusStyle = await serviceButton.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
    });
    expect(focusStyle.outlineStyle).not.toBe("none");
    expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(3);

    await serviceButton.click();
    const radio = page.getByRole("radio", { name: /duvar boya ve badana/i });
    await radio.click();
    await expect(radio).toHaveAttribute("aria-checked", "true");
    await expect(page).toHaveScreenshot("pux7-forced-colors-service.png", { animations: "disabled", caret: "hide" });
  });

  test("valid tracking state has a stable responsive baseline", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.setFixedTime(FIXED_NOW);
    await mockPublicData(page);
    await page.goto(`/appointment/track/${PUBLIC_TOKEN}`);
    await expect(page.getByRole("heading", { name: "Talebinizi takip edin" })).toBeVisible();
    await page.getByLabel("Tercih ettiğiniz yeni tarih").fill("2026-07-19");
    await page.getByRole("heading", { name: "Talebinizi takip edin" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
    await expect(page.getByRole("main")).toHaveScreenshot("pux7-tracking-valid-mobile.png", { animations: "disabled", caret: "hide" });
  });
});
