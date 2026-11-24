import { z } from "zod";

import { ANSWER_VALUES, TASK_KINDS } from "../../content/diagnosis.types";

const text = z.string().min(1);

/**
 * Raw shape of the handover `content/bank.json` (v0.3). `strict()` everywhere so any
 * structural change in the source file fails the import instead of being silently dropped.
 */
const sourceTaskSchema = z
  .object({
    id: z.string().min(1),
    jenis: z.enum(TASK_KINDS),
    teks: z.string().min(1),
    menit: z.number().int().positive().optional(),
    target: z.number().int().positive().optional(),
    satuan: z.string().min(1).optional(),
    bila_ada: z.boolean().optional(),
  })
  .strict()
  .superRefine((task, ctx) => {
    if (task.jenis === "siapkan" && task.menit === undefined) {
      ctx.addIssue({ code: "custom", message: `Tugas siapkan ${task.id} tidak punya "menit".` });
    }
    if (task.jenis !== "siapkan" && (task.target === undefined || task.satuan === undefined)) {
      ctx.addIssue({ code: "custom", message: `Tugas ${task.id} tidak punya "target"/"satuan".` });
    }
  });

/** `varian.<nama>` in bank.json: replacement texts only, keyed by id (see diagnosis.types). */
const sourceVariantSchema = z
  .object({
    keterangan: text,
    bagian: z
      .record(z.string(), z.object({ label: text.optional(), deskripsi: text.optional() }).strict())
      .optional(),
    diagnosa: z
      .record(
        z.string(),
        z.object({ teks: text.optional(), lewati_bila: text.optional() }).strict(),
      )
      .optional(),
    masalah: z
      .record(
        z.string(),
        z
          .object({ judul: text.optional(), akar: text.optional(), dampak: text.optional() })
          .strict(),
      )
      .optional(),
    sop: z
      .record(
        z.string(),
        z
          .object({
            judul: text.optional(),
            tujuan: text.optional(),
            tugas: z
              .record(
                z.string(),
                z.object({ teks: text.optional(), satuan: text.optional() }).strict(),
              )
              .optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

export type SourceVariant = z.infer<typeof sourceVariantSchema>;

export const sourceBankSchema = z
  .object({
    _meta: z
      .object({
        versi: z.string(),
        tujuan: z.string(),
        aturan: z
          .object({
            jawaban_diagnosa: z.array(z.enum(ANSWER_VALUES)),
            skor_bagian: z.string(),
            sop_maks_per_paket: z.number().int().positive(),
            urutan_sop: z.array(z.string()),
            hari_30: z.string(),
          })
          .strict(),
      })
      .strict(),
    bagian: z.array(
      z
        .object({
          id: z.string().min(1),
          label: z.string().min(1),
          ikon: z.string().min(1),
          deskripsi: z.string().min(1),
        })
        .strict(),
    ),
    diagnosa: z.array(
      z
        .object({
          id: z.string().regex(/^q_[a-z]+_\d+$/),
          bagian: z.string().min(1),
          teks: z.string().min(1),
          merah: z.enum(ANSWER_VALUES),
          kuning: z.enum(ANSWER_VALUES),
          masalah: z.string().min(1),
          balik: z.boolean().optional(),
          lewati_bila: z.string().min(1).optional(),
        })
        .strict(),
    ),
    masalah: z.array(
      z
        .object({
          id: z.string().min(1),
          bagian: z.string().min(1),
          judul: z.string().min(1),
          akar: z.string().min(1),
          dampak: z.string().min(1),
          sop: z.string().min(1),
        })
        .strict(),
    ),
    sop: z.array(
      z
        .object({
          id: z.string().min(1),
          bagian: z.string().min(1),
          judul: z.string().min(1),
          tujuan: z.string().min(1),
          tugas: z.array(sourceTaskSchema).min(1),
        })
        .strict(),
    ),
    varian: z.object({ jasa: sourceVariantSchema.optional() }).strict().optional(),
  })
  .strict();

export type SourceBank = z.infer<typeof sourceBankSchema>;

/** Shape of the generated `src/content/diagnosis.ts`, re-validated on every build. */
const taskSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    kind: z.literal("siapkan"),
    minutes: z.number().int().positive(),
  }),
  z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    kind: z.enum(["harian", "mingguan"]),
    target: z.number().int().positive(),
    unit: z.string().min(1),
    onlyWhenPresent: z.boolean(),
  }),
]);

const variantSchema = z.object({
  note: text,
  sections: z.record(
    z.string(),
    z.object({ label: text.optional(), description: text.optional() }).strict(),
  ),
  questions: z.record(
    z.string(),
    z.object({ text: text.optional(), skipWhen: text.optional() }).strict(),
  ),
  problems: z.record(
    z.string(),
    z
      .object({ title: text.optional(), rootCause: text.optional(), impact: text.optional() })
      .strict(),
  ),
  sops: z.record(
    z.string(),
    z
      .object({
        title: text.optional(),
        goal: text.optional(),
        tasks: z
          .record(z.string(), z.object({ text: text.optional(), unit: text.optional() }).strict())
          .optional(),
      })
      .strict(),
  ),
});

export const diagnosisBankSchema = z
  .object({
    version: z.string(),
    rules: z.object({
      maxSopPerPack: z.number().int().positive(),
      redPoints: z.number().int().positive(),
      yellowPoints: z.number().int().positive(),
      redThreshold: z.number().int().positive(),
      yellowThreshold: z.number().int().positive(),
      sectionOrder: z.array(z.string()),
      followUpDays: z.number().int().positive(),
    }),
    sections: z.array(
      z.object({
        id: z.string(),
        label: z.string().min(1),
        icon: z.string(),
        description: z.string().min(1),
      }),
    ),
    questions: z.array(
      z.object({
        id: z.string(),
        sectionId: z.string(),
        text: z.string().min(1),
        redAnswer: z.enum(ANSWER_VALUES),
        yellowAnswer: z.enum(ANSWER_VALUES),
        problemId: z.string(),
        reversed: z.boolean(),
        skipWhen: z.string().nullable(),
      }),
    ),
    problems: z.array(
      z.object({
        id: z.string(),
        sectionId: z.string(),
        title: z.string().min(1),
        rootCause: z.string().min(1),
        impact: z.string().min(1),
        sopId: z.string(),
      }),
    ),
    sops: z.array(
      z.object({
        id: z.string(),
        sectionId: z.string(),
        title: z.string().min(1),
        goal: z.string().min(1),
        tasks: z.array(taskSchema).min(1),
      }),
    ),
    variants: z.object({ jasa: variantSchema.optional() }).strict(),
  })
  .superRefine((bank, ctx) => {
    const sections = new Set(bank.sections.map((s) => s.id));
    const problems = new Set(bank.problems.map((p) => p.id));
    const sops = new Set(bank.sops.map((s) => s.id));
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });

    const unique = (label: string, ids: string[]) => {
      const seen = new Set<string>();
      for (const id of ids) {
        if (seen.has(id)) fail(`${label} ganda: ${id}`);
        seen.add(id);
      }
    };
    unique(
      "Bagian",
      bank.sections.map((s) => s.id),
    );
    unique(
      "Pertanyaan",
      bank.questions.map((q) => q.id),
    );
    unique("Masalah", [...problems]);
    unique("SOP", [...sops]);

    for (const q of bank.questions) {
      if (!sections.has(q.sectionId)) fail(`Pertanyaan ${q.id}: bagian ${q.sectionId} tidak ada.`);
      if (!problems.has(q.problemId)) fail(`Pertanyaan ${q.id}: masalah ${q.problemId} tidak ada.`);
    }
    for (const p of bank.problems) {
      if (!sections.has(p.sectionId)) fail(`Masalah ${p.id}: bagian ${p.sectionId} tidak ada.`);
      if (!sops.has(p.sopId)) fail(`Masalah ${p.id}: SOP ${p.sopId} tidak ada.`);
    }
    for (const s of bank.sops) {
      if (!sections.has(s.sectionId)) fail(`SOP ${s.id}: bagian ${s.sectionId} tidak ada.`);
      unique(
        `Tugas di SOP ${s.id}`,
        s.tasks.map((t) => t.id),
      );
    }
    for (const id of bank.rules.sectionOrder) {
      if (!sections.has(id)) fail(`Urutan bagian menyebut ${id} yang tidak ada.`);
    }
    if (bank.rules.sectionOrder.length !== sections.size) {
      fail("Urutan bagian harus menyebut semua bagian tepat sekali.");
    }

    // A variant may only reword what exists, and only where the general text allows it.
    for (const [name, variant] of Object.entries(bank.variants)) {
      if (!variant) continue;
      const where = `Varian ${name}`;
      for (const id of Object.keys(variant.sections)) {
        if (!sections.has(id)) fail(`${where}: bagian ${id} tidak ada.`);
      }
      for (const [id, override] of Object.entries(variant.questions)) {
        const question = bank.questions.find((q) => q.id === id);
        if (!question) fail(`${where}: pertanyaan ${id} tidak ada.`);
        else if (override.skipWhen && !question.skipWhen) {
          fail(`${where}: pertanyaan ${id} tidak bisa dilewati di teks umum.`);
        }
      }
      for (const id of Object.keys(variant.problems)) {
        if (!problems.has(id)) fail(`${where}: masalah ${id} tidak ada.`);
      }
      for (const [id, override] of Object.entries(variant.sops)) {
        const sop = bank.sops.find((s) => s.id === id);
        if (!sop) {
          fail(`${where}: SOP ${id} tidak ada.`);
          continue;
        }
        for (const [taskId, task] of Object.entries(override.tasks ?? {})) {
          const base = sop.tasks.find((t) => t.id === taskId);
          if (!base) fail(`${where}: tugas ${taskId} di SOP ${id} tidak ada.`);
          else if (task.unit && base.kind === "siapkan") {
            fail(`${where}: tugas ${taskId} di SOP ${id} tidak punya satuan.`);
          }
        }
      }
    }
  });
