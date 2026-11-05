import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { BentoTile } from "@/components/atoms/bento-tile";
import { Badge } from "@/components/ui/badge";
import * as id from "@/content/id";

export interface SafetyStatus {
  turnstile: boolean;
  secretKey: boolean;
  /** Provider and model answering the coach, or null when the coach is off. */
  coachModel: string | null;
  limits: { perOwner: number; all: number; pauseSeconds: number };
}

/** What protects the AI bill and the data, each with its state and what to do when off. */
export function SystemSafety({ status }: { status: SafetyStatus }) {
  const copy = id.system.safety;
  const items = [
    {
      key: "turnstile",
      label: copy.turnstile.label,
      on: status.turnstile,
      text: status.turnstile ? copy.turnstile.on : copy.turnstile.off,
    },
    {
      key: "secretKey",
      label: copy.secretKey.label,
      on: status.secretKey,
      text: status.secretKey ? copy.secretKey.on : copy.secretKey.off,
    },
    {
      key: "coach",
      label: copy.coach.label,
      on: status.coachModel !== null,
      text: status.coachModel ? copy.coach.on(status.coachModel) : copy.coach.off,
    },
    {
      key: "limits",
      label: copy.limits.label,
      on: true,
      text: copy.limits.body(status.limits.perOwner, status.limits.all, status.limits.pauseSeconds),
    },
  ];

  return (
    <BentoTile as="section" aria-labelledby="pengaman" className="space-y-4">
      <div>
        <h2 id="pengaman" className="text-xl font-semibold">
          {copy.title}
        </h2>
        <p className="text-muted-foreground">{copy.body}</p>
      </div>
      <ul className="divide-y rounded-xl border">
        {items.map((item) => {
          const Icon = item.on ? CircleCheckIcon : CircleAlertIcon;
          return (
            <li key={item.key} className="flex items-start gap-3 p-3">
              <Icon
                aria-hidden
                className={
                  item.on
                    ? "mt-0.5 size-5 shrink-0 text-success"
                    : "mt-0.5 size-5 shrink-0 text-warning"
                }
              />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {item.label}
                  <Badge variant={item.on ? "success" : "warning"}>
                    {item.on ? copy.on : copy.off}
                  </Badge>
                </p>
                <p className="text-sm break-words text-muted-foreground">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </BentoTile>
  );
}
