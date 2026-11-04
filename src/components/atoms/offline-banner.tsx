"use client";

import { WifiOffIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** Rendered on the server and during hydration as "online": nothing to show. */
const isOffline = () => !navigator.onLine;
const onServer = () => false;

/**
 * "Anda sedang offline": shown while the phone has no connection, so the owner knows the pack
 * on screen is the copy saved on the phone and the coach or WhatsApp will not work yet.
 */
export function OfflineBanner({ message }: { message: string }) {
  const offline = useSyncExternalStore(subscribe, isOffline, onServer);
  if (!offline) return null;
  return (
    <p
      role="status"
      className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-warning print:hidden"
    >
      <WifiOffIcon aria-hidden className="mt-0.5 size-5 shrink-0" />
      {message}
    </p>
  );
}
