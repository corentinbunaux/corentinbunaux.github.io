import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite (PORT-069). Tests the artefact that is actually deployed: the
 * `next build` static export in `out/`, served by a tiny native-Node server
 * (`e2e/static-server.mjs`) that mimics GitHub Pages (extension-less routes
 * resolve to `<route>.html`, unknown paths get `404.html` with status 404).
 *
 * Port 4173, not 3000: a `next dev` server may already be running on 3000 on
 * the dev machine, and must not be reused or killed by the suite.
 *
 * `E2E_SKIP_BUILD=1 npm run test:e2e` reuses an existing `out/` (faster
 * local iterations); the default always rebuilds so the suite never runs
 * against a stale export.
 */
const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const serve = `node e2e/static-server.mjs ${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // Desktop presets are 1280px wide: >= 1024px, so the desktop-only three.js
  // demos are allowed to mount (useDesktopMotionGate). Mobile presets are
  // < 1024px, so the same demos must show their "desktop only" fallback.
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    // Safari: Playwright cannot drive the real macOS Safari app. Its WebKit
    // build is Apple's actual engine and is the standard way to test
    // "Safari" with Playwright — this project IS the Safari coverage.
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    // Edge: the real Microsoft Edge installed on the machine (channel), not
    // Playwright's bundled Chromium.
    { name: "edge-desktop", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        // Pixel 7's preset is 412px wide; the ticket's mobile acceptance
        // criterion is 360px (the narrowest common Android width), so the
        // viewport is narrowed while keeping the Pixel's UA, touch and DPR.
        viewport: { width: 360, height: 780 },
      },
    },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
  webServer: {
    command: process.env.E2E_SKIP_BUILD ? serve : `npm run build && ${serve}`,
    url: BASE_URL,
    // Never silently reuse whatever happens to listen on the port: a stale
    // server would test an old build.
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
