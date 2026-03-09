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

test.describe("Writing Practice", () => {
  test("WR-001: /writing-practice is reachable and interactive", async ({ page }) => {
    const response = await page.goto("/writing-practice", { waitUntil: "domcontentloaded" });
    expect(response).not.toBeNull();
    expect((response as NonNullable<typeof response>).status()).toBeLessThan(400);

    const interactive = page.locator("a,button,input,textarea").first();
    await expect(interactive).toBeVisible();
  });

  test("WR-002: long text in textarea does not break input behavior", async ({ page }) => {
    await page.goto("/writing-practice");
    const textarea = page.locator('textarea[placeholder*="Ví dụ"]').first();
    await expect(textarea).toBeVisible();

    const longText = "essay ".repeat(1200);
    await textarea.fill(longText);
    await expect(textarea).toHaveValue(longText);
  });
});
