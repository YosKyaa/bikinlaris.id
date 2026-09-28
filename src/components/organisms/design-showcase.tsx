import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { id } from "@/content/id";

/** Colour tokens from CLAUDE.md plus documented additions. Names are code, not UI copy. */
const COLOR_TOKENS = [
  ["background", "#FFFFFF"],
  ["muted", "#F4F7F5"],
  ["border", "#E3EAE6"],
  ["foreground", "#0F1F18"],
  ["muted-foreground", "#5B6B63"],
  ["primary", "#15803D"],
  ["primary-foreground", "#FFFFFF"],
  ["brand-deep", "#0B3D2E"],
  ["accent-lime", "#C6F24E"],
  ["destructive", "#B42318"],
  ["warning", "#B54708"],
  ["success", "#166534"],
  ["success-soft", "#E8F3EC"],
  ["warning-soft", "#FEF3E2"],
  ["destructive-soft", "#FDECEA"],
] as const;

const TYPE_SCALE = [
  ["text-5xl / 48", "text-5xl font-bold tracking-tight"],
  ["text-4xl / 36", "text-4xl font-bold tracking-tight"],
  ["text-3xl / 30", "text-3xl font-bold tracking-tight"],
  ["text-2xl / 24", "text-2xl font-semibold"],
  ["text-xl / 20", "text-xl font-semibold"],
  ["text-base / 16", "text-base"],
] as const;

export function DesignSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t pt-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function DesignFoundations() {
  const copy = id.design;
  return (
    <>
      <DesignSection title={copy.colors}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLOR_TOKENS.map(([name, hex]) => (
            <li key={name} className="overflow-hidden rounded-xl border">
              <div className="h-16 border-b" style={{ background: `var(--${name})` }} />
              <div className="p-3 text-sm">
                <div className="font-semibold">--{name}</div>
                <div className="text-muted-foreground tabular-nums">{hex}</div>
              </div>
            </li>
          ))}
        </ul>
      </DesignSection>

      <DesignSection title={copy.typography}>
        <div className="space-y-3">
          {TYPE_SCALE.map(([label, className]) => (
            <div key={label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="w-32 shrink-0 text-sm text-muted-foreground">{label}</span>
              <span className={className}>{copy.sampleText}</span>
            </div>
          ))}
          <p className="max-w-prose text-muted-foreground">{copy.sampleBody}</p>
        </div>
      </DesignSection>

      <DesignSection title={copy.buttons}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{copy.buttonLabels.default}</Button>
          <Button variant="outline">{copy.buttonLabels.outline}</Button>
          <Button variant="ghost">{copy.buttonLabels.ghost}</Button>
          <Button variant="link">{copy.buttonLabels.link}</Button>
          <Button variant="destructive">{copy.buttonLabels.destructive}</Button>
          <Button disabled>{copy.buttonLabels.disabled}</Button>
          <Button size="lg">{copy.buttonLabels.default}</Button>
          <Button size="sm" variant="outline">
            {copy.buttonLabels.outline}
          </Button>
        </div>
      </DesignSection>

      <DesignSection title={copy.inputs}>
        <div className="grid max-w-md gap-4">
          <div className="grid gap-2">
            <Label htmlFor="design-email">{id.auth.email}</Label>
            <Input id="design-email" type="email" placeholder={id.auth.emailPlaceholder} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="design-invalid">{id.profile.fields.name.label}</Label>
            <Input id="design-invalid" aria-invalid defaultValue="" />
            <p className="text-sm text-destructive">{id.profile.errors.required}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="design-textarea">{id.profile.fields.product.label}</Label>
            <Textarea id="design-textarea" placeholder={id.profile.fields.product.placeholder} />
          </div>
        </div>
      </DesignSection>
    </>
  );
}
