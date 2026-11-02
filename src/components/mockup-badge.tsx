export function MockupBadge({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-3 left-3 z-10 inline-flex items-center rounded-full bg-black/75 px-2 py-[0.32rem] text-[10px] font-semibold tracking-[0.16em] text-white uppercase ${className}`.trim()}
    >
      {label}
    </span>
  );
}
