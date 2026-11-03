import { CheckIcon } from "lucide-react";

import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { PhotoFrame } from "@/components/molecules/photo-frame";
import { id } from "@/content/id";
import { photos } from "@/content/photos";
import { rules, totalQuestions } from "@/lib/diagnosis/bank";

interface Highlight {
  value: number;
  label: string;
  note?: string;
}

/**
 * Bento tiles beside the login and sign-up forms (laptops only): a real business owner, one
 * number from the app's own rules, and what comes next. Nothing here is a claim or statistic.
 */
export function AuthShowcase({ variant }: { variant: "team" | "owner" }) {
  const copy = id.authShowcase;
  const highlight: Highlight =
    variant === "team"
      ? { value: rules.followUpDays, label: copy.team.days }
      : {
          value: totalQuestions,
          label: copy.owner.questions,
          note: id.common.aboutMinutes(id.common.durationMinutes),
        };
  const list =
    variant === "team"
      ? { title: copy.team.tasksTitle, items: copy.team.tasks }
      : { title: id.join.stepsTitle, items: id.join.steps.map((step) => step.title) };

  return (
    <BentoGrid className="grid-cols-2">
      <div className="relative row-span-2 min-h-80">
        <PhotoFrame
          photo={photos.hero}
          showPlace={false}
          sizes="(min-width: 1024px) 18rem, 1px"
          className="absolute inset-0 rounded-2xl shadow-none"
        />
      </div>
      <BentoTile tone="lime" as="figure" className="flex flex-col justify-between gap-3">
        <span className="text-5xl font-bold tabular-nums">{highlight.value}</span>
        <figcaption className="font-medium">
          {highlight.label}
          {highlight.note ? <span className="mt-1 block text-sm">{highlight.note}</span> : null}
        </figcaption>
      </BentoTile>
      <BentoTile>
        <p className="font-semibold">{list.title}</p>
        <ul className="mt-3 space-y-2 text-sm">
          {list.items.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </BentoTile>
    </BentoGrid>
  );
}
