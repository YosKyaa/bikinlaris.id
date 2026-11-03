import { Logo } from "@/components/atoms/logo";
import { id } from "@/content/id";

/** Minimal footer on --brand-deep. */
export function SiteFooter() {
  return (
    <footer className="bg-brand-deep text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo tone="inverse" />
        <div className="text-sm text-brand-deep-muted sm:text-right">
          <p>{id.landing.footer.affiliation}</p>
          <p>{id.landing.footer.copyright(new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  );
}
