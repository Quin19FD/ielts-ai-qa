import { expect, test } from "@playwright/test";

const CORE_ROUTES = [
  "/",
  "/dashboard",
  "/quick-test",
  "/writing-practice",
  "/speaking-practice",
  "/learning-roadmap",
];

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const path = `screenshots/crawl/${safeName(testInfo.title)}.png`;
    await page.screenshot({ path, fullPage: true });
    testInfo.attachments.push({ name: "failure-screenshot", path, contentType: "image/png" });
  }
});

test.describe("Navigation - Route Integrity", () => {
  test("NAV-001: homepage login entry navigates to /login", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator('a[href="/login"], a[href*="/login"]').first();
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('input[name="identity"]')).toBeVisible();
  });

  test("NAV-002: any primary register CTA routes to /register", async ({ page }) => {
    await page.goto("/");
    const registerLink = page.locator('a[href="/register"], a[href*="/register"]').first();
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
  });

  test("NAV-003: core routes render meaningful content and stay interactable", async ({ page }) => {
    for (const route of CORE_ROUTES) {
      await test.step(`visit ${route}`, async () => {
        const response = await page.goto(route, { waitUntil: "domcontentloaded" });
        expect(response, `No response for ${route}`).not.toBeNull();
        expect((response as NonNullable<typeof response>).status(), `Bad status for ${route}`).toBeLessThan(400);

        const contentLength = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim().length);
        expect(contentLength, `Blank/low-content page at ${route}`).toBeGreaterThan(80);

        const interactiveCount = await page.locator("a, button, input, textarea").count();
        expect(interactiveCount, `No interactable element at ${route}`).toBeGreaterThan(0);
      });
    }
  });
});
