"use client";

import { CopyIcon } from "lucide-react";
import { useId } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CopyFieldProps {
  label: string;
  value: string;
  hint?: string;
  copyLabel: string;
  copiedMessage: string;
  failedMessage: string;
}

/** Read-only value with a copy button (private link, invite code). */
export function CopyField({
  label,
  value,
  hint,
  copyLabel,
  copiedMessage,
  failedMessage,
}: CopyFieldProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(copiedMessage);
    } catch {
      toast.error(failedMessage);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          aria-describedby={hint ? hintId : undefined}
          className="min-w-0 flex-1 font-mono text-sm"
        />
        <Button type="button" variant="outline" className="h-11 shrink-0" onClick={copy}>
          <CopyIcon aria-hidden />
          {copyLabel}
        </Button>
      </div>
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
