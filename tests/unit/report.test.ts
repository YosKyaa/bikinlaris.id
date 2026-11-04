import { expect, test } from "@playwright/test";
import JSZip from "jszip";

import { buildReport } from "@/lib/report/workbook";

import { MEMBER_A, note, participant, TODAY } from "./fixtures";

test("the Excel report has its sheets and native charts", async () => {
  const people = [
    participant({ assignedTo: MEMBER_A, packDaysAgo: 31 }),
    participant({ packDaysAgo: 5 }),
    participant({}),
  ];
  const file = await buildReport({
    participants: people,
    events: [],
    coachMessages: [],
    followUp: {
      notes: [note(people[0].business.id, "tersambung", "2026-11-04T03:00:00.000Z")],
      memberNames: new Map([[MEMBER_A, "Tim Lapangan"]]),
    },
    today: TODAY,
  });
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files);
  expect(names.filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))).toHaveLength(5);
  expect(names.filter((n) => /^xl\/charts\/chart\d+\.xml$/.test(n))).toHaveLength(3);
  const workbook = await zip.file("xl/workbook.xml")?.async("string");
  expect(workbook).toContain("Daftar UMKM");
});
