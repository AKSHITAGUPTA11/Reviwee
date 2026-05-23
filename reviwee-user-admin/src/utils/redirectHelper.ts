export const redirectMap: Record<string, string> = {
  // Onboarding flow pages (no side-nav/back UI).
  SUBSCRIPTION: "/onboarding/subscription",
  PROFILE: "/onboarding/business-profile-add",
};

/** Maps backend redirect keys (e.g. SUBSCRIPTION) to app paths, if known. */
export const getMappedRedirectPath = (
  redirectTo: string | undefined,
): string | undefined => {
  if (!redirectTo) return undefined;
  return redirectMap[redirectTo];
};

/**
 * Backend puts `redirectTo` in different places (signup root, login under `data`, legacy nested `data.data`).
 */
export const getRedirectToKeyFromAuthResponse = (
  res: unknown,
): string | undefined => {
  if (res == null || typeof res !== "object") return undefined;
  const r = res as Record<string, unknown>;

  if (typeof r.redirectTo === "string" && r.redirectTo.trim()) {
    return r.redirectTo.trim();
  }

  const data = r.data;
  if (data == null || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;

  if (typeof d.redirectTo === "string" && d.redirectTo.trim()) {
    return d.redirectTo.trim();
  }

  const inner = d.data;
  if (inner != null && typeof inner === "object") {
    const i = inner as Record<string, unknown>;
    if (typeof i.redirectTo === "string" && i.redirectTo.trim()) {
      return i.redirectTo.trim();
    }
  }

  return undefined;
};

export const handleRedirect = (
  redirectTo: string | undefined,
  navigate: (path: string, options?: { replace?: boolean }) => void,
  delay: number = 0,
) => {
  const path = getMappedRedirectPath(redirectTo);
  if (!path) return;

  setTimeout(() => {
    navigate(path, { replace: true });
  }, delay);
};
