import {
  LANGUAGE_KEY,
  THEME_KEY,
  chooseLanguage,
  expect,
  languageButton,
  navLink,
  open,
  reloadAndSettle,
  test,
  themeToggle,
} from "./fixtures";

const html = (page: import("@playwright/test").Page) => page.locator("html");

test.describe("theme", () => {
  test("follows the system preference when nothing is stored", async ({ browser }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await page.goto("/");
      await expect(html(page)).toHaveAttribute("data-theme", colorScheme);
      await context.close();
    }
  });

  test("toggle flips data-theme, persists across reload and navigation", async ({ page }) => {
    await open(page, "/");
    const initial = await html(page).getAttribute("data-theme");
    expect(initial === "light" || initial === "dark").toBe(true);
    const flipped = initial === "dark" ? "light" : "dark";

    await themeToggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", flipped);
    expect(await page.evaluate((key) => localStorage.getItem(key), THEME_KEY)).toBe(flipped);
    // The button's label now offers to switch back.
    await expect(themeToggle(page)).toHaveAccessibleName(
      initial === "dark" ? "Passer au thème sombre" : "Passer au thème clair",
    );

    await reloadAndSettle(page);
    await expect(html(page)).toHaveAttribute("data-theme", flipped);

    // Client-side navigation to a project page keeps it…
    await page.locator('#portfolio a[href="/internships/safran"]').click();
    await expect(page).toHaveURL(/\/internships\/safran$/);
    await expect(html(page)).toHaveAttribute("data-theme", flipped);
    // …and so does a full page load of another route (anti-flash script).
    await open(page, "/emse/android");
    await expect(html(page)).toHaveAttribute("data-theme", flipped);

    // Toggling back restores the original theme.
    await themeToggle(page).click();
    await expect(html(page)).toHaveAttribute("data-theme", initial!);
  });

  test("the page background actually changes with the theme", async ({ page }) => {
    await open(page, "/");
    const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const before = await background();
    await themeToggle(page).click();
    await expect.poll(background).not.toBe(before);
  });
});

test.describe("language", () => {
  test("defaults to French", async ({ page }) => {
    await open(page, "/");
    await expect(navLink(page, "portfolio")).toHaveText("Projets");
    await expect(languageButton(page)).toContainText("fr");
  });

  test("switching to English translates the page, persists across reload and navigation", async ({
    page,
  }) => {
    await open(page, "/");
    await chooseLanguage(page, "English");
    await expect(navLink(page, "portfolio")).toHaveText("Projects");
    await expect(navLink(page, "about")).toHaveText("About");
    await expect(page.locator("#home").getByRole("link", { name: "See my projects" })).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_KEY)).toBe("en");
    // The document language follows the content (screen readers, hyphenation).
    await expect(html(page)).toHaveAttribute("lang", "en");

    await reloadAndSettle(page);
    await expect(navLink(page, "portfolio")).toHaveText("Projects");

    // Client-side navigation: the Minesweeper card's title is localized.
    await page.locator('#portfolio a[href="/emse/minesweeper"]').click();
    await expect(page).toHaveURL(/\/emse\/minesweeper$/);
    // Generous timeout: in fully parallel 5-browser runs, this one soft
    // navigation (right after a reload, in English) was seen to take > 7s to
    // swap the DOM. In isolation (40/40 probe runs) it is well under 1s. Not
    // root-caused — see the PORT-069 journal.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Minesweeper", { timeout: 20_000 });
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();

    // Full page load of another route.
    await open(page, "/emse/embedded");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Embedded Systems");

    // And back to French.
    await chooseLanguage(page, "Français");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Systèmes Embarqués");
    await expect(html(page)).toHaveAttribute("lang", "fr");
  });

  test("language menu: Escape closes it, outside click closes it", async ({ page }) => {
    await open(page, "/");
    const button = languageButton(page);
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("heading", { level: 1, name: "Corentin Bunaux" }).click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
