import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// SHA-256 of the canonical ms-tokens.css v1.0 (shared design system, Appendix A.2).
// The file is copied, never edited: local styles go in globals.css using var(--ms-*).
const CANONICAL_SHA256 = "4ee1fcd1e10a7592079aebe6ba675cf46d971ae3fdce64b54efadedef1a4fe99";

describe("ms-tokens.css", () => {
  it("matches the canonical design tokens byte for byte (LF line endings)", () => {
    const raw = readFileSync(fileURLToPath(new URL("./ms-tokens.css", import.meta.url)), "utf8");
    // Windows checkouts may convert to CRLF; the canonical hash is computed on LF.
    const normalized = raw.replace(/\r\n/g, "\n");
    expect(createHash("sha256").update(normalized, "utf8").digest("hex")).toBe(CANONICAL_SHA256);
  });
});
