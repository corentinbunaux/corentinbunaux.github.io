// Minimal static file server for the E2E suite (PORT-069): serves the
// `next build` static export (`out/`) the way GitHub Pages does, with no
// extra dependency (native `http`/`fs` only).
//
//   /                      -> out/index.html
//   /internships/safran    -> out/internships/safran.html (Next export, trailingSlash: false)
//   /some/dir/             -> out/some/dir/index.html
//   anything else missing  -> out/404.html with HTTP 404
//
// Usage: node e2e/static-server.mjs [port]   (default 4173, or $E2E_PORT)

import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)), "out");
const PORT = Number(process.argv[2] ?? process.env.E2E_PORT ?? 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".map": "application/json; charset=utf-8",
};

if (!existsSync(join(ROOT, "index.html"))) {
  // No silent fallback: an empty/missing export must fail loudly.
  console.error(`static-server: ${ROOT}/index.html not found — run \`npm run build\` first.`);
  process.exit(1);
}

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/** Resolve a URL pathname to a file inside ROOT, or null. */
function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const target = normalize(join(ROOT, decoded));
  // Refuse anything escaping ROOT (path traversal).
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;

  const candidates = decoded.endsWith("/")
    ? [join(target, "index.html")]
    : [target, `${target}.html`, join(target, "index.html")];
  const windowsSegment = windowsSegmentFile(target);
  if (windowsSegment) candidates.push(windowsSegment);
  return candidates.find(isFile) ?? null;
}

/**
 * Next 16.3.6 bug, Windows only: `next build` (output: "export") writes the
 * per-segment prefetch payloads that the client requests as
 * `<route>/__next.a.b.__PAGE__.txt` to `<route>/__next.a/b/__PAGE__.txt`
 * instead. `export/index.js` collects them with `path.relative()`, which
 * returns `\`-separated paths on Windows, then only replaces `/` with `.`
 * (`convertSegmentPathToStaticExportFilename`). On Linux — where CI and the
 * GitHub Pages deploy build — the files get the right flat names. Mapping
 * the request back to the Windows layout makes a local Windows run serve
 * what the Linux build would, instead of failing every client-side
 * navigation's prefetch with a 404 that production never shows.
 */
function windowsSegmentFile(target) {
  if (process.platform !== "win32") return null;
  const base = target.slice(target.lastIndexOf(sep) + 1);
  const match = /^__next\.(.+)\.txt$/.exec(base);
  if (!match) return null;
  const [first, ...rest] = match[1].split(".");
  if (rest.length === 0) return null;
  const dir = target.slice(0, target.lastIndexOf(sep));
  return `${join(dir, `__next.${first}`, ...rest)}.txt`;
}

function send(res, status, file, method) {
  const type = MIME[extname(file).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  if (method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = resolveFile(pathname);
  if (file) {
    send(res, 200, file, req.method);
    return;
  }
  const notFound = join(ROOT, "404.html");
  if (isFile(notFound)) {
    send(res, 404, notFound, req.method);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404 Not Found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`static-server: serving ${ROOT} on http://127.0.0.1:${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
