import { expect, test } from "@playwright/test";

import { buildRows, filterByAssignee, participantStage, summaryTable } from "@/lib/data/research";

import { MEMBER_A, MEMBER_B, note, participant, TODAY } from "./fixtures";

test("stages follow the 30 days and the questionnaire", () => {
  expect(participantStage(participant({}), TODAY)).toBe("belum_mulai");
  expect(participantStage(participant({ packDaysAgo: 10 }), TODAY)).toBe("belum_h30");
  expect(participantStage(participant({ packDaysAgo: 30 }), TODAY)).toBe("siap_dikirim");
  expect(participantStage(participant({ packDaysAgo: 31, sent: true }), TODAY)).toBe("terkirim");
});

test("rows carry the pendamping and the newest contact", () => {
  const p = participant({ assignedTo: MEMBER_A, packDaysAgo: 30 });
  const newest = note(p.business.id, "minta_nanti", "2026-11-04T03:00:00.000Z");
  const older = note(p.business.id, "tidak_diangkat", "2026-11-03T03:00:00.000Z");
  // The store returns notes newest first.
  const [row] = buildRows([p], TODAY, [newest, older]);
  expect(row.assignedTo).toBe(MEMBER_A);
  expect(row.contactCount).toBe(2);
  expect(row.lastContact).toEqual({ outcome: "minta_nanti", createdAt: newest.createdAt });
});

test("the pendamping filter: mine, unassigned, one member, everyone", () => {
  const mine = participant({ assignedTo: MEMBER_A });
  const theirs = participant({ assignedTo: MEMBER_B });
  const open = participant({ assignedTo: null });
  const rows = buildRows([mine, theirs, open], TODAY);
  const ids = (filter: string | null) =>
    filterByAssignee(rows, filter, MEMBER_A).map((r) => r.businessId);
  expect(ids("saya")).toEqual([mine.business.id]);
  expect(ids("belum")).toEqual([open.business.id]);
  expect(ids(MEMBER_B)).toEqual([theirs.business.id]);
  expect(ids(null)).toHaveLength(3);
});

test("the summary CSV adds new columns at the end (SmartPLS columns unchanged)", () => {
  const p = participant({ assignedTo: MEMBER_A, packDaysAgo: 31 });
  const table = summaryTable([p], [], TODAY, {
    notes: [note(p.business.id, "tersambung", "2026-11-04T03:00:00.000Z")],
    memberNames: new Map([[MEMBER_A, "Tim Lapangan"]]),
  });
  expect(table.header.slice(0, 2)).toEqual(["kode", "business_id"]);
  expect(table.header.slice(-6)).toEqual([
    "pendamping",
    "kontak_jumlah",
    "kontak_terakhir_hasil",
    "kontak_terakhir",
    "teks_untuk",
    "teks_versi",
  ]);
  expect(table.rows[0].slice(-6)).toEqual([
    "Tim Lapangan",
    1,
    "tersambung",
    "2026-11-04T03:00:00.000Z",
    "umum",
    null,
  ]);
  expect(table.header).toContain("event_unduh_pdf");
});
