import { expect, open, test } from "./fixtures";

test.describe("2D demos", () => {
  test("minesweeper: first click reveals cells, flag mode places a flag, new game resets", async ({
    page,
  }) => {
    await open(page, "/emse/minesweeper");
    const demo = page.locator('section[aria-labelledby="demo-heading"]');
    const grid = demo.getByRole("grid", { name: /Grille du démineur/ });
    const minesLeft = demo.locator("span", { hasText: "Mines restantes" });
    const timer = demo.locator("span", { hasText: "Temps" });
    await grid.scrollIntoViewIfNeeded();
    const hidden = grid.getByRole("gridcell", { name: /: cachée$/ });
    await expect(grid.getByRole("gridcell")).toHaveCount(81);
    await expect(hidden).toHaveCount(81);
    await expect(minesLeft).toHaveText("Mines restantes : 10");

    // The first click is always safe and, with no adjacent mine, cascades.
    await grid.getByRole("gridcell", { name: "Ligne 5, colonne 5 : cachée" }).click();
    await expect(grid.getByRole("gridcell", { name: /^Ligne 5, colonne 5 : \d mine\(s\) autour$/ })).toHaveCount(1);
    const stillHidden = await hidden.count();
    expect(stillHidden).toBeLessThan(81);
    // The timer started.
    await expect(timer).toHaveText(/^Temps : [1-9]\d* s$/, { timeout: 4_000 });

    // Flag mode (works the same on touch and mouse): flag one hidden cell.
    const flagMode = demo.getByRole("button", { name: "Mode drapeau" });
    await flagMode.click();
    await expect(flagMode).toHaveAttribute("aria-pressed", "true");
    const target = hidden.first();
    const targetName = (await target.getAttribute("aria-label"))!;
    await target.click();
    await expect(
      grid.getByRole("gridcell", { name: targetName.replace(/cachée$/, "drapeau") }),
    ).toHaveCount(1);
    await expect(minesLeft).toHaveText("Mines restantes : 9");

    await demo.getByRole("button", { name: "Nouvelle partie" }).click();
    await expect(hidden).toHaveCount(81);
    await expect(minesLeft).toHaveText("Mines restantes : 10");
  });
});

test.describe("three.js demos", () => {
  test("Quimesis demo section mounts WebGL canvases on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "3D demos are desktop-only; the mobile fallback is tested below");
    await open(page, "/internships/quimesis");
    const demo = page.locator('section[aria-labelledby="demo-heading"]');
    await demo.scrollIntoViewIfNeeded();
    const canvases = demo.locator("canvas");
    await expect(canvases).toHaveCount(2); // fragments + jaw
    for (const canvas of await canvases.all()) {
      await canvas.scrollIntoViewIfNeeded();
      await expect(canvas).toBeVisible();
      const box = await canvas.boundingBox();
      expect(box!.width).toBeGreaterThan(100);
      expect(box!.height).toBeGreaterThan(50);
      // A real WebGL context was obtained (not a blank fallback canvas).
      expect(
        await canvas.evaluate((el: HTMLCanvasElement) => {
          const gl = el.getContext("webgl2") ?? el.getContext("webgl");
          return gl !== null && !gl.isContextLost();
        }),
      ).toBe(true);
    }
    await expect(demo.getByText(/s'affiche sur un écran large/)).toHaveCount(0);
  });

  test("Safran inline Earth scene mounts a canvas on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "3D demos are desktop-only");
    await open(page, "/internships/safran");
    const canvas = page.locator("main canvas");
    await expect(canvas).toHaveCount(1);
    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toBeVisible();
  });

  test("3D demos show the desktop-only fallback on mobile, with no canvas", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "mobile-only fallback");
    await open(page, "/internships/quimesis");
    const demo = page.locator('section[aria-labelledby="demo-heading"]');
    await demo.scrollIntoViewIfNeeded();
    await expect(demo.getByText(/s'affiche sur un écran large/)).toHaveCount(2);
    await expect(page.locator("main canvas")).toHaveCount(0);
  });
});
