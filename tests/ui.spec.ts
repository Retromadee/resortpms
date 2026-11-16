import { test, expect } from "@playwright/test";

test.describe("Login Page UI", () => {
  test("renders brand, demo buttons, and switches language instantly", async ({ page }) => {
    await page.goto("/login");

    // Brand and headline
    await expect(page.locator(".login-brand")).toContainText("The Resort");
    await expect(page.locator("h1")).toContainText("Sign in to your workspace");

    // All 5 roles visible
    await expect(page.locator("text=Administrator · Taylor Chen")).toBeVisible();
    await expect(page.locator("text=Management · Alex Morgan")).toBeVisible();
    await expect(page.locator("text=Maintenance Worker · Sam Rivera")).toBeVisible();
    await expect(page.locator("text=Resident Owner · Casey Reed")).toBeVisible();
    await expect(page.locator("text=Resort Guest · Jordan Lee")).toBeVisible();

    // Language toggle to Turkish
    const trButton = page.locator("button[title='Türkçe']");
    await trButton.click();

    // Verify instant in-place translation
    await expect(page.locator("h1")).toContainText("Çalışma alanınıza giriş yapın");
    await expect(page.locator(".demo-access-section")).toContainText("1-DOKUNUŞ DEMO GİRİŞİ");

    // Toggle back to English
    const enButton = page.locator("button[title='English']");
    await enButton.click();
    await expect(page.locator("h1")).toContainText("Sign in to your workspace");
    await expect(page.locator(".demo-access-section")).toContainText("1-TAP DEMO SIGN-IN");
  });
});

test.describe("Workspace Responsiveness & Navigation", () => {
  test("guest workspace renders cleanly without horizontal overflow", async ({ page }) => {
    const isNarrow = (page.viewportSize()?.width ?? 1000) <= 760;

    await page.context().addCookies([
      { name: "resort_demo_role", value: "guest", domain: "localhost", path: "/" },
      { name: "resort_lang", value: "en", domain: "localhost", path: "/" },
    ]);

    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Welcome to The Resort");

    // Check horizontal overflow (page shouldn't scroll sideways)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });
    expect(hasHorizontalScroll).toBe(false);

    if (isNarrow) {
      // Sidebar should be hidden, bottom nav visible
      await expect(page.locator(".sidebar")).toBeHidden();
      await expect(page.locator(".mobile-bottom-nav")).toBeVisible();
    } else {
      // Desktop: sidebar should be visible
      await expect(page.locator(".sidebar")).toBeVisible();
    }
  });

  test("management workspace stats and dashboard grid adapt to viewport", async ({ page }) => {
    await page.context().addCookies([
      { name: "resort_demo_role", value: "management", domain: "localhost", path: "/" },
      { name: "resort_lang", value: "en", domain: "localhost", path: "/" },
    ]);

    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Resort operations, live");

    // Verify stats grid cards are rendered
    const statCards = page.locator(".stat-card");
    await expect(statCards).toHaveCount(4);

    // Verify no overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test("ticket modal opens, renders form, and closes properly", async ({ page }) => {
    await page.context().addCookies([
      { name: "resort_demo_role", value: "guest", domain: "localhost", path: "/" },
    ]);

    await page.goto("/?view=tickets");
    await expect(page.locator(".page-heading")).toBeVisible();

    // Open ticket modal
    await page.locator("button:has-text('New request')").first().click();
    const modal = page.locator(".modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("h2")).toContainText("Raise a service request");

    // Close modal
    await modal.locator("button:has-text('Cancel')").click();
    await expect(modal).toBeHidden();
  });

  test("amenities booking view renders cards and availability picker", async ({ page }) => {
    await page.context().addCookies([
      { name: "resort_demo_role", value: "guest", domain: "localhost", path: "/" },
    ]);

    await page.goto("/?view=bookings");
    await expect(page.locator(".booking-card")).toHaveCount(5);
    await expect(page.locator(".booking-form")).toBeVisible();
  });
});
