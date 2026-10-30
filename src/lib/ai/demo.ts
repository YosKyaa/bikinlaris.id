import "server-only";

import { id } from "@/content/id";

import { AiError, type AiProvider } from "./types";

/**
 * Stand-in for DATA_SOURCE=mock without an API key, so the coach can be tried and demoed.
 * Always gives the same sample answer; never used with real data.
 */
export const demoProvider: AiProvider = {
  label: "demo",

  async generateText() {
    return id.coach.demoAnswer;
  },

  async generateJson() {
    throw new AiError("tidak_tersedia");
  },
};
