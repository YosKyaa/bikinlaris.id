import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

import { AiError, type AiProvider } from "./types";

/** Refusals are rerouted server-side to a model that can answer (beta). */
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new AiError("waktu_habis");
  if (error instanceof Anthropic.APIConnectionError) return new AiError("koneksi");
  if (error instanceof Anthropic.RateLimitError) return new AiError("batas_pemakaian");
  if (error instanceof Anthropic.AuthenticationError) return new AiError("kunci_api");
  if (error instanceof Anthropic.APIError && error.status) {
    return new AiError(`api_${error.status}`);
  }
  return new AiError("lainnya");
}

/** Claude through the official SDK. No retries: each feature sets its own time budget. */
export function anthropicProvider(config: { apiKey: string; model: string }): AiProvider {
  const client = (timeout: number) =>
    new Anthropic({ apiKey: config.apiKey, timeout, maxRetries: 0 });

  return {
    label: `anthropic:${config.model}`,

    async generateText(request) {
      try {
        const response = await client(request.timeoutMs).beta.messages.create({
          model: config.model,
          max_tokens: request.maxOutputTokens,
          betas: [FALLBACK_BETA],
          fallbacks: "default",
          system: request.instructions,
          output_config: { effort: "low" },
          messages: request.messages,
        });
        if (response.stop_reason === "refusal") throw new AiError("ditolak");
        const text = response.content
          .flatMap((block) => (block.type === "text" ? [block.text] : []))
          .join("")
          .trim();
        if (!text) {
          throw new AiError(response.stop_reason === "max_tokens" ? "terpotong" : "format");
        }
        return text;
      } catch (error) {
        throw toAiError(error);
      }
    },

    async generateJson(request) {
      try {
        const response = await client(request.timeoutMs).beta.messages.parse({
          model: config.model,
          max_tokens: request.maxOutputTokens,
          betas: [FALLBACK_BETA],
          fallbacks: "default",
          system: request.instructions,
          output_config: { effort: "low", format: betaZodOutputFormat(request.schema) },
          messages: [{ role: "user", content: request.input }],
        });
        if (response.stop_reason === "refusal") throw new AiError("ditolak");
        const result = request.schema.safeParse(response.parsed_output);
        if (!result.success) throw new AiError("format");
        return result.data;
      } catch (error) {
        throw toAiError(error);
      }
    },
  };
}
