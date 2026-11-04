"use client";

import { useEffect, useRef } from "react";

import { TURNSTILE_SCRIPT_URL, TURNSTILE_SIGNUP_ACTION } from "@/lib/security/turnstile-config";

/** The part of Cloudflare's widget API used here (developers.cloudflare.com/turnstile). */
interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoading: Promise<TurnstileApi> | null = null;

/** Loads the widget script once per page; a failed load can be retried on the next mount. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptLoading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error()));
    script.onerror = () => {
      scriptLoading = null;
      script.remove();
      reject(new Error());
    };
    document.head.append(script);
  });
  return scriptLoading;
}

/**
 * Cloudflare Turnstile ("bukan robot"). Most people never see it: it only shows a box when
 * Cloudflare is unsure. Hands the token up; a new `resetKey` starts a fresh check (tokens are
 * single use, so after a refused sign-up).
 */
export function TurnstileWidget({
  siteKey,
  resetKey,
  onToken,
  onUnavailable,
}: {
  siteKey: string;
  resetKey: number;
  onToken: (token: string | null) => void;
  /** The script or the check could not load (offline, blocked). */
  onUnavailable: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onToken, onUnavailable });
  useEffect(() => {
    callbacks.current = { onToken, onUnavailable };
  });

  useEffect(() => {
    let cancelled = false;
    let remove: (() => void) | null = null;
    callbacks.current.onToken(null);
    loadTurnstile()
      .then((api) => {
        if (cancelled || !container.current) return;
        const widgetId = api.render(container.current, {
          sitekey: siteKey,
          action: TURNSTILE_SIGNUP_ACTION,
          language: "id",
          theme: "light",
          size: "flexible",
          appearance: "interaction-only",
          "refresh-expired": "auto",
          callback: (token: string) => callbacks.current.onToken(token),
          "expired-callback": () => callbacks.current.onToken(null),
          "error-callback": () => {
            callbacks.current.onToken(null);
            callbacks.current.onUnavailable();
          },
        });
        remove = () => api.remove(widgetId);
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onUnavailable();
      });
    return () => {
      cancelled = true;
      remove?.();
    };
  }, [siteKey, resetKey]);

  return <div ref={container} />;
}
