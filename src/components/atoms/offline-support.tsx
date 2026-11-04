"use client";

import { useEffect } from "react";

const WORKER_URL = "/sw.js";
const STATIC_PREFIX = "/_next/static/";

/**
 * Registers the service worker (public/sw.js) on owner pages and tells it which build files
 * this page loaded, so the pack opens without signal from the next visit on. Production only:
 * in development a worker would serve stale files. Renders nothing.
 */
export function OfflineSupport() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register(WORKER_URL, { scope: "/", updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        const loaded = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => new URL(url).pathname.startsWith(STATIC_PREFIX));
        registration.active?.postMessage({
          type: "save-page",
          urls: [window.location.pathname, ...loaded],
        });
      })
      .catch(() => {
        // No offline copy on this phone; the site itself works as before.
      });
  }, []);
  return null;
}
