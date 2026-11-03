import { CircleCheckIcon, MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CopyField } from "@/components/molecules/copy-field";
import { FocusLayout } from "@/components/templates/focus-layout";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { id } from "@/content/id";
import { ownerLinkUrl } from "@/lib/app-url";
import { ROUTES } from "@/lib/auth/constants";
import { getOwnerState } from "@/lib/data/owner-session";
import { whatsAppUrl } from "@/lib/diagnosis/whatsapp";

export const metadata: Metadata = { title: id.signup.done.title };

/**
 * After self-registration: the participant code, and one tap to keep the private link in the
 * owner's own WhatsApp (the cookie alone is lost with a new phone or cleared browser).
 */
export default async function SignupDonePage() {
  const state = await getOwnerState();
  if (!state) redirect(ROUTES.signup);
  const { business } = state;
  const copy = id.signup.done;
  const link = await ownerLinkUrl(state.token);
  const message = id.researcher.messages.link(
    business.ownerName,
    business.name,
    link,
    business.code,
  );

  return (
    <FocusLayout width="narrow">
      <div className="space-y-6">
        <header className="space-y-2 text-center">
          <CircleCheckIcon aria-hidden className="mx-auto size-12 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
          <p className="text-lg font-semibold tabular-nums">{copy.code(business.code)}</p>
        </header>

        <section
          aria-labelledby="simpan-tautan"
          className="space-y-4 rounded-xl border bg-background p-5 shadow-card"
        >
          <div>
            <h2 id="simpan-tautan" className="text-lg font-semibold">
              {copy.saveTitle}
            </h2>
            <p className="text-muted-foreground">{copy.saveBody}</p>
          </div>
          <Button asChild variant="outline" size="lg" className="w-full">
            <a
              href={whatsAppUrl(message, business.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircleIcon aria-hidden />
              {copy.saveWhatsApp}
            </a>
          </Button>
          <CopyField
            label={id.researcher.detail.link}
            value={link}
            copyLabel={id.researcher.actions.copyLink}
            copiedMessage={id.researcher.actions.copied}
            failedMessage={id.researcher.actions.copyFailed}
          />
        </section>

        <Button asChild size="lg" className="w-full">
          <Link href={ROUTES.start}>{copy.start}</Link>
        </Button>
      </div>
      <Toaster position="top-center" />
    </FocusLayout>
  );
}
