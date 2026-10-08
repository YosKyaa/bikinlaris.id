import type { Json } from "@/types/database";

/** Plain domain data → database JSON. Round-trips through JSON so the type claim holds. */
export function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}
