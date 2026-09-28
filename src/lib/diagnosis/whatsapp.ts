import { TASK_KINDS } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import type { Pack } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

import { getSop } from "./bank";

const WHATSAPP_SHARE_URL = "https://wa.me/?text=";

/** Plain-text pack for WhatsApp, ported from prototype `teksWA`. */
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

export function whatsAppShareUrl(text: string): string {
  return WHATSAPP_SHARE_URL + encodeURIComponent(text);
}
