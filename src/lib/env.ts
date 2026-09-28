import "server-only";

import { z } from "zod";

/**
 * Server environment, validated once at import. A missing required variable throws,
 * which fails `next build` (pages import the data layer, which imports this file).
 */
const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    /** "mock" = typed in-memory data (until the Supabase schema exists), "supabase" = real backend. */
    DATA_SOURCE: z.enum(["mock", "supabase"]).default("mock"),
    /** Signs the mock session cookie. Required for a production build that uses mock data. */
    MOCK_SESSION_SECRET: z.string().min(32).optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    USE_LLM: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  })
  .superRefine((env, ctx) => {
    const require = (key: keyof typeof env, reason: string) => {
      if (!env[key])
        ctx.addIssue({ code: "custom", path: [key], message: `Wajib diisi: ${reason}` });
    };
    if (env.DATA_SOURCE === "supabase") {
      require("NEXT_PUBLIC_SUPABASE_URL", "DATA_SOURCE=supabase");
      require("NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATA_SOURCE=supabase");
      require("SUPABASE_SERVICE_ROLE_KEY", "DATA_SOURCE=supabase");
    }
    if (env.DATA_SOURCE === "mock" && env.NODE_ENV === "production") {
      require("MOCK_SESSION_SECRET", "build produksi dengan DATA_SOURCE=mock");
    }
    if (env.USE_LLM) require("ANTHROPIC_API_KEY", "USE_LLM=true");
  });

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Environment tidak valid. Lihat .env.example.\n${details}`);
}

export const env = parsed.data;

/** Fixed development-only secret so `npm run dev` works without setup. Never used in production. */
const DEV_MOCK_SECRET = "dev-only-mock-session-secret-not-for-production";

export const mockSessionSecret = env.MOCK_SESSION_SECRET ?? DEV_MOCK_SECRET;
export const isMockData = env.DATA_SOURCE === "mock";
