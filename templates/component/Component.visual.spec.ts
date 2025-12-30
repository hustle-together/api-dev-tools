import { test, expect } from "@playwright/test";

/**
 * Visual Regression Tests for __COMPONENT_NAME__
 *
 * Created with Hustle UI Create workflow (v3.9.0)
 *
 * These tests capture screenshots of component variants in Storybook
 * and compare them against baseline images.
 *
 * Run with: pnpm playwright test __COMPONENT_NAME__.visual.spec.ts
 *
 * Update baselines: pnpm playwright test --update-snapshots
 */

const STORYBOOK_URL = process.env.STORYBOOK_URL || "http://localhost:6006";

test.describe("__COMPONENT_NAME__ Visual Regression", () => {
  // ===================================
  // Variant Screenshots
  // ===================================

  test("Primary variant matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--primary&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-primary.png",
    );
  });

  test("Secondary variant matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--secondary&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-secondary.png",
    );
  });

  test("Disabled state matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--disabled&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-disabled.png",
    );
  });

  test("Loading state matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--loading&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-loading.png",
    );
  });

  // ===================================
  // Size Variants (if applicable)
  // ===================================

  test("Small size matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--small&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-small.png",
    );
  });

  test("Large size matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--large&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-large.png",
    );
  });

  // ===================================
  // Responsive Viewport Tests (7 Viewports)
  // ===================================

  // All 7 viewports from performance-budgets.json
  const viewports = [
    { name: "mobile-portrait", width: 375, height: 667 },
    { name: "mobile-notch", width: 393, height: 852 },
    { name: "mobile-landscape", width: 667, height: 375 },
    { name: "tablet-portrait", width: 768, height: 1024 },
    { name: "tablet-landscape", width: 1024, height: 768 },
    { name: "small-desktop", width: 1280, height: 720 },
    { name: "desktop", width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`renders correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--primary&viewMode=story`,
      );
      await page.waitForLoadState("networkidle");

      await expect(page.locator("#storybook-root")).toHaveScreenshot(
        `__COMPONENT_NAME__-${viewport.name}.png`,
      );
    });
  }

  // ===================================
  // Interaction State Tests
  // ===================================

  test("hover state matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--primary&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    // Hover over the component
    await page.locator("#storybook-root > *").first().hover();

    // Wait for any hover transitions
    await page.waitForTimeout(300);

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-hover.png",
    );
  });

  test("focus state matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--primary&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    // Focus the component via keyboard
    await page.keyboard.press("Tab");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-focus.png",
    );
  });

  // ===================================
  // Dark Mode Tests (if supported)
  // ===================================

  test("dark mode matches baseline", async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--primary&viewMode=story&globals=theme:dark`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-dark.png",
    );
  });
});
