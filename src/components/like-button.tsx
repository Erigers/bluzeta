"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toggleLikeAction } from "@/lib/actions";

export function LikeButton({
  listingId,
  liked,
  count,
  signedIn,
}: {
  listingId: string;
  liked: boolean;
  count: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setState] = useState({ liked, count });
  const [burst, setBurst] = useState<"in" | "out" | null>(null);

  useEffect(() => {
    setState({ liked, count });
  }, [liked, count]);

  function onClick() {
    if (!signedIn) {
      router.push("/sign-in");
      return;
    }
    const nextLiked = !state.liked;
    setBurst(nextLiked ? "in" : "out");
    setState((prev) => ({
      liked: nextLiked,
      count: Math.max(0, prev.count + (nextLiked ? 1 : -1)),
    }));
    start(async () => {
      try {
        const result = await toggleLikeAction(listingId);
        setState((prev) => ({
          liked: result.liked,
          count: Math.max(
            0,
            prev.count +
              (result.liked === nextLiked ? 0 : result.liked ? 1 : -1),
          ),
        }));
      } catch {
        setState((prev) => ({
          liked: !nextLiked,
          count: Math.max(0, prev.count + (nextLiked ? -1 : 1)),
        }));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-1 text-sm"
      aria-pressed={state.liked}
    >
      <span
        className={`heart-icon ${burst === "in" ? "heart-pop" : ""} ${burst === "out" ? "heart-unpop" : ""}`}
        onAnimationEnd={() => setBurst(null)}
      >
        {burst === "in" ? <span className="heart-ring" /> : null}
        <Image
          src="/heart.png"
          alt=""
          width={44}
          height={44}
          className={`size-6 object-contain transition-[filter,opacity] duration-200 ${
            state.liked ? "opacity-100" : "opacity-40 grayscale"
          }`}
        />
      </span>
      <span>{state.count}</span>
    </button>
  );
}
