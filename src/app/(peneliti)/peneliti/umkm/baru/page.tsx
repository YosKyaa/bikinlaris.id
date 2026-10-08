import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ParticipantForm } from "@/components/organisms/participant-form";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

export const metadata: Metadata = { title: id.participant.newTitle };

export default function NewParticipantPage() {
  const copy = id.participant;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href={ROUTES.researcher}>
          <ArrowLeftIcon aria-hidden />
          {id.researcher.detail.back}
        </Link>
      </Button>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{copy.newTitle}</h1>
        <p className="text-muted-foreground">{copy.newSubtitle}</p>
      </header>
      <ParticipantForm />
    </div>
  );
}
