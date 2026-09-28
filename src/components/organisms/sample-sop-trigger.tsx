"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

/** Dialog code is fetched only when the visitor asks for the example (keeps the landing light). */
const LazyDialog = dynamic(
  () => import("./sample-sop-dialog-body").then((m) => m.SampleSopDialogBody),
  {
    ssr: false,
  },
);

interface SampleSopTriggerProps {
  label: string;
  variant?: "outline" | "default";
  size?: "default" | "lg";
  className?: string;
  title: string;
  description: string;
  /** Server-rendered SOP document. */
  children: ReactNode;
}

export function SampleSopTrigger({
  label,
  variant = "outline",
  size = "default",
  className,
  title,
  description,
  children,
}: SampleSopTriggerProps) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant={variant}
        size={size}
        className={className}
        aria-haspopup="dialog"
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
      >
        {label}
      </Button>
      {requested ? (
        <LazyDialog
          open={open}
          onOpenChange={setOpen}
          title={title}
          description={description}
          onClosed={() => triggerRef.current?.focus()}
        >
          {children}
        </LazyDialog>
      ) : null}
    </>
  );
}
