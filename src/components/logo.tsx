import Image from "next/image";

export function Logo({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: 40 | 80;
}) {
  const large = size === 80;
  return (
    <span
      className={`inline-flex items-center font-[family-name:var(--font-display)] font-normal tracking-tight ${
        large ? "gap-3 text-4xl" : "gap-2"
      } ${className}`}
    >
      <Image
        src="/brand/bluzeta-icon.png"
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className={`${large ? "size-20" : "size-10"} shrink-0 object-contain drop-shadow-[0_8px_10px_rgba(16,18,24,0.18)]`}
        priority
      />
      bluzeta
    </span>
  );
}
