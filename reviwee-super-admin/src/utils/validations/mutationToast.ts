import { showToast } from "./showToaster";

type ApiPayload = { message?: string; status?: boolean };

export function getApiErrorMessage(error: unknown): string | undefined {
  if (error && typeof error === "object") {
    const e = error as { data?: unknown; message?: unknown };
    if (e.data && typeof e.data === "object" && "message" in e.data) {
      const m = (e.data as { message?: unknown }).message;
      if (typeof m === "string" && m.trim() !== "") return m;
    }
    if (typeof e.message === "string" && e.message.trim() !== "") {
      return e.message;
    }
  }
  return undefined;
}

export type MutationToastOptions = {
  /** When set, success only if `data.status` is truthy (e.g. change-password API). */
  requireTruthyStatusForSuccess?: boolean;
};

/**
 * Shows toast from API `message` (error body or success body). Returns whether the mutation is a logical success.
 */
export function applyMutationToast(
  result: { data?: unknown; error?: unknown },
  options?: MutationToastOptions
): boolean {
  if ("error" in result && result.error != null) {
    showToast("error", getApiErrorMessage(result.error) ?? "Request failed");
    return false;
  }

  const payload = result.data as ApiPayload | undefined;

  if (payload?.status === false) {
    showToast(
      "error",
      (payload.message && payload.message.trim()) || "Request failed"
    );
    return false;
  }

  if (options?.requireTruthyStatusForSuccess && !payload?.status) {
    showToast(
      "error",
      (payload?.message && payload.message.trim()) || "Request failed"
    );
    return false;
  }

  showToast(
    "success",
    (payload?.message && payload.message.trim()) || "Success"
  );
  return true;
}
