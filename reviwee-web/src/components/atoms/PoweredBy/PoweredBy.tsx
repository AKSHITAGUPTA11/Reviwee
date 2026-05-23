const poweredByText = import.meta.env.VITE_APP_POWERED_BY as string | undefined;

type PoweredByProps = {
  /** Default: bottom strip in layout flow (scroll stays above). `stickyBar`: Google CTA bar. */
  variant?: "default" | "stickyBar";
  className?: string;
};

const PoweredBy = ({ variant = "default", className = "" }: PoweredByProps) => {
  if (!poweredByText) return null;

  const pill = (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 p-1 text-[10px] leading-snug text-slate-500 shadow-sm shadow-slate-200/30 sm:text-[11px]">
      <span
        className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 sm:h-4 sm:w-4"
        aria-hidden
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
        </svg>
      </span>
      <span>{poweredByText}</span>
    </div>
  );

  if (variant === "stickyBar") {
    return (
      <footer
        role="contentinfo"
        className={`border-t border-slate-200/70 p-1 ${className}`.trim()}
      >
        <div className="flex justify-end">{pill}</div>
      </footer>
    );
  }

  return (
    <footer
      role="contentinfo"
      className={`shrink-0 border-t border-slate-200/80 bg-white/90 backdrop-blur-sm ${className}`.trim()}
    >
      <div className="flex w-full justify-end p-1 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]">
        {pill}
      </div>
    </footer>
  );
};

export default PoweredBy;
