/**
 * Detects “no credits / plan expired” style API payloads so we can route to a dedicated page.
 */
export function isInsufficientCreditsPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const message = typeof d.message === "string" ? d.message.toLowerCase() : "";
  const issue = typeof d.issue === "string" ? d.issue.toLowerCase() : "";

  const haystack = `${message} ${issue}`;
  if (haystack.includes("insufficient credit")) return true;
  if (haystack.includes("no credit")) return true;
  if (haystack.includes("out of credit")) return true;
  if (haystack.includes("credit exhausted")) return true;
  if (haystack.includes("plan expired")) return true;
  if (haystack.includes("subscription expired")) return true;
  return false;
}

export function getErrorPayloadData(error: unknown): unknown {
  if (error && typeof error === "object" && "data" in error) {
    return (error as { data: unknown }).data;
  }
  return undefined;
}

export function isInsufficientCreditsError(error: unknown): boolean {
  return isInsufficientCreditsPayload(getErrorPayloadData(error));
}

/** Reads `businessName` from an API JSON body when present (for redirects). */
export function pickBusinessNameFromPayload(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const n = (data as Record<string, unknown>).businessName;
  if (typeof n === "string" && n.trim()) return n.trim();
  return undefined;
}
