import { expect, test } from "@playwright/test";

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const path = `screenshots/e2e/${safeName(testInfo.title)}.png`;
    await page.screenshot({ path, fullPage: true });
    testInfo.attachments.push({ name: "failure-screenshot", path, contentType: "image/png" });
  }
});

test.describe("Speaking Practice", () => {
  test("SP-001: /speaking-practice route health and interaction", async ({ page }) => {
    const response = await page.goto("/speaking-practice", { waitUntil: "domcontentloaded" });
    expect(response).not.toBeNull();
    expect((response as NonNullable<typeof response>).status()).toBeLessThan(400);

    const interactive = page.locator("a,button,input,textarea").first();
    await expect(interactive).toBeVisible();
  });

  test("SP-002: responsive resize keeps controls accessible", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/speaking-practice");
    await expect(page.locator("a,button,input,textarea").first()).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator("a,button,input,textarea").first()).toBeVisible();
  });
});
