import { expect, test } from "@playwright/test";

const USER = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "operator@example.com",
  role: "authenticated",
  aud: "authenticated",
};

const PROFILE = {
  user_id: USER.id,
  full_name: "Test Operatör",
  email: USER.email,
  role: "operator",
  status: "active",
};

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const REQUESTS = [
  {
    id: "confirmed",
    created_at: hoursAgo(26),
    first_contacted_at: hoursAgo(24),
    requested_date: "2026-07-28",
    requested_time: "09:00:00",
    customer_name: "Boya müşterisi",
    service_type: "Duvar boya ve badana",
    lead_quality: "qualified",
    status: "confirmed",
  },
  {
    id: "waiting",
    created_at: hoursAgo(20),
    first_contacted_at: null,
    requested_date: "2026-07-29",
    requested_time: "11:00:00",
    customer_name: "Bekleyen müşteri",
    service_type: "Duvar boya ve badana",
    lead_quality: "qualified",
    status: "new",
  },
  {
    id: "outside",
    created_at: hoursAgo(10),
    first_contacted_at: hoursAgo(9),
    requested_date: "2026-07-30",
    requested_time: "13:00:00",
    customer_name: "Bölge dışı müşteri",
    service_type: "Kapı, korkuluk ve kaynak",
    lead_quality: "outside_area",
    status: "contacted",
  },
  {
    id: "untagged",
    created_at: hoursAgo(5),
    first_contacted_at: null,
    requested_date: "2026-07-31",
    requested_time: "15:00:00",
    customer_name: "Etiketsiz müşteri",
    service_type: "Kapı, korkuluk ve kaynak",
    lead_quality: null,
    status: "new",
  },
];

async function installAuthenticatedSession(page) {
  await page.route("**/rest/v1/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  const restRequestPromise = page.waitForRequest("**/rest/v1/**");
  await page.goto("/appointment");
  const restRequest = await restRequestPromise;
  const projectRef =
    new URL(restRequest.url()).hostname.split(".")[0] || "placeholder-project";

  await page.evaluate(({ ref, user }) => {
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify({
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      expires_in: 3600,
      token_type: "bearer",
      user,
    }));
  }, { ref: projectRef, user: USER });

  await page.unroute("**/rest/v1/**");
}

async function mockAdminData(page) {
  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(USER),
    });
  });

  await page.route("**/rest/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname.endsWith("/admin_profiles")) {
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.pgrst.object+json",
        body: JSON.stringify(PROFILE),
      });
      return;
    }

    if (pathname.endsWith("/appointment_requests")) {
      await route.fulfill({
        status: 200,
        headers: { "content-range": `0-${REQUESTS.length - 1}/${REQUESTS.length}` },
        contentType: "application/json",
        body: JSON.stringify(REQUESTS),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });
}

test("operational KPIs remain usable on a 390px dashboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installAuthenticatedSession(page);
  await mockAdminData(page);
  await page.goto("/admin/dashboard");

  const kpiRegion = page.getByRole("region", {
    name: "Operasyonel performans göstergeleri",
  });
  await expect(kpiRegion).toBeVisible();
  await expect(
    kpiRegion.getByRole("heading", { name: "Medyan ilk yanıt süresi" }),
  ).toBeVisible();
  await expect(
    kpiRegion.getByRole("heading", { name: "Nitelikli talep teyit oranı" }),
  ).toBeVisible();
  await expect(
    kpiRegion.getByRole("heading", { name: "Hizmet bölgesi dışı oranı" }),
  ).toBeVisible();
  await expect(kpiRegion.getByText("1,5 sa", { exact: true })).toBeVisible();
  await expect(kpiRegion.getByText("%50", { exact: true })).toBeVisible();
  await expect(kpiRegion.getByText("%33", { exact: true })).toBeVisible();

  const outsideAreaLink = kpiRegion.getByRole("link", {
    name: /hizmet bölgesi dışı oranı/i,
  });
  await expect(outsideAreaLink).toHaveAttribute(
    "href",
    "/admin/bookings?lead_quality=outside_area",
  );

  const layoutAudit = await page.evaluate(() => {
    const region = document.querySelector(
      '[aria-label="Operasyonel performans göstergeleri"]',
    );
    const cards = Array.from(region?.children || []);

    return {
      rootOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      cardOverflow: cards.some(
        (card) => card.scrollWidth > card.clientWidth + 1,
      ),
      columns: region ? getComputedStyle(region).gridTemplateColumns.split(" ").length : 0,
    };
  });

  expect(layoutAudit).toEqual({
    rootOverflow: false,
    cardOverflow: false,
    columns: 1,
  });

  await expect(kpiRegion).toHaveScreenshot(
    "sprint3-dashboard-kpis-mobile.png",
    { animations: "disabled", caret: "hide" },
  );

  await page.getByLabel("Hizmet Türü:").selectOption(
    "Duvar boya ve badana",
  );
  await expect(kpiRegion.getByText("2 sa", { exact: true })).toBeVisible();
  await expect(kpiRegion.getByText("%0", { exact: true })).toBeVisible();

  await outsideAreaLink.click();
  await expect(page).toHaveURL(
    /\/admin\/bookings\?lead_quality=outside_area$/,
  );
  await expect(page.getByLabel("Talep kalitesi filtresi")).toHaveValue(
    "outside_area",
  );
});

test("operational KPIs use a three-column desktop layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installAuthenticatedSession(page);
  await mockAdminData(page);
  await page.goto("/admin/dashboard");

  const kpiRegion = page.getByRole("region", {
    name: "Operasyonel performans göstergeleri",
  });
  await expect(kpiRegion).toBeVisible();

  const layoutAudit = await kpiRegion.evaluate((region) => {
    const cards = Array.from(region.children);
    return {
      columns: getComputedStyle(region).gridTemplateColumns.split(" ").length,
      equalWidths:
        new Set(cards.map((card) => Math.round(card.getBoundingClientRect().width)))
          .size === 1,
      cardOverflow: cards.some(
        (card) => card.scrollWidth > card.clientWidth + 1,
      ),
    };
  });

  expect(layoutAudit).toEqual({
    columns: 3,
    equalWidths: true,
    cardOverflow: false,
  });
});
