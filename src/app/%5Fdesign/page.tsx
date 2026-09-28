import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesignFoundations } from "@/components/organisms/design-showcase";
import { id } from "@/content/id";

export const metadata: Metadata = { title: id.design.title, robots: { index: false } };

/** /_design: visual review tool, development only. */
export default function DesignPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <main id="isi" className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{id.design.title}</h1>
        <p className="text-muted-foreground">{id.design.subtitle}</p>
      </header>
      <DesignFoundations />
    </main>
  );
}
