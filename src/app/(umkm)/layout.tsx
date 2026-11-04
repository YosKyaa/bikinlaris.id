import { OfflineSupport } from "@/components/atoms/offline-support";
import { requireOwnerState } from "@/lib/data/owner-session";

/**
 * Every page in (umkm) needs the private link opened on this device (/u/[token]). Owner pages
 * also register the service worker that keeps the pack readable without signal.
 */
export default async function OwnerLayout({ children }: LayoutProps<"/">) {
  await requireOwnerState();
  return (
    <>
      {children}
      <OfflineSupport />
    </>
  );
}
