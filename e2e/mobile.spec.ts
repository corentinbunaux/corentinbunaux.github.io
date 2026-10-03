import type { Page } from "@playwright/test";
import { NAV_IDS, expect, navLink, open, test } from "./fixtures";

// Runs on the mobile-chrome (360px) and mobile-safari (iPhone 14, 390px)
// projects only: their device presets set the viewport, touch and UA.
test.skip(({ isMobile }) => !isMobile, "mobile device projects only");

async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
    const root = document.documentElement;
    const width = root.clientWidth;
    // Name the widest elements sticking out, so a failure says what to fix.
    const offenders = [...document.body.querySelectorAll<HTMLElement>("*")]
      .filter((el) => el.getBoundingClientRect().right > width + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}.${el.className}`.slice(0, 120));
    return { scrollWidth: root.scrollWidth, clientWidth: width, offenders };
  });
  expect(scrollWidth, `horizontal overflow, widest offenders: ${offenders.join(" | ")}`).toBeLessThanOrEqual(
    clientWidth,
  );
}

test.describe("mobile layout", () => {
  for (const path of ["/", "/emse/minesweeper", "/emse/programming", "/internships/quimesis", "/research/sncf"]) {
    test(`no horizontal scroll on ${path}`, async ({ page }) => {
      await open(page, path);
      // Let lazy/late content (images, demos) settle, then check top and bottom.
      await page.waitForLoadState("load");
      await expectNoHorizontalScroll(page);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expectNoHorizontalScroll(page);
    });
  }

  test("header nav fits the screen and every link is tappable", async ({ page }) => {
    await open(page, "/");
    const viewport = page.viewportSize()!;
    for (const id of NAV_IDS) {
      const box = (await navLink(page, id).boundingBox())!;
      expect(box.x, `${id} starts on screen`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `${id} ends on screen`).toBeLessThanOrEqual(viewport.width);
    }
    for (const id of ["about", "journey", "portfolio"] as const) {
      await navLink(page, id).tap();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`section#${id}`)).toBeInViewport();
    }
  });

  test("a project card opens its page by tap, and the header still works there", async ({ page }) => {
    await open(page, "/");
    const card = page.locator('#portfolio a[href="/emse/minesweeper"]');
    await card.scrollIntoViewIfNeeded();
    await card.tap();
    await expect(page).toHaveURL(/\/emse\/minesweeper$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Démineur");
    await navLink(page, "about").tap();
    await expect(page).toHaveURL(/\/#about$/);
    await expect(page.locator("section#about")).toBeInViewport();
  });

  test("minesweeper is playable by tap", async ({ page }) => {
    await open(page, "/emse/minesweeper");
    const grid = page.getByRole("grid", { name: /Grille du démineur/ });
    await grid.scrollIntoViewIfNeeded();
    const box = (await grid.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await grid.getByRole("gridcell", { name: "Ligne 5, colonne 5 : cachée" }).tap();
    await expect(grid.getByRole("gridcell", { name: /: cachée$/ })).not.toHaveCount(81);
  });
});
