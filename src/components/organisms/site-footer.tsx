import { Logo } from "@/components/atoms/logo";
import { id } from "@/content/id";

/** Quiet footer on the canvas: the closing tile above it already carries the brand colour. */
export function SiteFooter() {
  return (
    <footer className="px-4 pt-4 pb-24 sm:px-6 md:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <div className="text-sm text-muted-foreground sm:text-right">
          <p>{id.landing.footer.affiliation}</p>
          <p>{id.landing.footer.copyright(new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  );
}
