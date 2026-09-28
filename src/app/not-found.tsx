import Link from "next/link";

import { EmptyState } from "@/components/molecules/empty-state";
import { Button } from "@/components/ui/button";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

export default function NotFound() {
  const copy = id.states.notFound;
  return (
    <FocusLayout>
      <EmptyState
        title={copy.title}
        body={copy.body}
        action={
          <Button asChild>
            <Link href={ROUTES.home}>{copy.cta}</Link>
          </Button>
        }
      />
    </FocusLayout>
  );
}
