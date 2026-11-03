import { MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CopyField } from "@/components/molecules/copy-field";
import { AuthLayout } from "@/components/templates/auth-layout";
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
    <AuthLayout
      showcase="owner"
      intro={{ eyebrow: copy.code(business.code), title: copy.title, body: copy.saveBody }}
    >
      <section aria-labelledby="simpan-tautan" className="space-y-5">
        <h2 id="simpan-tautan" className="text-2xl font-semibold tracking-tight">
          {copy.saveTitle}
        </h2>
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
        <Button asChild size="lg" className="w-full">
          <Link href={ROUTES.start}>{copy.start}</Link>
        </Button>
      </section>
      <Toaster position="top-center" />
    </AuthLayout>
  );
}
