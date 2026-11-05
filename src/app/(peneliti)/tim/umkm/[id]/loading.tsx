import { PanelSkeleton } from "@/components/organisms/panel-skeleton";

/** One participant: shown at once while their data loads (also the edit page). */
export default function Loading() {
  return <PanelSkeleton variant="detail" />;
}
