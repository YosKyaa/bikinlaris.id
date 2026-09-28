"use client";

import { PrinterIcon, SendIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { trackPackOpenedAction, trackShareAction } from "@/lib/actions/pack";

const PRINT_DELAY_MS = 100;

/** "Kirim ke WhatsApp" (primary) and "Cetak atau simpan PDF". Both are logged as research events. */
export function PackActions({ whatsAppUrl }: { whatsAppUrl: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row print:hidden">
      <Button asChild size="lg">
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void trackShareAction("kirim_wa")}
        >
          <SendIcon aria-hidden />
          {id.pack.actions.whatsapp}
        </a>
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          void trackShareAction("cetak");
          setTimeout(() => window.print(), PRINT_DELAY_MS);
        }}
      >
        <PrinterIcon aria-hidden />
        {id.pack.actions.print}
      </Button>
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
