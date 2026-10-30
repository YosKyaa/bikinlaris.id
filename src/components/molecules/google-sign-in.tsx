import { GoogleMark } from "@/components/atoms/google-mark";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";

/**
 * "Masuk dengan Google" for invited team members, with a divider to the e-mail form below.
 * An outline button: the e-mail form keeps the one primary action of the screen.
 */
export function GoogleSignIn({ href }: { href: string }) {
  const copy = id.auth.google;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Button asChild variant="outline" size="lg" className="h-12 w-full text-base">
          <a href={href}>
            <GoogleMark />
            {copy.button}
          </a>
        </Button>
        <p className="text-sm text-muted-foreground">{copy.hint}</p>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        {copy.divider}
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
