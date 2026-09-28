/**
 * Converts the handover bank (content/bank.json) into a typed `src/content/diagnosis.ts`.
 *
 *   npm run import:bank                 regenerate from the handover folder
 *   npm run import:bank -- --source p   regenerate from another bank.json
 *   npm run check:bank                  validate the generated file (runs before every build)
 *
 * Question, problem and SOP texts are copied verbatim. Only field names are mapped.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  diagnosisBankSchema,
  sourceBankSchema,
  type SourceBank,
} from "../src/lib/validations/bank";
import type { DiagnosisBankShape, Task } from "../src/content/diagnosis.types";

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SOURCE = path.resolve(
  ROOT,
  "../document/bikinlaris-handover/bikinlaris/content/bank.json",
);
const OUTPUT = path.resolve(ROOT, "src/content/diagnosis.ts");

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

/** "merah=2, kuning=1. Bagian merah bila skor>=4, kuning bila >=2, …" */
function parseScoreRule(rule: string) {
  const pick = (pattern: RegExp, name: string) => {
    const match = rule.match(pattern);
    if (!match) throw new Error(`Aturan skor_bagian tidak bisa dibaca (${name}): "${rule}"`);
    return Number(match[1]);
  };
  return {
    redPoints: pick(/merah\s*=\s*(\d+)/, "poin merah"),
    yellowPoints: pick(/kuning\s*=\s*(\d+)/, "poin kuning"),
    redThreshold: pick(/merah bila skor\s*>=\s*(\d+)/, "batas merah"),
    yellowThreshold: pick(/kuning bila\s*>=\s*(\d+)/, "batas kuning"),
  };
}

/** "urutan bagian: uang, pesanan, stok, produksi, antar, promosi" */
function parseSectionOrder(order: string[]): string[] {
  const line = order.find((item) => item.startsWith("urutan bagian:"));
  if (!line) throw new Error('Aturan urutan_sop tidak punya baris "urutan bagian: …".');
  return line
    .slice("urutan bagian:".length)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function convert(source: SourceBank): DiagnosisBankShape {
  const rules = source._meta.aturan;
  const followUpDays = Number(
    Object.keys(rules)
      .find((k) => k.startsWith("hari_"))
      ?.split("_")[1],
  );
  if (!Number.isInteger(followUpDays)) throw new Error("Aturan hari_30 tidak ditemukan.");

  return {
    version: source._meta.versi,
    rules: {
      maxSopPerPack: rules.sop_maks_per_paket,
      ...parseScoreRule(rules.skor_bagian),
      sectionOrder: parseSectionOrder(rules.urutan_sop),
      followUpDays,
    },
    sections: source.bagian.map((b) => ({
      id: b.id,
      label: b.label,
      icon: b.ikon,
      description: b.deskripsi,
    })),
    questions: source.diagnosa.map((q) => ({
      id: q.id,
      sectionId: q.bagian,
      text: q.teks,
      redAnswer: q.merah,
      yellowAnswer: q.kuning,
      problemId: q.masalah,
      reversed: q.balik ?? false,
      skipWhen: q.lewati_bila ?? null,
    })),
    problems: source.masalah.map((m) => ({
      id: m.id,
      sectionId: m.bagian,
      title: m.judul,
      rootCause: m.akar,
      impact: m.dampak,
      sopId: m.sop,
    })),
    sops: source.sop.map((s) => ({
      id: s.id,
      sectionId: s.bagian,
      title: s.judul,
      goal: s.tujuan,
      tasks: s.tugas.map((t): Task =>
        t.jenis === "siapkan"
          ? { id: t.id, text: t.teks, kind: "siapkan", minutes: t.menit ?? 0 }
          : {
              id: t.id,
              text: t.teks,
              kind: t.jenis,
              target: t.target ?? 0,
              unit: t.satuan ?? "",
              onlyWhenPresent: t.bila_ada ?? false,
            },
      ),
    })),
  };
}

const union = (ids: string[]) => ids.map((id) => JSON.stringify(id)).join(" | ");

function render(bank: DiagnosisBankShape, sourceLabel: string): string {
  return `// Dibuat otomatis oleh scripts/import-bank.ts dari ${sourceLabel}.
// JANGAN diedit manual. Ubah bank.json lalu jalankan \`npm run import:bank\`.
import type { DiagnosisBankShape } from "./diagnosis.types";

export type SectionId = ${union(bank.sections.map((s) => s.id))};
export type QuestionId = ${union(bank.questions.map((q) => q.id))};
export type ProblemId = ${union(bank.problems.map((p) => p.id))};
export type SopId = ${union(bank.sops.map((s) => s.id))};

export type DiagnosisBank = DiagnosisBankShape<SectionId, QuestionId, ProblemId, SopId>;

export const diagnosisBank: DiagnosisBank = ${JSON.stringify(bank, null, 2)};
`;
}

function readSource(file: string): DiagnosisBankShape {
  const raw: unknown = JSON.parse(readFileSync(file, "utf8"));
  const parsed = sourceBankSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `bank.json tidak valid:\n${parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n")}`,
    );
  }
  const bank = convert(parsed.data);
  const checked = diagnosisBankSchema.safeParse(bank);
  if (!checked.success) {
    throw new Error(
      `Isi bank tidak konsisten:\n${checked.error.issues.map((i) => `- ${i.message}`).join("\n")}`,
    );
  }
  return bank;
}

const SOURCE_LABEL = "document/bikinlaris-handover/bikinlaris/content/bank.json";

async function check() {
  if (!existsSync(OUTPUT))
    throw new Error("src/content/diagnosis.ts belum ada. Jalankan npm run import:bank.");
  const generated = (await import(pathToFileURL(OUTPUT).href)) as { diagnosisBank: unknown };
  const result = diagnosisBankSchema.safeParse(generated.diagnosisBank);
  if (!result.success) {
    throw new Error(
      `diagnosis.ts rusak:\n${result.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n")}`,
    );
  }
  if (existsSync(DEFAULT_SOURCE)) {
    const expected = render(readSource(DEFAULT_SOURCE), SOURCE_LABEL);
    const actual = readFileSync(OUTPUT, "utf8").replace(/\r\n/g, "\n");
    if (expected !== actual) {
      throw new Error(
        "diagnosis.ts tidak sama dengan bank.json terbaru. Jalankan npm run import:bank.",
      );
    }
    console.log("Bank valid dan sama dengan bank.json sumber.");
  } else {
    console.log("Bank valid. (bank.json sumber tidak ditemukan, pemeriksaan kesamaan dilewati.)");
  }
}

function generate() {
  const custom = argValue("--source");
  const source = custom ? path.resolve(process.cwd(), custom) : DEFAULT_SOURCE;
  const bank = readSource(source);
  writeFileSync(OUTPUT, render(bank, custom ? path.basename(source) : SOURCE_LABEL));
  console.log(
    `Tertulis ${path.relative(ROOT, OUTPUT)}: ${bank.sections.length} bagian, ${bank.questions.length} pertanyaan, ${bank.problems.length} masalah, ${bank.sops.length} SOP.`,
  );
}

(process.argv.includes("--check") ? check() : Promise.resolve(generate())).catch(
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
