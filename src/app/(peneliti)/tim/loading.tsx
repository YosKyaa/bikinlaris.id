import { PanelSkeleton } from "@/components/organisms/panel-skeleton";

/** Ringkasan: shown at once while the numbers load. */
export default function Loading() {
  return <PanelSkeleton variant="dashboard" />;
}
