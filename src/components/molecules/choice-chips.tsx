import { CheckIcon } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

interface ChoiceChipsProps {
  legend: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
  columns?: 2 | 3;
}

/**
 * A short list of choices as large tap targets (like the Ya / Kadang / Belum answers).
 * Native radio inputs in a fieldset: arrow keys work, no extra JavaScript.
 */
export function ChoiceChips({
  legend,
  options,
  value,
  onChange,
  error,
  columns = 3,
}: ChoiceChipsProps) {
  const name = useId();
  return (
    <fieldset aria-invalid={Boolean(error) || undefined} className="space-y-2">
      <legend className="mb-2 font-medium">{legend}</legend>
      <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 bg-muted px-2 py-2 text-center text-sm font-semibold transition-colors duration-150",
                "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-success-soft text-success"
                  : "border-transparent text-foreground hover:border-border",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
              {selected ? <CheckIcon aria-hidden className="size-4 shrink-0" /> : null}
              {option.label}
            </label>
          );
        })}
      </div>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </fieldset>
  );
}
