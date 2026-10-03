import {
  HOME_SECTION_IDS,
  NAV_IDS,
  PROJECT_PAGES,
  expect,
  navLink,
  open,
  reloadAndSettle,
  test,
  waitForHydration,
} from "./fixtures";

test.describe("global navigation", () => {
  test("home page renders every section and the main nav", async ({ page }) => {
    await open(page, "/");
    await expect(page).toHaveTitle("Portfolio - Corentin Bunaux");
    for (const id of HOME_SECTION_IDS) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    await expect(page.getByRole("heading", { level: 1, name: "Corentin Bunaux" })).toBeVisible();
    for (const id of NAV_IDS) {
      await expect(navLink(page, id)).toBeVisible();
    }
  });

  test("header links scroll to each home section", async ({ page }) => {
    await open(page, "/");
    // Visit in an order that forces a real scroll each time (down, down, up).
    for (const id of ["journey", "about", "portfolio", "home"] as const) {
      await navLink(page, id).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`section#${id}`)).toBeInViewport();
      // The scroll-spy underline follows the section that was scrolled to.
      await expect(navLink(page, id)).toHaveAttribute("aria-current", "location");
    }
  });

  test("reloading the home page goes back to the top once, then settles", async ({ page }) => {
    await open(page, "/");
    await navLink(page, "about").click();
    await expect(page).toHaveURL(/#about$/);
    await reloadAndSettle(page);
    // The reload handler starts over from the top of "/" (no hash)…
    await expect(page).toHaveURL(/\/$/);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    // …exactly once: no endless redirect loop afterwards (regression: it
    // used to refetch the home RSC payload ~40 times/s).
    let requests = 0;
    page.on("request", (request) => {
      if (request.url().includes("_rsc=") || request.resourceType() === "document") requests += 1;
    });
    await page.waitForTimeout(1_500);
    expect(requests, "document/RSC requests in 1.5s after the reload settled").toBe(0);
    // And the first click right after a reload is not overridden.
    await page.locator('#portfolio a[href="/emse/android"]').click();
    await expect(page).toHaveURL(/\/emse\/android$/);
    await page.waitForTimeout(1_000);
    await expect(page).toHaveURL(/\/emse\/android$/);
  });

  test("after reloading a project page, header links to home sections keep their hash", async ({
    page,
  }) => {
    await open(page, "/emse/android");
    await page.reload();
    await waitForHydration(page);
    await navLink(page, "about").click();
    await expect(page).toHaveURL(/\/#about$/);
    await expect(page.locator("section#about")).toBeInViewport();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/#about$/);
  });

  test("hero CTA leads to the projects grid", async ({ page }) => {
    await open(page, "/");
    await page.locator("#home").getByRole("link", { name: /Voir mes projets/ }).click();
    await expect(page).toHaveURL(/#portfolio$/);
    await expect(page.locator("#section-portfolio")).toBeInViewport();
  });

  test("project-grid filters narrow the cards and 'all' restores them", async ({ page }) => {
    await open(page, "/");
    const cards = page.locator("#portfolio a[href^='/']");
    await expect(cards).toHaveCount(PROJECT_PAGES.length);
    const filters = page.getByRole("group", { name: /Filtrer|Filter/ });
    await filters.getByRole("button", { name: "Recherche" }).click();
    await expect(filters.getByRole("button", { name: "Recherche" })).toHaveAttribute("aria-pressed", "true");
    const narrowed = await cards.count();
    expect(narrowed).toBeGreaterThan(0);
    expect(narrowed).toBeLessThan(PROJECT_PAGES.length);
    await filters.getByRole("button", { name: "Tous" }).click();
    await expect(cards).toHaveCount(PROJECT_PAGES.length);
  });

  for (const project of PROJECT_PAGES) {
    test(`grid card -> ${project.path} -> back home`, async ({ page }) => {
      await open(page, "/");
      const card = page.locator(`#portfolio a[href="${project.path}"]`);
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await expect(page).toHaveURL(new RegExp(`${project.path}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.titleFr);
      // Breadcrumb ends on the current page.
      const breadcrumb = page.getByRole("navigation", { name: /Fil d'Ariane|Breadcrumb/ });
      await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(project.titleFr);
      // On a project page, the header marks "Projets" as the current section.
      await expect(navLink(page, "portfolio")).toHaveAttribute("aria-current", "location");

      await breadcrumb.getByRole("link", { name: "Accueil" }).click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("section#home")).toBeVisible();
    });
  }

  test("project page header nav returns to the home projects section", async ({ page }) => {
    await open(page, "/emse/android");
    await navLink(page, "portfolio").click();
    await expect(page).toHaveURL(/\/#portfolio$/);
    await expect(page.locator("section#portfolio")).toBeInViewport();
  });

  test("'next project' links chain through every project page", async ({ page }) => {
    test.slow(); // walks all 12 pages in one test
    const titleByPath = new Map(PROJECT_PAGES.map((p) => [p.path, p.titleFr]));
    // Start from the page that has no "previous" link (the head of the chain).
    let start = PROJECT_PAGES[0].path;
    for (const project of PROJECT_PAGES) {
      await open(page, project.path);
      const between = page.getByRole("navigation", { name: "Navigation entre projets" });
      if ((await between.getByRole("link", { name: /Projet précédent/ }).count()) === 0) {
        start = project.path;
        break;
      }
    }

    const visited = [start];
    await open(page, start);
    for (;;) {
      const nextLink = page
        .getByRole("navigation", { name: "Navigation entre projets" })
        .getByRole("link", { name: /Projet suivant/ });
      if ((await nextLink.count()) === 0) break;
      const href = await nextLink.getAttribute("href");
      expect(titleByPath.has(href!), `next link ${href} is a known project route`).toBe(true);
      if (visited.includes(href!)) break; // the chain wraps around
      await nextLink.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(titleByPath.get(href!)!);
      visited.push(href!);
    }
    expect(visited.sort()).toEqual([...titleByPath.keys()].sort());
  });

  test("footer project links open the right pages", async ({ page }) => {
    await open(page, "/");
    const footerProjects = page.locator("footer").getByRole("navigation", { name: "Projets" });
    await footerProjects.getByRole("link", { name: "SNCF" }).click();
    await expect(page).toHaveURL(/\/research\/sncf$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("SNCF");
  });
});
