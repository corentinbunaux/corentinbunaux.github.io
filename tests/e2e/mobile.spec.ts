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

  for (const path of ["/emse/minesweeper", "/emse/programming", "/research/sncf"]) {
    test(`2D demo content stays inside its frame on ${path}`, async ({ page }) => {
      await open(page, path);
      const frames = page.locator('section[aria-labelledby="demo-heading"] figure > div.rounded-2xl');
      await expect(frames.first()).toBeVisible();
      // Interactive content is mounted client-side (next/dynamic).
      await expect(frames.first().locator("button, svg, canvas, input").first()).toBeAttached();
      const overflowing = await frames.evaluateAll((elements) =>
        elements.flatMap((frame) => {
          // The frame's content box: content spilling into its padding is
          // already off its own background (the minesweeper bug).
          const outer = frame.getBoundingClientRect();
          const style = getComputedStyle(frame);
          const left = outer.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
          const right = outer.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
          return [...frame.querySelectorAll<HTMLElement>("*")]
            .filter((el) => {
              const box = el.getBoundingClientRect();
              // width > 1: skip `.sr-only` text (a 1px box by design).
              return box.width > 1 && (box.left < left - 0.5 || box.right > right + 0.5);
            })
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()} "${el.getAttribute("aria-label") ?? el.textContent?.slice(0, 30)}"`);
        }),
      );
      expect(overflowing, "elements sticking out of a demo frame").toEqual([]);
    });
  }

  test("minesweeper is playable by tap", async ({ page }) => {
    await open(page, "/emse/minesweeper");
    const grid = page.getByRole("grid", { name: /Grille du démineur/ });
    await grid.scrollIntoViewIfNeeded();
    // The whole 9x9 grid fits inside the demo's frame (not just the
    // viewport: an overflow clipped by the frame hides the last column).
    const box = (await grid.boundingBox())!;
    const frame = (await grid
      .locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]")
      .boundingBox())!;
    expect(box.x, "grid left edge inside its frame").toBeGreaterThanOrEqual(frame.x);
    expect(box.x + box.width, "grid right edge inside its frame").toBeLessThanOrEqual(frame.x + frame.width);
    // …and every cell stays inside the grid (fixed-size cells in a grid
    // squeezed narrower than 9 cells overflow their own container).
    const lastCell = (await grid.getByRole("gridcell", { name: /^Ligne 1, colonne 9 / }).boundingBox())!;
    expect(lastCell.x + lastCell.width, "column 9 inside the grid").toBeLessThanOrEqual(box.x + box.width);
    await grid.getByRole("gridcell", { name: "Ligne 5, colonne 5 : cachée" }).tap();
    await expect(grid.getByRole("gridcell", { name: /: cachée$/ })).not.toHaveCount(81);
  });
});
