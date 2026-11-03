import "server-only";

import { id } from "@/content/id";

import { AiError, type AiProvider } from "./types";

/** A short wait, so demos show the coach's typing bubble like a real answer (5–7 s) would. */
const DEMO_LATENCY_MS = 1500;

/**
 * Stand-in for DATA_SOURCE=mock without an API key, so the coach can be tried and demoed.
 * Always gives the same sample answer; never used with real data.
 */
export const demoProvider: AiProvider = {
  label: "demo",

  async generateText() {
    await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
    return id.coach.demoAnswer;
  },

  async generateJson() {
    throw new AiError("tidak_tersedia");
  },
};
