import type { Page } from "@playwright/test";
import { NAV_IDS, expect, languageButton, navLink, open, test, themeToggle } from "./fixtures";

type Focused = { navId: string | null; tag: string; label: string; focusVisible: boolean; outline: string };

async function focused(page: Page): Promise<Focused> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    const style = el ? getComputedStyle(el) : null;
    return {
      navId: el?.getAttribute("data-nav-id") ?? null,
      tag: el?.tagName.toLowerCase() ?? "",
      label: el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "",
      focusVisible: el ? el.matches(":focus-visible") : false,
      outline: style ? `${style.outlineStyle} ${style.outlineWidth}` : "",
    };
  });
}

test.describe("keyboard accessibility", () => {
  // A hardware-keyboard scenario: covered on the three desktop browsers.
  test.skip(({ isMobile }) => isMobile, "keyboard navigation is a desktop scenario");

  test("Tab walks the header in order with a visible focus ring", async ({ page, browserName }) => {
    await open(page, "/");
    // Whether WebKit's Tab key reaches links at all turns out to depend on
    // the OS the WebKit *binary* runs on, not just "is it WebKit": verified
    // directly on both machines this project actually runs on.
    // - Linux (CI's ubuntu-latest runner): WebKit does NOT skip links — it
    //   tabs through the header exactly like Chromium/Firefox.
    // - Windows (local dev machine): WebKit skips every link, landing
    //   straight on the two header buttons (then falls through to whatever
    //   the next focusable element after the header is — the projects
    //   filter pills — on further presses, which this test never reaches).
    // Keying this off `process.platform` instead of `browserName === "webkit"`
    // alone makes the test pass on both environments instead of only the one
    // it happened to be written against.
    const webkitSkipsLinks = browserName === "webkit" && process.platform !== "linux";
    const presses = webkitSkipsLinks ? 2 : 7;
    const seen: Focused[] = [];
    for (let i = 0; i < presses; i++) {
      await page.keyboard.press("Tab");
      seen.push(await focused(page));
    }
    // Name link (data-nav-id "home"), the four nav links (starting with
    // "Profil", also "home"), then language menu and theme toggle.
    const buttons = [expect.stringMatching(/^Changer de langue/), expect.stringMatching(/^Passer au thème/)];
    expect(seen.map((f) => f.navId ?? f.label)).toEqual(webkitSkipsLinks ? buttons : ["home", ...NAV_IDS, ...buttons]);
    for (const f of seen) {
      expect(f.focusVisible, `${f.label} matches :focus-visible`).toBe(true);
      expect(f.outline, `${f.label} has a visible outline`).toMatch(/^solid [1-9]/);
    }
  });

  test("Enter on a nav link activates it", async ({ page }) => {
    await open(page, "/");
    await navLink(page, "about").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator("section#about")).toBeInViewport();
  });

  test("Enter on a project card opens the project page", async ({ page }) => {
    await open(page, "/");
    await page.locator('#portfolio a[href="/research/sncf"]').focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/research\/sncf$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("SNCF");
  });

  test("language menu and theme toggle are operable from the keyboard", async ({ page }) => {
    await open(page, "/");
    await languageButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(languageButton(page)).toHaveAttribute("aria-expanded", "true");
    // Next focusable element after the open menu's button is "Français", then "English".
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "English", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(navLink(page, "portfolio")).toHaveText("Projects");
    // Choosing returns focus to the menu button.
    await expect(languageButton(page)).toBeFocused();

    const before = await page.locator("html").getAttribute("data-theme");
    await themeToggle(page).focus();
    await page.keyboard.press("Space");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before!);
  });
});
