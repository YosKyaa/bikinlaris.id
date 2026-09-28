import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Atomic design: imports only point down the layer stack (CLAUDE.md "Aturan lapisan").
const layerRule = (forbidden) => ({
  "no-restricted-imports": [
    "error",
    {
      patterns: forbidden.map((layer) => ({
        group: [`@/components/${layer}/*`, `@/components/${layer}`],
        message: `Impor hanya boleh ke lapisan di bawahnya (${layer} dilarang di sini).`,
      })),
    },
  ],
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
    },
  },
  {
    files: ["src/components/ui/**"],
    rules: layerRule(["atoms", "molecules", "organisms", "templates"]),
  },
  { files: ["src/components/atoms/**"], rules: layerRule(["molecules", "organisms", "templates"]) },
  { files: ["src/components/molecules/**"], rules: layerRule(["organisms", "templates"]) },
  { files: ["src/components/organisms/**"], rules: layerRule(["templates"]) },
  { files: ["scripts/**"], rules: { "no-console": "off" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "supabase/**"]),
]);

export default eslintConfig;
