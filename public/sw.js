/*
 * bikinlaris.id service worker: the owner's SOP pack still opens on a weak or missing signal.
 *
 * - /paket (the pack): network first; after NETWORK_TIMEOUT_MS, or without network, the copy
 *   saved on this phone. Every good network answer refreshes that copy.
 * - /_next/static (hashed build files): saved once, served from the phone.
 * - Other pages: network only; without network, the saved pack (owner pages) or /offline.
 * - Never saved: the team panel, sign-in, API routes, the private link (/u/...), the PDF route,
 *   React Server Component requests and anything that is not a GET.
 * - The saved pack is deleted when the owner signs out, opens another private link, or the
 *   server no longer serves a pack.
 *
 * Bump VERSION to drop every saved file after a breaking change.
 */
const VERSION = "v1";
const PREFIX = "bikinlaris-";
const PAGES = `${PREFIX}pages-${VERSION}`;
const ASSETS = `${PREFIX}assets-${VERSION}`;
const PACK_PATH = "/paket";
const OFFLINE_PATH = "/offline";
const OWNER_PATHS = ["/beranda", "/paket", "/diagnosis"];
const NEVER_SAVE = [
  /^\/tim(\/|$)/,
  /^\/api\//,
  /^\/auth\//,
  /^\/u\//,
  /^\/masuk/,
  /^\/daftar/,
  /^\/paket\/unduh/,
];
const NETWORK_TIMEOUT_MS = 4000;
const MAX_ASSETS = 160;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.add(new Request(OFFLINE_PATH, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(PREFIX) && key !== PAGES && key !== ASSETS)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const isStatic = (url) => url.pathname.startsWith("/_next/static/");
const isOwnerPath = (path) => OWNER_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
const isRsc = (request, url) => request.headers.get("RSC") === "1" || url.searchParams.has("_rsc");
const savable = (response) => response.ok && response.type === "basic" && !response.redirected;
const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(null), ms));

async function forgetPack() {
  const cache = await caches.open(PAGES);
  await cache.delete(PACK_PATH);
}

/** Keeps the asset cache small on low-storage phones: oldest entries go first. */
async function trimAssets() {
  const cache = await caches.open(ASSETS);
  const keys = await cache.keys();
  await Promise.all(
    keys.slice(0, Math.max(0, keys.length - MAX_ASSETS)).map((key) => cache.delete(key)),
  );
}

async function offlinePage() {
  const cache = await caches.open(PAGES);
  return (await cache.match(OFFLINE_PATH)) ?? Response.error();
}

async function savedPackOrOffline() {
  const cache = await caches.open(PAGES);
  return (await cache.match(PACK_PATH)) ?? offlinePage();
}

async function packPage(request) {
  const cache = await caches.open(PAGES);
  const network = fetch(request).then(async (response) => {
    if (savable(response)) await cache.put(PACK_PATH, response.clone());
    // A redirect means there is no pack to show any more (signed out, started over).
    else if (response.type === "opaqueredirect" || response.redirected) await forgetPack();
    return response;
  });
  const saved = await cache.match(PACK_PATH);
  if (!saved) return network.catch(() => offlinePage());
  const first = await Promise.race([network.catch(() => null), wait(NETWORK_TIMEOUT_MS)]);
  return first ?? saved;
}

async function otherPage(request, url) {
  try {
    return await fetch(request);
  } catch {
    return isOwnerPath(url.pathname) ? savedPackOrOffline() : offlinePage();
  }
}

async function staticFile(request) {
  const cache = await caches.open(ASSETS);
  const saved = await cache.match(request);
  if (saved) return saved;
  const response = await fetch(request);
  if (savable(response)) {
    await cache.put(request, response.clone());
    await trimAssets();
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isRsc(request, url)) return;

  if (request.mode === "navigate") {
    const signedOut = url.pathname === "/cara-ikut" && url.searchParams.get("info") === "keluar";
    if (signedOut || url.pathname.startsWith("/u/")) event.waitUntil(forgetPack());
    if (NEVER_SAVE.some((pattern) => pattern.test(url.pathname))) return;
    event.respondWith(url.pathname === PACK_PATH ? packPage(request) : otherPage(request, url));
    return;
  }
  if (isStatic(url)) event.respondWith(staticFile(request));
});

/**
 * The page tells the worker which build files it loaded before the worker was in control, so
 * the pack also opens offline after the very first visit.
 */
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "save-page" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const assets = await caches.open(ASSETS);
      const pages = await caches.open(PAGES);
      for (const value of data.urls.slice(0, MAX_ASSETS)) {
        if (typeof value !== "string") continue;
        const url = new URL(value, self.location.origin);
        if (url.origin !== self.location.origin) continue;
        try {
          if (isStatic(url) && !(await assets.match(url.href))) {
            const response = await fetch(url.href);
            if (savable(response)) await assets.put(url.href, response);
          } else if (url.pathname === PACK_PATH) {
            const response = await fetch(url.href, { credentials: "same-origin" });
            if (savable(response)) await pages.put(PACK_PATH, response);
          }
        } catch {
          // Offline right now: the next visit tries again.
        }
      }
      await trimAssets();
    })(),
  );
});
