import Image from "next/image";

export type MenuIconName =
  | "explorer"
  | "leaf"
  | "heart"
  | "chat-bubble"
  | "bag"
  | "boy"
  | "key"
  | "plus"
  | "back"
  | "sun"
  | "moon"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "communication"
  | "trust";

export function MenuIcon({
  name,
  size = 36,
  className = "",
}: {
  name: MenuIconName;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/menu/${name}.png`}
      alt=""
      width={size}
      height={size}
      className={`object-contain ${className}`.trim()}
      aria-hidden
    />
  );
}
