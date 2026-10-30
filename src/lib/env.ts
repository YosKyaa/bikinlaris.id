import "server-only";

import { z } from "zod";

/** Claude model when AI_PROVIDER=anthropic (docs/keputusan.md: "model Sonnet"). */
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5-5";
/**
 * OpenAI model when AI_PROVIDER=openai: the most economical GPT-6 model (developers.openai.com,
 * models page, 30 Oktober 2026). "gpt-6.1-terra" writes better at about ten times the price.
 */
const DEFAULT_OPENAI_MODEL = "gpt-6-luna";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
/** Query parameter that carries the participant code into the questionnaire link. */
const DEFAULT_SURVEY_CODE_PARAM = "kode";
/**
 * [KONFIRMASI] Last day for day-30 questionnaires. docs/konteks-riset.md: "kuesioner hari ke-30
 * harus selesai paling lambat awal Desember". Override with RESEARCH_DEADLINE, no code change.
 */
const DEFAULT_RESEARCH_DEADLINE = "2026-12-01";

/**
 * Server environment, validated once at import. A missing required variable throws,
 * which fails `next build` (pages import the data layer, which imports this file).
 */
const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    /** "mock" = typed in-memory demo data, "supabase" = real backend. */
    DATA_SOURCE: z.enum(["mock", "supabase"]).default("mock"),
    /** Signs the mock staff session cookie. Required for a production build that uses mock data. */
    MOCK_SESSION_SECRET: z.string().min(32).optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    /** Which company answers the AI features: "openai" or "anthropic" (lib/ai). */
    AI_PROVIDER: z.enum(["openai", "anthropic"]).default("openai"),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).default(DEFAULT_OPENAI_MODEL),
    /** Another service with the same /responses API can be used by changing this. */
    OPENAI_BASE_URL: z.url().default(DEFAULT_OPENAI_BASE_URL),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_MODEL: z.string().min(1).default(DEFAULT_ANTHROPIC_MODEL),
    /** AI rewrites the SOP texts so they mention the business (template text otherwise). */
    USE_LLM: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    /** "Tanya coach" on the pack page (lib/coach). */
    AI_COACH: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    /** Public site address used in WhatsApp messages. Derived from the request when empty. */
    APP_URL: z.url().optional(),
    /** Questionnaire link (SurveyMonkey) sent at day 30. The send button stays off when empty. */
    SURVEY_URL: z.url().optional(),
    /** Empty string = do not append the participant code to the questionnaire link. */
    SURVEY_CODE_PARAM: z.string().default(DEFAULT_SURVEY_CODE_PARAM),
    /**
     * "true" shows "Masuk dengan Google" for the team. Turn on only after the Google provider
     * is enabled in Supabase (docs/SUPABASE.md); ignored with DATA_SOURCE=mock.
     */
    GOOGLE_LOGIN: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    /** Fieldwork deadline (yyyy-mm-dd, WIB) used by the monitoring page's projections. */
    RESEARCH_DEADLINE: z.iso.date().default(DEFAULT_RESEARCH_DEADLINE),
  })
  .superRefine((env, ctx) => {
    const require = (key: keyof typeof env, reason: string) => {
      if (!env[key])
        ctx.addIssue({ code: "custom", path: [key], message: `Wajib diisi: ${reason}` });
    };
    if (env.DATA_SOURCE === "supabase") {
      require("NEXT_PUBLIC_SUPABASE_URL", "DATA_SOURCE=supabase");
      require("NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATA_SOURCE=supabase");
    }
    if (env.DATA_SOURCE === "mock" && env.NODE_ENV === "production") {
      require("MOCK_SESSION_SECRET", "build produksi dengan DATA_SOURCE=mock");
    }
    // Real data needs a real key; mock data falls back to the demo provider.
    if ((env.USE_LLM || env.AI_COACH) && env.DATA_SOURCE === "supabase") {
      const reason = `USE_LLM/AI_COACH dengan AI_PROVIDER=${env.AI_PROVIDER}`;
      require(env.AI_PROVIDER === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY", reason);
    }
  });

/** Keys where an empty value is meaningful; every other empty value counts as "not set". */
const EMPTY_ALLOWED = new Set(["SURVEY_CODE_PARAM"]);
const rawEnv = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [
    key,
    value === "" && !EMPTY_ALLOWED.has(key) ? undefined : value,
  ]),
);

const parsed = serverEnvSchema.safeParse(rawEnv);

if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Environment tidak valid. Lihat .env.example.\n${details}`);
}

export const env = parsed.data;

/** Fixed development-only secret so `npm run dev` works without setup. Never used in production. */
const DEV_MOCK_SECRET = "dev-only-mock-session-secret-not-for-production";

export const mockSessionSecret = env.MOCK_SESSION_SECRET ?? DEV_MOCK_SECRET;
export const isMockData = env.DATA_SOURCE === "mock";
export const isGoogleLogin = env.GOOGLE_LOGIN && !isMockData;
export const isProduction = env.NODE_ENV === "production";
