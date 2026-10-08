"use client";

import { SendIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { setQuestionnaireAction } from "@/lib/actions/research";

type Size = "default" | "lg" | "sm";

interface SendProps {
  businessId: string;
  businessName: string;
  /** wa.me link with the questionnaire message. */
  href: string;
  label: string;
  variant?: "default" | "outline";
  size?: Size;
}

/**
 * Opens WhatsApp with the questionnaire message and marks it as sent. A link, so it works
 * like any WhatsApp link on phones; the status is saved in the background.
 */
export function SendQuestionnaireLink({
  businessId,
  businessName,
  href,
  label,
  variant = "default",
  size = "default",
}: SendProps) {
  const [, startTransition] = useTransition();
  return (
    <Button asChild variant={variant} size={size} className="pointer-coarse:h-11">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          startTransition(async () => {
            const result = await setQuestionnaireAction(businessId, "sent", true);
            if (result.ok) toast.success(id.researcher.actions.sent(businessName));
            else toast.error(result.error);
          })
        }
      >
        <SendIcon aria-hidden />
        {label}
      </a>
    </Button>
  );
}

interface MarkProps {
  businessId: string;
  field: "sent" | "done";
  value: boolean;
  label: string;
  /** Toast after saving. */
  success: string;
  variant?: "default" | "outline" | "ghost";
  size?: Size;
}

/** "Tandai sudah isi" and the undo buttons. */
export function MarkQuestionnaireButton({
  businessId,
  field,
  value,
  label,
  success,
  variant = "default",
  size = "default",
}: MarkProps) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className="pointer-coarse:h-11"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setQuestionnaireAction(businessId, field, value);
          if (result.ok) toast.success(success);
          else toast.error(result.error);
        })
      }
    >
      {pending ? id.common.saving : label}
    </Button>
  );
}
