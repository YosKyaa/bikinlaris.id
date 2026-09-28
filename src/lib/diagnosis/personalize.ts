import "server-only";

import { env } from "@/lib/env";
import type { Business, Pack, PackSop } from "@/lib/data/types";

/**
 * Personalisation step (spec `claude_api`). STUB: Claude API integration is not part of this
 * phase. Contract to implement later, server-side only:
 * - one call per diagnosis, model Sonnet, timeout 15 s, then fall back to the template;
 * - rewrite only `whyText` and task texts to mention business name/product;
 * - never add or remove SOPs or tasks: validate ids before merging;
 * - store `source: "llm"` and the raw response (`llm_raw`) when it succeeds.
 */
export async function personalizePack(
  _business: Business,
  pack: Pack,
): Promise<{ source: Pack["source"]; sops: PackSop[] }> {
  if (env.USE_LLM) {
    // Not implemented yet: fall through to the template so the flow never blocks.
  }
  return { source: "template", sops: pack.sops };
}
