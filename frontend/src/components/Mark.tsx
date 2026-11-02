type LogoProps = {
  className?: string;
  size?: number;
  withWordmark?: boolean;
};

/**
 * KPC Reports mark — taste-skill app face:
 * accent hue on the mark (not a black letter tile);
 * symbol from the product: report sheet + selection rail.
 */
export function Mark({
  className = "",
  size = 32,
  withWordmark = false,
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        role="img"
        aria-label="KPC Reports"
      >
        <title>KPC Reports</title>
        <rect width="40" height="40" rx="10" fill="#ff6a00" />
        <rect
          x="1.25"
          y="1.25"
          width="37.5"
          height="37.5"
          rx="8.75"
          stroke="#000"
          strokeOpacity="0.2"
          strokeWidth="1.25"
        />

        {/* Report sheet */}
        <rect x="11" y="9" width="18" height="22" rx="3" fill="#fff7f0" />

        {/* Folded corner */}
        <path d="M23.5 9H26a3 3 0 0 1 3 3v2.5L23.5 9Z" fill="#ffd7b8" />
        <path
          d="M23.5 9v5.5H29"
          stroke="#ff6a00"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Selection rail (data-terminal accent motif) */}
        <rect x="14" y="14.5" width="2.4" height="12.5" rx="1.2" fill="#111" />

        {/* Report body lines */}
        <path
          d="M19 16.5h7.5M19 20.5h6M19 24.5h7"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
            KPC
          </span>
          <span className="mt-1 text-[11px] text-[var(--muted)]">Reports</span>
        </span>
      ) : null}
    </span>
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark size={40} />
      <span className="flex flex-col">
        <span className="text-[18px] font-semibold tracking-tight text-[var(--text)]">
          KPC
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className="text-[12px] text-[var(--muted)]">Reports</span>
          <span aria-hidden="true" className="h-px w-8 bg-[var(--orange)]" />
        </span>
      </span>
    </span>
  );
}
