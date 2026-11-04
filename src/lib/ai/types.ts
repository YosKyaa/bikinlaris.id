import type { z } from "zod";

/**
 * Provider-neutral AI calls. Features (SOP personalisation, coach) only see this interface;
 * which company answers is chosen with AI_PROVIDER (lib/ai/index.ts).
 */

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

/** Tokens billed for one call, as the provider reports them (cost view for the admin). */
export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AiTextResult {
  text: string;
  /** Null when the provider did not report usage. */
  usage: AiUsage | null;
}

export interface AiTextRequest {
  instructions: string;
  messages: AiMessage[];
  maxOutputTokens: number;
  timeoutMs: number;
}

export interface AiJsonRequest<T> {
  instructions: string;
  input: string;
  schema: z.ZodType<T>;
  /** Name of the output format (letters, digits, underscores). */
  name: string;
  maxOutputTokens: number;
  timeoutMs: number;
}

/** Why a call failed. Stored for the research team (paket.llm_raw.gagal), never shown to owners. */
export type AiFailure =
  | "waktu_habis"
  | "koneksi"
  | "batas_pemakaian"
  | "kuota_habis"
  | "kunci_api"
  | "ditolak"
  | "format"
  | "terpotong"
  | "tidak_tersedia"
  | `api_${number}`
  | "lainnya";

export class AiError extends Error {
  constructor(readonly reason: AiFailure) {
    super(reason);
    this.name = "AiError";
  }
}

export const failureOf = (error: unknown): AiFailure =>
  error instanceof AiError ? error.reason : "lainnya";

export interface AiProvider {
  /** Provider and model, e.g. "openai:gpt-6-luna". Stored next to every AI answer. */
  readonly label: string;
  generateText(request: AiTextRequest): Promise<AiTextResult>;
  /** The parsed object; throws AiError("format") when the output does not fit the schema. */
  generateJson<T>(request: AiJsonRequest<T>): Promise<T>;
}
