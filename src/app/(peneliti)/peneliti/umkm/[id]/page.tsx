import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BusinessDetail } from "@/components/organisms/business-detail";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { getBusinessDetail } from "@/lib/data/research";

export const metadata: Metadata = { title: id.researcher.title };

export default async function ResearcherBusinessPage({ params }: PageProps<"/peneliti/umkm/[id]">) {
  const detail = await getBusinessDetail((await params).id);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href={ROUTES.researcher}>
          <ArrowLeftIcon aria-hidden />
          {id.researcher.detail.back}
        </Link>
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">{detail.business.name}</h1>
      <BusinessDetail detail={detail} />
    </div>
  );
}
