import { TASK_KINDS } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import type { Pack } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

import { getSop } from "./bank";

const WHATSAPP_BASE_URL = "https://wa.me/";

/**
 * Plain-text pack for WhatsApp, ported from prototype `teksWA`. Owners forward it to their
 * staff, so it never contains the private link (which also allows "Ulang cek usaha").
 */
export function buildWhatsAppText(businessName: string, pack: Pack): string {
  const copy = id.whatsapp;
  const lines: string[] = [copy.header(businessName), copy.created(formatDate(pack.createdOn)), ""];

  pack.sops.forEach((packSop, index) => {
    const sop = getSop(packSop.sopId);
    lines.push(`*${index + 1}. ${sop.title}*`, `_${sop.goal}_`);
    for (const kind of TASK_KINDS) {
      const tasks = sop.tasks.filter((task) => task.kind === kind);
      if (tasks.length === 0) continue;
      lines.push(copy.groups[kind]);
      tasks.forEach((task) =>
        lines.push(`${copy.checkbox} ${packSop.taskTexts?.[task.id] ?? task.text}`),
      );
    }
    lines.push("");
  });

  lines.push(copy.footer(formatDate(pack.followUpOn)));
  return lines.join("\n");
}

/**
 * wa.me link. With a number it opens that chat; without one WhatsApp asks who to send to
 * (used for the owner's own sharing, and in demo mode so test messages never reach a stranger).
 */
export function whatsAppUrl(text: string, number: string | null = null): string {
  return `${WHATSAPP_BASE_URL}${number ?? ""}?text=${encodeURIComponent(text)}`;
}
