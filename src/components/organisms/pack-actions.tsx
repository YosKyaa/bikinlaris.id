"use client";

import { PrinterIcon, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { trackPackOpenedAction, trackShareAction } from "@/lib/actions/pack";
import { PACK_ACTIONS_ID } from "@/lib/anchors";
import { cn } from "@/lib/utils";

const PRINT_DELAY_MS = 100;

function sendToWhatsApp() {
  void trackShareAction("kirim_wa");
}

function printPack() {
  void trackShareAction("cetak");
  setTimeout(() => window.print(), PRINT_DELAY_MS);
}

/** "Kirim ke WhatsApp" (primary) and "Cetak atau simpan PDF". Both are logged as research events. */
export function PackActions({ whatsAppUrl }: { whatsAppUrl: string }) {
  return (
    <div id={PACK_ACTIONS_ID} className="flex flex-col gap-3 sm:flex-row print:hidden">
      <Button asChild size="lg">
        <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" onClick={sendToWhatsApp}>
          <SendIcon aria-hidden />
          {id.pack.actions.whatsapp}
        </a>
      </Button>
      <Button variant="outline" size="lg" onClick={printPack}>
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
        "fixed inset-x-0 bottom-0 z-30 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-200 md:hidden print:hidden",
        visible ? "translate-y-0" : "invisible translate-y-full",
      )}
    >
      <div className="flex gap-2">
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
        <Button
          variant="outline"
          size="icon-lg"
          onClick={printPack}
          aria-label={id.pack.actions.print}
          tabIndex={visible ? undefined : -1}
        >
          <PrinterIcon aria-hidden />
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
