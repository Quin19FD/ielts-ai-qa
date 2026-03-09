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

test.describe("Authentication", () => {
  test("AUTH-001: register rejects malformed email", async ({ page }) => {
    await page.goto("/register");
    await page.locator('input[name="fullName"]').fill("Playwright QA");
    await page.locator('input[name="email"]').fill("user@@mail");
    await page.locator('input[name="password"]').fill("ValidPass123!");
    await page.getByRole("button", { name: /tạo tài khoản/i }).click();

    await expect(page).toHaveURL(/\/register$/);
    const emailInvalid = await page.locator('input[name="email"]').evaluate((el) => !((el as HTMLInputElement).checkValidity()));
    expect(emailInvalid).toBeTruthy();
  });

  test("AUTH-002: register requires mandatory fields", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /tạo tài khoản/i }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    const hasMovedForward = !/\/register$/.test(page.url());
    expect(hasMovedForward).toBeFalsy();
  });

  test("AUTH-003: login with invalid credentials stays on login page", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="identity"]').fill("notfound@example.com");
    await page.locator('input[name="password"]').fill("WrongPass123!");
    await page.getByRole("button", { name: /đăng nhập/i }).click();

    await page.waitForTimeout(1200);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('input[name="identity"]')).toBeVisible();
  });
});
