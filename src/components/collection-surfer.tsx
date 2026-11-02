"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { HeroCtas } from "@/components/hero-ctas";
import { useT } from "@/components/i18n-provider";

export type CollectionItem = {
  id: string;
  image: string;
  title: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const duplicatedItems = [...items, ...items];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.1,
    stiffness: 100,
    damping: 20,
  });

  const stepX = 240;
  const stepY = -84;
  const stepZ = -288;

  const x = useTransform(smoothProgress, [0, 1], [0, -items.length * stepX]);
  const y = useTransform(smoothProgress, [0, 1], [0, -items.length * stepY]);
  const z = useTransform(smoothProgress, [0, 1], [0, -items.length * stepZ]);

  const mouseX = useMotionValue(-10000);
  const mouseY = useMotionValue(-10000);

  if (items.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className="full-bleed"
      style={{ height: `calc(${items.length + 1} * 100svh)` }}
    >
      <div
        className="sticky top-[var(--header-h)] flex h-[calc(100svh-var(--header-h))] items-center justify-center overflow-hidden bg-background dark:bg-black"
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
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-[min(100%,36rem)] flex-col justify-start bg-gradient-to-r from-background via-background/90 to-transparent px-6 pt-8 pb-10 dark:from-black dark:via-black/85 md:px-12 md:pt-12">
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
            {t.collection} ({items.length}) · {t.scrollToSurf}
          </p>
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center md:translate-x-[8%]"
          style={{
            perspective: "2000px",
            perspectiveOrigin: "62% 32%",
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
            {duplicatedItems.map((item, index) => (
              <SurfCard
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                count={items.length}
                stepX={stepX}
                stepY={stepY}
                stepZ={stepZ}
                mouseX={mouseX}
                mouseY={mouseY}
                scrollSpring={smoothProgress}
                variant={variant}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
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
  scrollSpring,
  variant,
}: {
  item: CollectionItem;
  index: number;
  count: number;
  stepX: number;
  stepY: number;
  stepZ: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  scrollSpring: MotionValue<number>;
  variant: CollectionSurferVariant;
}) {
  const { t } = useT();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const href = `/item/${item.id}`;

  const distance = useTransform([mouseX, mouseY, scrollSpring], ([mx, my]) => {
    if (!ref.current || variant === "simple") return 200;
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
      const scaleValue = variant === "magnetic" ? Number(scale) : 1;
      const upliftValue = variant === "uplift" ? Number(uplift) : 0;
      return `translate3d(${index * stepX}px, ${index * stepY + upliftValue}px, ${index * stepZ}px) rotateY(-50deg) scale(${scaleValue})`;
    },
  );

  return (
    <motion.div
      ref={ref}
      tabIndex={0}
      aria-label={item.title}
      className="group absolute h-[340px] w-[250px] cursor-pointer overflow-hidden bg-neutral-900 shadow-2xl md:h-[400px] md:w-[300px]"
      style={{
        transform,
        transformStyle: "preserve-3d",
      }}
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(href);
        }
      }}
    >
      <span className="absolute top-3 left-3 z-10 font-[family-name:var(--font-display)] text-sm font-bold text-white/80">
        {String((index % count) + 1).padStart(2, "0")}
      </span>
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt=""
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-10 pb-3 text-sm font-medium text-white">
        {item.title}
      </span>
    </motion.div>
  );
}
