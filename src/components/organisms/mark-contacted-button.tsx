"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { markContactedAction } from "@/lib/actions/research";

export function MarkContactedButton({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await markContactedAction(businessId);
          if (result.ok) toast.success(id.researcher.marked(businessName));
          else toast.error(result.error);
        })
      }
    >
      {pending ? id.common.saving : id.researcher.markContacted}
    </Button>
  );
}
