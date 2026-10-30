import "server-only";

import { env, isMockData } from "@/lib/env";

import { anthropicProvider } from "./anthropic";
import { demoProvider } from "./demo";
import { openAiProvider } from "./openai";
import type { AiProvider } from "./types";

export * from "./types";

/**
 * The AI provider picked by AI_PROVIDER ("openai" or "anthropic"), or null without its key.
 * With mock data and no key, a demo provider answers so the coach can still be tried.
 */
export function getAiProvider(): AiProvider | null {
  const provider =
    env.AI_PROVIDER === "anthropic"
      ? env.ANTHROPIC_API_KEY
        ? anthropicProvider({ apiKey: env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL })
        : null
      : env.OPENAI_API_KEY
        ? openAiProvider({
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_MODEL,
            baseUrl: env.OPENAI_BASE_URL,
          })
        : null;
  return provider ?? (isMockData ? demoProvider : null);
}

/** The coach is shown when it is switched on (AI_COACH=true) and a provider can answer. */
export const isCoachEnabled = () => env.AI_COACH && getAiProvider() !== null;
