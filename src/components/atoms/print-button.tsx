"use client";

import { PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Opens the browser print dialog (also "Simpan sebagai PDF"), e.g. for progress reports. */
export function PrintButton({ label }: { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 print:hidden"
      onClick={() => window.print()}
    >
      <PrinterIcon aria-hidden />
      {label}
    </Button>
  );
}
