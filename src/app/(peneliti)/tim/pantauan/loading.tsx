import { PanelSkeleton } from "@/components/organisms/panel-skeleton";

/** Pantauan: shown at once while the figures load. */
export default function Loading() {
  return <PanelSkeleton variant="charts" />;
}
