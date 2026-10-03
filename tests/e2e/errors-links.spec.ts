import { MISSING_PATH, expect, open, test } from "./fixtures";

const EMAIL = "mailto:corentin.bunaux@gmail.com";
const LINKEDIN = /^https?:\/\/(www\.)?linkedin\.com\/in\/corentin-bunaux\/?$/;
const GITHUB = "https://github.com/corentinbunaux";

test.describe("404", () => {
  test("an unknown URL returns a 404 page, not a blank crash", async ({ page }) => {
    const response = await page.goto(MISSING_PATH);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("404");
    await expect(page.getByText("This page could not be found.")).toBeVisible();
    // The site's own stylesheet/theme still applies (not an unstyled page).
    await expect(page.locator("html")).toHaveAttribute("data-theme", /^(light|dark)$/);
  });

  test("an unknown nested project URL also gets the 404 page", async ({ page }) => {
    const response = await page.goto("/internships/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("404");
  });
});

test.describe("external links", () => {
  test("footer contact links point to the right places and open safely", async ({ page }) => {
    await open(page, "/");
    const footer = page.locator("footer");
    const mail = footer.locator('a[href^="mailto:"]');
    await expect(mail).not.toHaveCount(0);
    for (const link of await mail.all()) {
      await expect(link).toHaveAttribute("href", EMAIL);
    }

    for (const [name, href] of [
      ["LinkedIn", LINKEDIN],
      ["GitHub", GITHUB],
    ] as const) {
      const links = footer.getByRole("link", { name, exact: true });
      await expect(links).not.toHaveCount(0);
      for (const link of await links.all()) {
        await expect(link).toHaveAttribute("href", href);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
      }
    }
  });

  test("hero contact links point to the right places", async ({ page }) => {
    await open(page, "/");
    const hero = page.locator("#home");
    await expect(hero.locator('a[href^="mailto:"]')).toHaveAttribute("href", EMAIL);
    await expect(hero.getByRole("link", { name: "Profil LinkedIn" })).toHaveAttribute("href", LINKEDIN);
    await expect(hero.getByRole("link", { name: "Profil GitHub" })).toHaveAttribute("href", GITHUB);
  });
});
