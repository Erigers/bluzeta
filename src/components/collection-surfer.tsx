"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { HeroCtas } from "@/components/hero-ctas";
import { useT } from "@/components/i18n-provider";

export type CollectionItem = {
  id: string;
  image: string;
  title: string;
  isMockup?: boolean;
};

export type CollectionSurferVariant = "magnetic" | "uplift" | "simple";

export function CollectionSurfer({
  items,
  variant = "magnetic",
  signedIn = false,
}: {
  items: CollectionItem[];
  variant?: CollectionSurferVariant;
  signedIn?: boolean;
}) {
  const { t } = useT();
  const reduceMotion = useReducedMotion();
  const duplicatedItems = [...items, ...items];

  const progress = useMotionValue(0);

  useEffect(() => {
    if (items.length === 0 || reduceMotion) {
      progress.set(0);
      return;
    }

    const controls = animate(progress, 1, {
      duration: Math.max(18, items.length * 2.4),
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });

    return () => controls.stop();
  }, [items.length, progress, reduceMotion]);

  const mouseX = useMotionValue(-10000);
  const mouseY = useMotionValue(-10000);

  if (items.length === 0) return null;

  return (
    <section className="full-bleed relative h-[min(38rem,calc(100svh-var(--header-h)-3.5rem))] overflow-hidden bg-background md:h-[calc(100svh-var(--header-h))] dark:bg-black">
      <div
        className="absolute inset-0"
        onMouseMove={(event) => {
          if (variant === "simple") return;
          mouseX.set(event.clientX);
          mouseY.set(event.clientY);
        }}
        onMouseLeave={() => {
          if (variant === "simple") return;
          mouseX.set(-10000);
          mouseY.set(-10000);
        }}
      >
        <DeckLayer
          items={duplicatedItems}
          count={items.length}
          progress={progress}
          mouseX={mouseX}
          mouseY={mouseY}
          variant={variant}
          mode="mobile"
        />
        <DeckLayer
          items={duplicatedItems}
          count={items.length}
          progress={progress}
          mouseX={mouseX}
          mouseY={mouseY}
          variant={variant}
          mode="desktop"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-start bg-gradient-to-b from-background from-35% via-background/80 to-transparent px-6 pt-7 pb-8 dark:from-black dark:via-black/80 md:w-[min(100%,36rem)] md:bg-gradient-to-r md:from-background md:via-background/90 md:to-transparent md:px-12 md:pt-12 md:dark:from-black md:dark:via-black/85 md:dark:to-transparent">
        <p className="text-sm font-semibold tracking-[0.18em] text-blue uppercase">
          {t.tagline}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight md:text-6xl">
          {t.heroTitle}
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted">{t.heroBody}</p>
        <div className="pointer-events-auto">
          <HeroCtas t={t} signedIn={signedIn} />
        </div>
        <p className="mt-8 text-[11px] tracking-[0.28em] text-muted uppercase">
          {t.collection} ({items.length})
        </p>
      </div>
    </section>
  );
}

function DeckLayer({
  items,
  count,
  progress,
  mouseX,
  mouseY,
  variant,
  mode,
}: {
  items: CollectionItem[];
  count: number;
  progress: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  variant: CollectionSurferVariant;
  mode: "mobile" | "desktop";
}) {
  const mobile = mode === "mobile";
  const stepX = mobile ? 168 : 240;
  const stepY = mobile ? -52 : -84;
  const stepZ = mobile ? -200 : -288;

  const x = useTransform(progress, [0, 1], [0, -count * stepX]);
  const y = useTransform(progress, [0, 1], [0, -count * stepY]);
  const z = useTransform(progress, [0, 1], [0, -count * stepZ]);

  return (
    <div
      className={
        mobile
          ? "absolute inset-0 flex items-start justify-start pl-[4%] pt-[34%] md:hidden"
          : "absolute inset-0 hidden items-center justify-center md:flex md:translate-x-[8%]"
      }
      style={{
        perspective: mobile ? "1200px" : "2000px",
        perspectiveOrigin: mobile ? "55% 55%" : "62% 32%",
      }}
    >
      <motion.div
        className="relative h-0 w-0"
        style={{
          x,
          y,
          z,
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((item, index) => (
          <SurfCard
            key={`${mode}-${item.id}-${index}`}
            item={item}
            index={index}
            count={count}
            stepX={stepX}
            stepY={stepY}
            stepZ={stepZ}
            mouseX={mouseX}
            mouseY={mouseY}
            variant={variant}
            interactive={!mobile}
            tilt={mobile ? -28 : -50}
          />
        ))}
      </motion.div>
    </div>
  );
}

function SurfCard({
  item,
  index,
  count,
  stepX,
  stepY,
  stepZ,
  mouseX,
  mouseY,
  variant,
  interactive,
  tilt,
}: {
  item: CollectionItem;
  index: number;
  count: number;
  stepX: number;
  stepY: number;
  stepZ: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  variant: CollectionSurferVariant;
  interactive: boolean;
  tilt: number;
}) {
  const { t } = useT();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const href = `/item/${item.id}`;

  const distance = useTransform([mouseX, mouseY], ([mx, my]) => {
    if (!interactive || !ref.current || variant === "simple") return 200;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.hypot(Number(mx) - centerX, Number(my) - centerY);
  });

  const targetScale = useTransform(distance, [0, 400], [1.5, 1]);
  const springScale = useSpring(targetScale, {
    mass: 0.5,
    stiffness: 300,
    damping: 20,
  });

  const targetUplift = useTransform(distance, [0, 400], [-100, 0]);
  const springUplift = useSpring(targetUplift, {
    mass: 0.5,
    stiffness: 300,
    damping: 20,
  });

  const transform = useTransform(
    [springScale, springUplift],
    ([scale, uplift]) => {
      const scaleValue =
        interactive && variant === "magnetic" ? Number(scale) : 1;
      const upliftValue =
        interactive && variant === "uplift" ? Number(uplift) : 0;
      return `translate3d(${index * stepX}px, ${index * stepY + upliftValue}px, ${index * stepZ}px) rotateY(${tilt}deg) scale(${scaleValue})`;
    },
  );

  return (
    <motion.div
      ref={ref}
      tabIndex={interactive ? 0 : -1}
      aria-hidden={!interactive}
      aria-label={interactive ? item.title : undefined}
      className={`absolute overflow-hidden bg-neutral-900 shadow-2xl ${
        interactive
          ? "group h-[400px] w-[300px] cursor-pointer"
          : "pointer-events-none h-[260px] w-[190px] opacity-90"
      }`}
      style={{
        transform,
        transformStyle: "preserve-3d",
      }}
      onClick={
        interactive
          ? () => {
              router.push(href);
            }
          : undefined
      }
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(href);
              }
            }
          : undefined
      }
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
        <span className="font-[family-name:var(--font-display)] text-sm font-bold text-white/80">
          {String((index % count) + 1).padStart(2, "0")}
        </span>
        {item.isMockup ? (
          <span
            aria-hidden="true"
            className="rounded-full bg-black/75 px-2 py-[0.28rem] text-[10px] font-semibold tracking-[0.16em] text-white uppercase"
          >
            {t.mockup}
          </span>
        ) : null}
      </div>
      {interactive ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.openInNewTab}
          className="pointer-events-none absolute top-3 right-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 hover:bg-tangerine focus-visible:pointer-events-auto focus-visible:opacity-100"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <ArrowUpRight size={18} strokeWidth={2.25} />
        </a>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.image} alt="" className="h-full w-full object-cover" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-10 pb-3 text-sm font-medium text-white">
        {item.title}
      </span>
    </motion.div>
  );
}
