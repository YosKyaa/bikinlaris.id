import { PanelSkeleton } from "@/components/organisms/panel-skeleton";

/** Anggota tim: shown at once while the team loads. */
export default function Loading() {
  return <PanelSkeleton variant="list" />;
}
