import { z } from "zod";

import { CONTACT_OUTCOMES } from "@/lib/data/types";

/** Same limit as the database CHECK on kontak_catatan.catatan. */
export const CONTACT_NOTE_MAX_LENGTH = 500;

/** "Catatan kontak": what happened when the team tried to reach the owner. */
export const contactNoteSchema = z.object({
  outcome: z.enum(CONTACT_OUTCOMES, "outcome"),
  note: z.string().trim().max(CONTACT_NOTE_MAX_LENGTH, "tooLong"),
});

export type ContactNoteInput = z.infer<typeof contactNoteSchema>;
