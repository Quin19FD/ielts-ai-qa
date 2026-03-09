import { expect, test } from "@playwright/test";

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function expectAppShellVisible(page: Parameters<typeof test>[0]["page"]) {
  const hasSearch = page.locator('input[placeholder*="Tìm bài học"]');
  const hasAuthCta = page.locator('a[href="/login"], a[href="/register"]');
  await expect(hasSearch.or(hasAuthCta).first()).toBeVisible();
}

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const path = `screenshots/e2e/${safeName(testInfo.title)}.png`;
    await page.screenshot({ path, fullPage: true });
    testInfo.attachments.push({ name: "failure-screenshot", path, contentType: "image/png" });
  }
});

test.describe("Quick Test", () => {
  test("QT-001: /quick-test renders usable content", async ({ page }) => {
    const response = await page.goto("/quick-test", { waitUntil: "domcontentloaded" });
    expect(response).not.toBeNull();
    expect((response as NonNullable<typeof response>).status()).toBeLessThan(400);

    await expectAppShellVisible(page);
    const bodyLength = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim().length);
    expect(bodyLength).toBeGreaterThan(80);
  });

  test("QT-002: reload and history navigation keep page interactive", async ({ page }) => {
    await page.goto("/quick-test");
    await expectAppShellVisible(page);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expectAppShellVisible(page);

    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/quick-test$/);
    await expectAppShellVisible(page);
  });
});
