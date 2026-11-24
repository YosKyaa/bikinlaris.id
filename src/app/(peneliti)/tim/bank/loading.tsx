import { PanelSkeleton } from "@/components/organisms/panel-skeleton";

/** Bank pertanyaan: shown at once while the texts load. */
export default function Loading() {
  return <PanelSkeleton variant="detail" />;
}
