import type { ReactNode } from "react";
import { FaCheckCircle, FaRegStar } from "react-icons/fa";

type AuthShellProps = {
  children: ReactNode;
  variant: "login" | "signup" | "forgot";
};

const bullets = [
  "Built for multi-location businesses",
  "Fast dashboard with clean workflows",
  "Google login and email auth support",
];

const AuthShell = ({ children, variant }: AuthShellProps) => {
  const isLogin = variant === "login";
  const isForgot = variant === "forgot";

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#f6f8fc]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[34px_34px]"
      />

      <div className="relative grid h-full w-full overflow-hidden lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden h-full bg-white p-10 lg:block xl:p-12">
          <div
            aria-hidden
            className="absolute left-[-70px] top-[-70px] h-52 w-52 rounded-full bg-secondary/20 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute bottom-[-90px] right-[-70px] h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[640px] flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
                <FaRegStar className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900">Reviwee</p>
                <p className="text-xs text-slate-500">Reviwee.com admin portal</p>
              </div>
            </div>

            <div className="mt-12">
              <p className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                Reviwee Admin Suite
              </p>
              <h2 className="mt-5 max-w-lg text-[2.1rem] font-bold leading-[1.14] tracking-tight text-slate-900">
                {isForgot
                  ? "Recover access quickly and keep your admin workspace secure."
                  : isLogin
                    ? "A cleaner way to manage reviews and brand reputation."
                    : "Create your workspace and launch in minutes."}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
                {isForgot
                  ? "Use your registered email to receive a secure link and get back to managing reviews without friction."
                  : isLogin
                    ? "Track feedback, monitor growth, and respond to customers with one focused admin experience."
                    : "Set up secure access, connect your profile, and start improving your customer trust metrics."}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {bullets.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <FaCheckCircle className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Benchmarks
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xl font-bold text-slate-900">4.9</p>
                  <p className="text-[11px] text-slate-500">Avg rating</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">+24%</p>
                  <p className="text-[11px] text-slate-500">Engagement</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">12m</p>
                  <p className="text-[11px] text-slate-500">Response SLA</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="scrollbar-hide relative flex h-full min-h-0 items-start justify-start overflow-y-auto bg-white p-3 sm:p-6 lg:p-8 lg:items-center lg:justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(119,143,240,0.18),transparent_35%),radial-gradient(circle_at_12%_88%,rgba(28,26,94,0.1),transparent_36%)]"
          />
          <header className="absolute left-4 top-4 z-20 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <FaRegStar className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-primary">Reviwee</p>
              <p className="text-[11px] text-slate-500">admin portal</p>
            </div>
          </header>

          <div
            className="relative z-30 w-full max-w-[550px] pt-24 pb-8 sm:pt-20 sm:pb-7 lg:pt-0 lg:py-4"
          >
           
            {children}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthShell;
