"use client";

import { DownloadIcon, PrinterIcon, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import * as id from "@/content/id";
import { trackPackOpenedAction, trackShareAction } from "@/lib/actions/owner";
import { PACK_ACTIONS_ID } from "@/lib/anchors";
import { ROUTES } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

const PRINT_DELAY_MS = 100;

function sendToWhatsApp() {
  void trackShareAction("kirim_wa");
}

function printPack() {
  void trackShareAction("cetak");
  setTimeout(() => window.print(), PRINT_DELAY_MS);
}

/**
 * "Kirim ke WhatsApp" (primary), "Unduh PDF" (a file made on the server: no print dialog, which
 * is many taps on Android), and "Cetak" on laptops. All three are logged as research events
 * (the download by the route handler).
 */
export function PackActions({ whatsAppUrl }: { whatsAppUrl: string }) {
  return (
    <div id={PACK_ACTIONS_ID} className="flex flex-col gap-3 sm:flex-row print:hidden">
      <Button asChild size="lg">
        <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" onClick={sendToWhatsApp}>
          <SendIcon aria-hidden />
          {id.pack.actions.whatsapp}
        </a>
      </Button>
      {/* A plain link: the response is a file download, so the page stays open. */}
      <Button asChild variant="outline" size="lg">
        <a href={ROUTES.packPdf}>
          <DownloadIcon aria-hidden />
          {id.pack.actions.pdf}
        </a>
      </Button>
      <Button variant="ghost" size="lg" onClick={printPack} className="hidden lg:inline-flex">
        <PrinterIcon aria-hidden />
        {id.pack.actions.print}
      </Button>
    </div>
  );
}

/**
 * Same two actions in the thumb zone on phones, shown once the actions at the top have
 * scrolled away (so the primary button never appears twice on screen).
 */
export function PackStickyActions({ whatsAppUrl }: { whatsAppUrl: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(PACK_ACTIONS_ID);
    if (!anchor) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-200 lg:hidden print:hidden",
        visible ? "translate-y-0" : "invisible translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-3xl gap-2">
        <Button asChild size="lg" className="flex-1">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={sendToWhatsApp}
            tabIndex={visible ? undefined : -1}
          >
            <SendIcon aria-hidden />
            {id.pack.actions.whatsapp}
          </a>
        </Button>
        <Button asChild variant="outline" size="icon-lg">
          <a
            href={ROUTES.packPdf}
            aria-label={id.pack.actions.pdf}
            tabIndex={visible ? undefined : -1}
          >
            <DownloadIcon aria-hidden />
          </a>
        </Button>
      </div>
    </div>
  );
}

/** Records `hasil_buka` (at most once per day, deduplicated server-side). Renders nothing. */
export function PackViewTracker() {
  useEffect(() => {
    void trackPackOpenedAction();
  }, []);
  return null;
}
