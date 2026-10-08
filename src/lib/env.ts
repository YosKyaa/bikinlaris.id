import "server-only";

import { z } from "zod";

/** Claude model for SOP personalisation (docs/keputusan.md: "model Sonnet"). */
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5-5";
/** Query parameter that carries the participant code into the questionnaire link. */
const DEFAULT_SURVEY_CODE_PARAM = "kode";

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
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_MODEL: z.string().min(1).default(DEFAULT_ANTHROPIC_MODEL),
    USE_LLM: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    /** Public site address used in WhatsApp messages. Derived from the request when empty. */
    APP_URL: z.url().optional(),
    /** Questionnaire link (SurveyMonkey) sent at day 30. The send button stays off when empty. */
    SURVEY_URL: z.url().optional(),
    /** Empty string = do not append the participant code to the questionnaire link. */
    SURVEY_CODE_PARAM: z.string().default(DEFAULT_SURVEY_CODE_PARAM),
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
    if (env.USE_LLM) require("ANTHROPIC_API_KEY", "USE_LLM=true");
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
export const isProduction = env.NODE_ENV === "production";
