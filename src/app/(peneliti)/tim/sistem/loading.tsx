import { PanelSkeleton } from "@/components/organisms/panel-skeleton";

/** Sistem: shown at once while the usage figures load. */
export default function Loading() {
  return <PanelSkeleton variant="charts" />;
}
