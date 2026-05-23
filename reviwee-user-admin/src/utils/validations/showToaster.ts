import { toast } from "react-hot-toast";

type ToastType = "success" | "error" | "loading" | "custom";

/** Extracts user-facing message from RTK Query results, unwrap errors, or API bodies. */
export const getApiMessage = (
  res: unknown,
  fallback = "Something went wrong"
) => {
  if (res == null) return fallback;
  if (typeof res === "string" && res.trim()) return res;
  if (typeof res !== "object") return fallback;
  const o = res as Record<string, unknown>;

  const err = o.error;
  if (err && typeof err === "object" && err !== null) {
    const ed = (err as { data?: unknown }).data;
    if (ed && typeof ed === "object" && ed !== null && "message" in ed) {
      const m = (ed as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
    const em = (err as { message?: unknown }).message;
    if (typeof em === "string" && em.trim()) return em;
  }

  const data = o.data;
  if (data && typeof data === "object" && data !== null && "message" in data) {
    const m = (data as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }

  const msg = o.message;
  if (typeof msg === "string" && msg.trim()) return msg;

  return fallback;
};

export const showToast = (type: ToastType, message: string) => {
  toast[type](message, {
    duration: 5000,
    position: "top-center",
    className: `border-l-4 ${
      type === "success" ? "border-green-500" : "border-red-500"
    } border-green-500`,
  });
};
