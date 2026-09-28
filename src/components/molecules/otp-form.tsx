"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useId, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { id } from "@/content/id";

import { InlineError } from "./inline-error";

export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 60;
const SECOND_MS = 1000;

interface OtpFormProps {
  email: string;
  /** Returns an error message, or null when the code was accepted. */
  onVerify: (code: string) => Promise<string | null>;
  onResend: () => Promise<void>;
}

/**
 * Six-digit email code with resend countdown. Prepared for a possible switch to OTP login
 * (CLAUDE.md root); the current login uses email + password (docs/keputusan.md).
 */
export function OtpForm({ email, onVerify, onResend }: OtpFormProps) {
  const inputId = useId();
  const errorId = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), SECOND_MS);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function submit(value: string) {
    if (value.length < OTP_LENGTH) {
      setError(id.auth.otp.errors.incomplete);
      return;
    }
    startTransition(async () => setError(await onVerify(value)));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit(code);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor={inputId}>{id.auth.otp.label}</Label>
        <InputOTP
          id={inputId}
          maxLength={OTP_LENGTH}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={setCode}
          onComplete={submit}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        >
          <InputOTPGroup>
            {Array.from({ length: OTP_LENGTH }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p className="text-sm text-muted-foreground">{id.auth.otp.hint(email)}</p>
        <InlineError id={errorId} message={error} />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={pending} className="sm:flex-1">
          {pending ? id.auth.pending : id.auth.otp.submit}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={secondsLeft > 0 || pending}
          onClick={() =>
            startTransition(async () => {
              await onResend();
              setCode("");
              setError(null);
              setSecondsLeft(OTP_RESEND_SECONDS);
            })
          }
        >
          {secondsLeft > 0 ? id.auth.otp.resendIn(secondsLeft) : id.auth.otp.resend}
        </Button>
      </div>
    </form>
  );
}
