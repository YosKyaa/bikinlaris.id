import { Badge } from "@/components/ui/badge";
import * as id from "@/content/id";
import type { ContactOutcome } from "@/lib/data/types";

/** Reached the owner = green; try again = amber; wrong number or will not go on = red. */
const OUTCOME_VARIANT: Record<ContactOutcome, "success" | "warning" | "danger"> = {
  tersambung: "success",
  minta_nanti: "warning",
  tidak_diangkat: "warning",
  nomor_salah: "danger",
  menolak: "danger",
};

export function ContactOutcomeBadge({ outcome }: { outcome: ContactOutcome }) {
  return <Badge variant={OUTCOME_VARIANT[outcome]}>{id.contact.outcomes[outcome]}</Badge>;
}
