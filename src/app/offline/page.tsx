import { WifiOffIcon } from "lucide-react";
import type { Metadata } from "next";

import { BentoTile } from "@/components/atoms/bento-tile";
import { Button } from "@/components/ui/button";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

export const metadata: Metadata = { title: id.offline.title, robots: { index: false } };

/**
 * Saved on the phone by the service worker (public/sw.js) and shown when a page is opened
 * without signal and has no saved copy. Static: no owner data, readable without JavaScript.
 */
export default function OfflinePage() {
  const copy = id.offline;
  return (
    <FocusLayout width="narrow">
      <BentoTile className="space-y-4 text-center">
        <WifiOffIcon aria-hidden className="mx-auto size-8 text-primary" />
        <h1 className="text-2xl font-bold text-balance">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.body}</p>
        <p className="text-muted-foreground">{copy.packHint}</p>
        {/* A plain link: the service worker answers it with the saved pack, if there is one. */}
        <Button asChild size="lg">
          <a href={ROUTES.pack}>{copy.openPack}</a>
        </Button>
      </BentoTile>
    </FocusLayout>
  );
}
