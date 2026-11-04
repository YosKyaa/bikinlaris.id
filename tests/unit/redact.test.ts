import { expect, test } from "@playwright/test";

import { cut, errorMessage, safeMessage, safePath } from "@/lib/monitoring/redact";

test("the private link token never reaches the error log", () => {
  expect(safePath("/u/0123456789abcdef0123456789abcdef")).toBe("/u/[token]");
  expect(safePath("/u/demo/extra")).toBe("/u/[token]/extra");
  expect(safePath("/paket?info=pdf#isi")).toBe("/paket");
  expect(safePath(null)).toBeNull();
  expect(safeMessage("gagal untuk 0123456789ABCDEF0123456789abcdef")).toBe("gagal untuk [token]");
});

test("long text is cut, empty text stays empty", () => {
  expect(cut("abcdef", 3)).toBe("abc");
  expect(cut("", 3)).toBeNull();
  expect(cut(undefined, 3)).toBeNull();
});

test("errors become one short line", () => {
  expect(errorMessage(new TypeError("fetch failed"))).toBe("TypeError: fetch failed");
  expect(errorMessage("teks")).toBe("teks");
  expect(errorMessage({ x: 1 })).toBe("tanpa_pesan");
});
