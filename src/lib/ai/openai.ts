import "server-only";

import { z } from "zod";

import { AiError, type AiFailure, type AiProvider } from "./types";

/**
 * OpenAI Responses API over plain fetch (no SDK dependency). Works with any service that
 * offers the same /responses endpoint by changing OPENAI_BASE_URL.
 * Request and response shapes: developers.openai.com/api/docs/guides/text.
 */

/** Supported by every GPT-6 model (docs: models page); keeps answers quick and cheap. */
const REASONING_EFFORT = "low";

/** The text is not at a fixed index: collect every output_text part of the message items. */
const responseSchema = z.object({
  status: z.string().optional(),
  output: z
    .array(
      z.object({
        type: z.string(),
        content: z
          .array(
            z.object({
              type: z.string(),
              text: z.string().optional(),
              refusal: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .default([]),
});

interface OpenAiConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

function failureFromStatus(status: number, body: string): AiFailure {
  if (status === 401 || status === 403) return "kunci_api";
  if (status === 429) {
    return body.includes("insufficient_quota") ? "kuota_habis" : "batas_pemakaian";
  }
  return `api_${status}`;
}

function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  ) {
    return new AiError("waktu_habis");
  }
  // fetch() rejects with a TypeError when the network or DNS fails.
  if (error instanceof TypeError) return new AiError("koneksi");
  return new AiError("lainnya");
}

export function openAiProvider(config: OpenAiConfig): AiProvider {
  async function respond(body: Record<string, unknown>, timeoutMs: number): Promise<string> {
    try {
      const response = await fetch(`${config.baseUrl}/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          reasoning: { effort: REASONING_EFFORT },
          // Nothing is kept on OpenAI's side; the app stores what the research needs.
          store: false,
          ...body,
        }),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      if (!response.ok) {
        throw new AiError(failureFromStatus(response.status, await response.text()));
      }
      const parsed = responseSchema.safeParse(await response.json());
      if (!parsed.success) throw new AiError("format");
      const parts = parsed.data.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content ?? []);
      if (parts.some((part) => part.type === "refusal")) throw new AiError("ditolak");
      const text = parts
        .filter((part) => part.type === "output_text")
        .map((part) => part.text ?? "")
        .join("")
        .trim();
      if (!text) throw new AiError(parsed.data.status === "incomplete" ? "terpotong" : "format");
      return text;
    } catch (error) {
      throw toAiError(error);
    }
  }

  return {
    label: `openai:${config.model}`,

    generateText(request) {
      return respond(
        {
          instructions: request.instructions,
          input: request.messages,
          max_output_tokens: request.maxOutputTokens,
        },
        request.timeoutMs,
      );
    },

    async generateJson(request) {
      const schema: Record<string, unknown> = { ...z.toJSONSchema(request.schema) };
      delete schema.$schema;
      const text = await respond(
        {
          instructions: request.instructions,
          input: request.input,
          max_output_tokens: request.maxOutputTokens,
          text: { format: { type: "json_schema", name: request.name, schema, strict: false } },
        },
        request.timeoutMs,
      );
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        throw new AiError("format");
      }
      const result = request.schema.safeParse(json);
      if (!result.success) throw new AiError("format");
      return result.data;
    },
  };
}
