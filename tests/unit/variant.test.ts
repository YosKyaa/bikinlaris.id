import { expect, test } from "@playwright/test";

import { diagnosisBank } from "@/content/diagnosis";
import {
  getProblem,
  getQuestion,
  getSection,
  getSop,
  questionsOf,
  type Wording,
} from "@/lib/diagnosis/bank";
import { editableText, editsToLayers, isEditTarget, type TextEdit } from "@/lib/diagnosis/edits";
import { textVariantFor } from "@/lib/diagnosis/variant";

const JASA: Wording = { variant: "jasa" };

test("service businesses get the service wording, others the general one", () => {
  expect(textVariantFor("laundry")).toBe("jasa");
  expect(textVariantFor("kecantikan")).toBe("jasa");
  expect(textVariantFor("jasa")).toBe("jasa");
  expect(textVariantFor("kuliner")).toBeNull();
  expect(textVariantFor("retail")).toBeNull();
});

test("the service wording changes texts only, never ids or scoring", () => {
  for (const base of diagnosisBank.questions) {
    const worded = getQuestion(base.id, JASA);
    expect({ ...worded, text: base.text, skipWhen: base.skipWhen }).toEqual(base);
    expect(Boolean(worded.skipWhen)).toBe(Boolean(base.skipWhen));
  }
  for (const base of diagnosisBank.sops) {
    const worded = getSop(base.id, JASA);
    expect(worded.tasks.map((t) => [t.id, t.kind])).toEqual(base.tasks.map((t) => [t.id, t.kind]));
  }
  for (const section of diagnosisBank.sections) {
    expect(questionsOf(section.id, JASA).map((q) => q.id)).toEqual(
      questionsOf(section.id).map((q) => q.id),
    );
  }
});

test("the service wording no longer talks about kitchens or portions", () => {
  expect(getSection("produksi", JASA).label).not.toMatch(/dapur/i);
  expect(getQuestion("q_produksi_4", JASA).text).not.toMatch(/resep|takaran/i);
  expect(getQuestion("q_uang_4", JASA).text).not.toMatch(/porsi/i);
  expect(getProblem("hasil_tidak_konsisten", JASA).rootCause).not.toMatch(/takaran/i);
  expect(getSop("pisah_dompet", JASA).title).not.toMatch(/warung/i);
  // Without a variant nothing changes.
  expect(getSection("produksi").label).toBe(diagnosisBank.sections[1].label);
});

test("admin edits sit on top of the bank texts, the service wording on top of general edits", () => {
  const edits: TextEdit[] = [
    {
      kind: "pertanyaan",
      key: "q_uang_2",
      field: "teks",
      variant: "umum",
      value: "Umum baru?",
      updatedAt: "",
    },
    {
      kind: "pertanyaan",
      key: "q_uang_1",
      field: "teks",
      variant: "umum",
      value: "Dipisah?",
      updatedAt: "",
    },
    {
      kind: "pertanyaan",
      key: "q_uang_1",
      field: "teks",
      variant: "jasa",
      value: "Jasa baru?",
      updatedAt: "",
    },
    {
      kind: "tugas",
      key: "pisah_dompet:t1",
      field: "teks",
      variant: "umum",
      value: "Siapkan dompet",
      updatedAt: "",
    },
  ];
  const layers = editsToLayers(edits);
  // A general edit reaches service businesses where the bank has no service text.
  expect(getQuestion("q_uang_2", { variant: "jasa", edits: layers }).text).toBe("Umum baru?");
  // A service edit wins over the general edit for service businesses only.
  expect(getQuestion("q_uang_1", { variant: "jasa", edits: layers }).text).toBe("Jasa baru?");
  expect(getQuestion("q_uang_1", { variant: null, edits: layers }).text).toBe("Dipisah?");
  // The bank's service text wins over a general edit (it is more specific).
  expect(getSop("pisah_dompet", { variant: "jasa", edits: layers }).tasks[0].text).toBe(
    getSop("pisah_dompet", JASA).tasks[0].text,
  );
  expect(getSop("pisah_dompet", { variant: null, edits: layers }).tasks[0].text).toBe(
    "Siapkan dompet",
  );
  // Scoring fields never move.
  const edited = getQuestion("q_uang_1", { variant: "jasa", edits: layers });
  const base = diagnosisBank.questions.find((q) => q.id === "q_uang_1");
  expect([edited.redAnswer, edited.yellowAnswer, edited.problemId]).toEqual([
    base?.redAnswer,
    base?.yellowAnswer,
    base?.problemId,
  ]);
});

test("only texts that exist and may change can be edited", () => {
  expect(
    isEditTarget({ kind: "pertanyaan", key: "q_uang_5", field: "lewati_bila", variant: "umum" }),
  ).toBe(true);
  expect(
    isEditTarget({ kind: "pertanyaan", key: "q_uang_1", field: "lewati_bila", variant: "umum" }),
  ).toBe(false);
  expect(
    isEditTarget({ kind: "pertanyaan", key: "q_tidak_ada", field: "teks", variant: "umum" }),
  ).toBe(false);
  expect(
    isEditTarget({ kind: "tugas", key: "pisah_dompet:t1", field: "teks", variant: "jasa" }),
  ).toBe(true);
  expect(
    isEditTarget({ kind: "tugas", key: "pisah_dompet:t9", field: "teks", variant: "jasa" }),
  ).toBe(false);
  expect(isEditTarget({ kind: "sop", key: "pisah_dompet", field: "akar", variant: "umum" })).toBe(
    false,
  );
});

test("the edit dialog knows the text without the edit", () => {
  const target = { kind: "pertanyaan", key: "q_uang_1", field: "teks", variant: "umum" } as const;
  const edits: TextEdit[] = [{ ...target, value: "Baru?", updatedAt: "" }];
  const text = editableText(target, edits);
  expect(text?.current).toBe("Baru?");
  expect(text?.original).toBe(diagnosisBank.questions.find((q) => q.id === "q_uang_1")?.text);
  expect(text?.edited).toBe(true);
});
