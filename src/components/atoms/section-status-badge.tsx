import { Badge } from "@/components/ui/badge";
import type { SectionColor } from "@/content/diagnosis.types";
import { id } from "@/content/id";

const VARIANT = { hijau: "success", kuning: "warning", merah: "danger" } as const;

/** Word label for a section colour ("Sudah rapi", "Ada yang ganggu", "Perlu dirapikan"). */
export function SectionStatusBadge({ color }: { color: SectionColor }) {
  return <Badge variant={VARIANT[color]}>{id.sectionStatus[color]}</Badge>;
}
