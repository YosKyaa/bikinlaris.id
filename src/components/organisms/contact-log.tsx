import { PhoneIcon } from "lucide-react";

import { ContactOutcomeBadge } from "@/components/molecules/contact-outcome-badge";
import { id } from "@/content/id";
import type { ContactNote, StaffUser } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format";

import { ContactNoteForm } from "./contact-note-form";
import { DeleteContactNoteButton } from "./delete-contact-note-button";

/**
 * "Catatan kontak" on a participant's page: the form for the next call beside the history,
 * newest first, with who wrote each note. Members delete their own notes; admins any.
 */
export function ContactLog({
  businessId,
  notes,
  memberNames,
  user,
}: {
  businessId: string;
  notes: ContactNote[];
  /** Team member id → name. Missing = the member has left the team. */
  memberNames: Record<string, string>;
  user: StaffUser;
}) {
  const copy = id.contact;
  const author = (note: ContactNote) =>
    note.staffId === user.id
      ? copy.you
      : ((note.staffId && memberNames[note.staffId]) ?? copy.formerMember);

  return (
    <section
      aria-labelledby="catatan-kontak"
      className="grid gap-6 rounded-2xl border bg-card p-5 *:min-w-0 sm:p-6 lg:grid-cols-[1fr_1.2fr]"
    >
      <div className="space-y-4">
        <div>
          <h2 id="catatan-kontak" className="flex items-center gap-2 text-xl font-semibold">
            <PhoneIcon aria-hidden className="size-5 text-primary" />
            {copy.title}
          </h2>
          <p className="mt-1 text-muted-foreground">{copy.body}</p>
        </div>
        <ContactNoteForm businessId={businessId} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{copy.historyLabel}</h3>
        {notes.length === 0 ? (
          <div className="rounded-xl bg-muted p-4">
            <p className="font-semibold">{copy.emptyTitle}</p>
            <p className="text-muted-foreground">{copy.emptyBody}</p>
          </div>
        ) : (
          <ol className="divide-y rounded-xl border">
            {notes.map((note) => {
              const when = formatDateTime(note.createdAt);
              const canDelete = note.staffId === user.id || user.role === "admin";
              return (
                <li key={note.id} className="flex items-start gap-3 p-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <ContactOutcomeBadge outcome={note.outcome} />
                    {note.note ? <p className="break-words">{note.note}</p> : null}
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {author(note)} · {when}
                    </p>
                  </div>
                  {canDelete ? (
                    <DeleteContactNoteButton noteId={note.id} label={copy.deleteLabel(when)} />
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
