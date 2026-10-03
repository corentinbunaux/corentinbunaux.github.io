import { test as base, expect, type Page } from "@playwright/test";
import { projects } from "../../src/data/projects";

/** Every project route, with the title its `<h1>` shows in each language. */
export const PROJECT_PAGES = projects.map((project) => ({
  path: `/${project.href}`,
  href: project.href,
  titleFr: project.title.fr,
  titleEn: project.title.en,
}));

export const HOME_SECTION_IDS = ["home", "journey", "portfolio", "about", "footer"] as const;
export const NAV_IDS = ["home", "journey", "portfolio", "about"] as const;

/** A route that does not exist, requested on purpose by the 404 test. */
export const MISSING_PATH = "/this-page-does-not-exist";

export const THEME_KEY = "corentinbunaux.theme";
export const LANGUAGE_KEY = "corentinbunaux.language";

/**
 * The site is a static export: the HTML is visible before React hydrates,
 * and a click on a button before hydration is silently lost. Wait until the
 * header's theme toggle carries React's internal props (attached during
 * hydration) before interacting with anything stateful.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const button = document.querySelector("header button");
    return button !== null && Object.keys(button).some((key) => key.startsWith("__reactProps"));
  });
}

/** Navigate and wait for hydration. */
export async function open(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForHydration(page);
}

/**
 * Reload and wait for hydration. Reloading the home page makes HomeShell
 * replace the document with a fresh load of "/" right after hydration:
 * wait for that second document (navigation type "navigate"), not the first.
 */
export async function reloadAndSettle(page: Page): Promise<void> {
  const onHome = new URL(page.url()).pathname === "/";
  await page.reload();
  if (onHome) await expect.poll(() => navigationType(page)).toBe("navigate");
  await waitForHydration(page);
}

/** The current document's navigation type ("navigate", "reload", …). */
export async function navigationType(page: Page): Promise<string> {
  try {
    return await page.evaluate(
      () => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type,
    );
  } catch {
    // The document is being replaced mid-evaluate: report it as such and let
    // the caller's poll retry.
    return "navigating";
  }
}

/** The header's theme toggle (its label names the theme it switches *to*). */
export function themeToggle(page: Page) {
  return page.locator("header").getByRole("button", {
    name: /Passer au thème|Switch to (light|dark) theme/,
  });
}

/** The header's language menu button. */
export function languageButton(page: Page) {
  return page.locator("header").getByRole("button", { name: /Changer de langue|Change language/ });
}

export async function chooseLanguage(page: Page, language: "Français" | "English"): Promise<void> {
  await languageButton(page).click();
  await page.locator("header").getByRole("button", { name: language, exact: true }).click();
}

export function navLink(page: Page, id: (typeof NAV_IDS)[number]) {
  return page.locator(`header nav a[data-nav-id="${id}"]`);
}

/**
 * Every test fails on an uncaught page exception or a `console.error`:
 * a demo that throws in one engine but not another (WebGL, an unsupported
 * API) is exactly the kind of cross-browser bug this suite exists to catch,
 * and it would otherwise go unnoticed behind a passing DOM assertion.
 */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => {
        // WebKit only: when a document is replaced (HomeShell's reload
        // handler calls location.replace("/")), WebKit rejects the router's
        // in-flight prefetches — RSC payload requests (with a `?_rsc=`
        // query string) and plain route prefetches alike — with "<url> due
        // to access control checks." and reports them as uncaught; Chromium
        // aborts them silently. Narrowed to `_rsc=` at first, which missed
        // the plain-route shape (seen for real on CI: "/cpge_tipe due to
        // access control checks."); this site is single-origin static
        // export with no other source of a WebKit access-control rejection,
        // so matching the ending alone is still specific to this artifact.
        if (/due to access control checks\.$/.test(error.message)) return;
        errors.push(`pageerror: ${error.message}`);
      });
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        // The browser's own "Failed to load resource" line carries no URL;
        // failed responses are recorded below, with their URL, instead.
        if (/^Failed to load resource/.test(text)) return;
        errors.push(`console.error: ${text}`);
      });
      page.on("response", (response) => {
        if (response.status() < 400) return;
        const url = new URL(response.url());
        // The 404 tests request missing pages on purpose (navigation
        // responses only); any other failed request (a broken image, a
        // missing chunk or RSC payload) still fails the test.
        if (response.request().isNavigationRequest() && response.status() === 404) return;
        errors.push(`HTTP ${response.status()}: ${url.pathname}${url.search}`);
      });
      await use(errors);
      expect(errors, "uncaught errors / console.error during the test").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
