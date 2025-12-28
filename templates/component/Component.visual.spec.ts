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
  // Responsive Viewport Tests
  // ===================================

  test("renders correctly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--primary&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-mobile.png",
    );
  });

  test("renders correctly on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-__component_name__--primary&viewMode=story`,
    );
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#storybook-root")).toHaveScreenshot(
      "__COMPONENT_NAME__-tablet.png",
    );
  });

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
