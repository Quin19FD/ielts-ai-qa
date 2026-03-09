import { expect, test } from "@playwright/test";

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const path = `screenshots/ui/${safeName(testInfo.title)}.png`;
    await page.screenshot({ path, fullPage: true });
    testInfo.attachments.push({ name: "failure-screenshot", path, contentType: "image/png" });
  }
});

test.describe("UI Components", () => {
  test("UI-001: skip link is keyboard focusable and updates hash", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip to main content")').first();
    await expect(skipLink).toBeVisible();
    await skipLink.click();

    await expect(page).toHaveURL(/#main-content$/);
  });

  test("UI-002: dashboard search input stays visible in current viewport", async ({ page }) => {
    await page.goto("/dashboard");
    const searchInput = page.locator('input[placeholder*="Tìm bài học"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("roadmap");
    await expect(searchInput).toHaveValue("roadmap");
  });

  test("UI-003: all homepage 'Bắt đầu miễn phí' CTAs route consistently", async ({ page }) => {
    await page.goto("/");
    const ctas = page.getByRole("link", { name: /bắt đầu miễn phí/i });
    const count = await ctas.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await page.goto("/");
      await ctas.nth(i).click();
      await expect(page).toHaveURL(/\/register$/);
    }
  });
});
