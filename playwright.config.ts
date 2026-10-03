import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite (PORT-069). Tests the artefact that is actually deployed: the
 * `next build` static export in `out/`, served by a tiny native-Node server
 * (`tests/e2e/static-server.mjs`) that mimics GitHub Pages (extension-less routes
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
const serve = `node tests/e2e/static-server.mjs ${PORT}`;

/** Same lookup as Playwright's own "msedge" channel resolution. */
function edgeChannel(): { channel?: "msedge" } {
  const candidates =
    process.platform === "win32"
      ? [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"]]
          .filter((prefix): prefix is string => Boolean(prefix))
          .map((prefix) => join(prefix, "Microsoft", "Edge", "Application", "msedge.exe"))
      : process.platform === "darwin"
        ? ["/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"]
        : ["/opt/microsoft/msedge/msedge"];
  if (candidates.some((path) => existsSync(path))) return { channel: "msedge" };
  if (!process.env.TEST_WORKER_INDEX) {
    console.warn(
      "[playwright.config] Microsoft Edge not found: edge-desktop runs bundled Chromium with the Edge preset (not real Edge).",
    );
  }
  return {};
}

export default defineConfig({
  testDir: "./tests/e2e",
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
    // Edge: the real Microsoft Edge installed on the machine (channel
    // "msedge") whenever it is there. FALLBACK, stated loudly: on a machine
    // with no usable Edge (PORT-069's dev machine: `npx playwright install
    // msedge` failed with "Failed to install Microsoft Edge… insufficient
    // privileges", and the existing install has no msedge.exe), this project
    // runs Playwright's bundled Chromium with Edge's UA/viewport preset. Edge
    // is Chromium-based, so the engine is the same — but it is NOT a real-Edge
    // run, and the config prints a warning saying so.
    { name: "edge-desktop", use: { ...devices["Desktop Edge"], ...edgeChannel() } },
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
