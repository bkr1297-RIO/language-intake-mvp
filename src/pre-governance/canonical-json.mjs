import { createHash } from "crypto";

/**
 * Deterministic JSON serialization for pre-governance packet hashing.
 * Rejects unstable JavaScript values rather than silently normalizing them.
 */
export function canonicalStringify(value) {
  if (value === null) return "null";

  if (value === undefined) {
    throw new Error("Canonical Error: undefined values are rejected to preserve payload integrity.");
  }
  if (typeof value === "function" || typeof value === "symbol") {
    throw new Error(`Canonical Error: Illegal type [${typeof value}] detected in serialization stream.`);
  }
  if (typeof value === "number" && (Number.isNaN(value) || !Number.isFinite(value))) {
    throw new Error("Canonical Error: Unstable numeric types (NaN/Infinity) are strictly rejected.");
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return "[" + value.map((item) => canonicalStringify(item)).join(",") + "]";
  }

  const sortedKeys = Object.keys(value).sort();
  const parts = sortedKeys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`);
  return "{" + parts.join(",") + "}";
}

/** SHA-256 of direct raw language bytes. Used only for payload hashes. */
export function computePayloadHash(rawLanguage) {
  if (typeof rawLanguage !== "string") {
    throw new Error("Payload Hash Error: rawLanguage must be a string.");
  }
  return createHash("sha256").update(rawLanguage, "utf8").digest("hex");
}

/** SHA-256 of canonical, key-sorted object structure. Used only for packet/event object hashes. */
export function computeCanonicalHash(value) {
  return createHash("sha256").update(canonicalStringify(value), "utf8").digest("hex");
}
