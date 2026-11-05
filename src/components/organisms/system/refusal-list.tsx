import Link from "next/link";

import { BentoTile } from "@/components/atoms/bento-tile";
import * as id from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { CoachRefusal } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format";

/** The newest questions the app's check kept from the AI, to spot wrong refusals. */
export function RefusalList({ refusals }: { refusals: CoachRefusal[] }) {
  const copy = id.system.refusals;
  return (
    <BentoTile as="section" aria-labelledby="ditolak-saringan" className="space-y-3">
      <div>
        <h2 id="ditolak-saringan" className="text-xl font-semibold">
          {copy.title}
        </h2>
        <p className="text-muted-foreground">{copy.body}</p>
      </div>
      {refusals.length === 0 ? (
        <p className="rounded-xl bg-muted p-4 text-muted-foreground">{copy.empty}</p>
      ) : (
        <ol className="divide-y rounded-xl border">
          {refusals.map((refusal) => (
            <li key={`${refusal.businessId}-${refusal.createdAt}`} className="space-y-1 p-3">
              <p className="break-words">&ldquo;{refusal.text}&rdquo;</p>
              <p className="text-sm text-muted-foreground tabular-nums">
                <Link
                  href={ROUTES.researcherBusiness(refusal.businessId)}
                  className="font-mono font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {refusal.code}
                </Link>{" "}
                · {formatDateTime(refusal.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </BentoTile>
  );
}
