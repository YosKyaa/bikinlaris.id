import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ParticipantForm } from "@/components/organisms/participant-form";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { localWhatsApp } from "@/lib/validations/participant";

export const metadata: Metadata = { title: id.researcher.actions.edit };

export default async function EditParticipantPage({
  params,
}: PageProps<"/peneliti/umkm/[id]/ubah">) {
  const businessId = z.uuid().safeParse((await params).id);
  if (!businessId.success) notFound();
  const participant = await data().staff.getParticipant(businessId.data);
  if (!participant) notFound();

  const { business } = participant;
  const copy = id.participant;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href={ROUTES.researcherBusiness(business.id)}>
          <ArrowLeftIcon aria-hidden />
          {id.common.back}
        </Link>
      </Button>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          {copy.editTitle(business.name)}
        </h1>
        <p className="text-muted-foreground">{copy.editSubtitle}</p>
      </header>
      <ParticipantForm
        businessId={business.id}
        defaults={{
          ownerName: business.ownerName,
          whatsapp: localWhatsApp(business.whatsapp),
          name: business.name,
          product: business.product,
          sector: business.sector,
          location: business.location,
          yearsRunning: business.yearsRunning,
          employees: business.employees,
          ownerRole: business.ownerRole,
        }}
      />
    </div>
  );
}
