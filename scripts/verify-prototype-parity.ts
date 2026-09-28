/**
 * Checks that src/lib/diagnosis/scoring.ts gives the same map, problems and SOP order as the
 * approved prototype (prototype/index.html: skorJawaban, hitungPeta, buildPaket) on random answers.
 * Needs the handover folder next to code/. Run: npm run verify:parity
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import type { Answers } from "../src/lib/data/types";
import { buildPack } from "../src/lib/diagnosis/scoring";

const html = readFileSync(path.resolve(__dirname, "../../document/bikinlaris-handover/bikinlaris/prototype/index.html"), "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
const NL = String.fromCharCode(10);
const pick = (name: string) => {
  const start = script.indexOf("function " + name + "(");
  const end = script.indexOf(NL + "function ", start + 1);
  return script.slice(start, end) + NL;
};
const bankStart = html.indexOf('<script id="bank" type="application/json">');
const bankJson = html.slice(html.indexOf(">", bankStart) + 1, html.indexOf("</script>", bankStart));
const BANK = JSON.parse(bankJson);
const ids: string[] = BANK.diagnosa.map((q: { id: string }) => q.id);
const vals = ["ya", "kadang", "belum", "lewati"];
let mismatches = 0;
const RUNS = 1000;
for (let t = 0; t < RUNS; t++) {
  const answers: Record<string, string> = {};
  ids.forEach((qid) => (answers[qid] = vals[Math.floor(Math.random() * (Math.random() < 0.1 ? 4 : 3))]));
  const repot = BANK.bagian[Math.floor(Math.random() * 6)].id;
  const S = { jawaban: answers, repot };
  const proto = new Function(
    "BANK",
    "S",
    "todayKey",
    pick("skorJawaban") + pick("hitungPeta") + pick("buildPaket") + "return buildPaket();",
  )(BANK, S, () => "x");
  const mine = buildPack(answers as Answers, repot);
  const a = JSON.stringify({
    sops: proto.sops.map((s: { id: string; untuk: string[] }) => [s.id, s.untuk]),
    lain: proto.sopLain,
    masalah: proto.masalah.map((m: { id: string; skor: number }) => [m.id, m.skor]),
    peta: Object.entries(proto.peta as Record<string, { skor: number; merah: number; warna: string }>).map(
      ([k, v]) => [k, v.skor, v.merah, v.warna],
    ),
  });
  const b = JSON.stringify({
    sops: mine.sops.map((s) => [s.sopId, s.problemIds]),
    lain: mine.laterSopIds,
    masalah: mine.problems.map((m) => [m.id, m.score]),
    peta: Object.entries(mine.map).map(([k, v]) => [k, v.score, v.redCount, v.color]),
  });
  if (a !== b) {
    mismatches++;
    if (mismatches < 3) console.log("DIFF", repot, NL, a, NL, b);
  }
}
console.log("Selisih dengan prototipe:", mismatches, "dari", RUNS, "kombinasi jawaban.");
if (mismatches > 0) process.exit(1);
