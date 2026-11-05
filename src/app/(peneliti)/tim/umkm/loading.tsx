import { PanelSkeleton } from "@/components/organisms/panel-skeleton";

/** Daftar UMKM: shown at once while the list loads. */
export default function Loading() {
  return <PanelSkeleton variant="list" />;
}
