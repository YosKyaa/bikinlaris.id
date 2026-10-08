import { requireOwnerState } from "@/lib/data/owner-session";

/** Every page in (umkm) needs the private link opened on this device (/u/[token]). */
export default async function OwnerLayout({ children }: LayoutProps<"/">) {
  await requireOwnerState();
  return children;
}
