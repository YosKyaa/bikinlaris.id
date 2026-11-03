"use client";

import { SearchIcon } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";

/** Search field above a data table, with a visually hidden label. */
export function TableSearch({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  return (
    <div className="border-b px-5 py-3 sm:px-6 sm:py-4">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative max-w-md">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 pl-9"
        />
      </div>
    </div>
  );
}
