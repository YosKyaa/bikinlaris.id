import { requireOwnerPage } from "@/lib/data/session";

/** Every page in (umkm) needs a signed-in business owner. */
export default async function OwnerLayout({ children }: LayoutProps<"/">) {
  await requireOwnerPage();
  return children;
}
