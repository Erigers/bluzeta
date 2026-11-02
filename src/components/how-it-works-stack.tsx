"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { useT } from "@/components/i18n-provider";

type Tone = "blue" | "surface" | "tangerine";

type FlipItem = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  tone: Tone;
};

const toneClass: Record<Tone, string> = {
  blue: "bg-blue text-white",
  surface:
    "bg-white text-[#101218] [.dark_&]:bg-black [.dark_&]:text-[#f4efe6]",
  tangerine: "bg-tangerine text-white",
};

function FlipCard({
  item,
  index,
  total,
  progress,
  reduceMotion,
}: {
  item: FlipItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const segment = 1 / Math.max(total, 1);
  const start = index * segment;
  const end = Math.min(start + segment, 1);
  const entryStart = Math.max(0, start - segment);
  const entryEnd =
    index === 0 ? 0.0001 : Math.min(start, entryStart + segment * 0.7);
  const exitStart = start;
  const exitEnd = end;
  const stackedCardGap = Math.min(24, 72 / Math.max(total - 1, 1));
  const stackedOffset = index * stackedCardGap;
  const restingOffset = Math.min(index * 12, 34);
  const restingScale = 1 - Math.min(index * 0.012, 0.035);

  const exitYPercent = useTransform(
    progress,
    [exitStart, exitEnd],
    reduceMotion ? [0, 0] : [0, -118],
  );
  const exitStackOffset = useTransform(
    progress,
    [exitStart, exitEnd],
    reduceMotion ? [0, 0] : [0, stackedOffset],
  );
  const exitY = useMotionTemplate`calc(${exitYPercent}% + ${exitStackOffset}px)`;
  const rotateX = useTransform(
    progress,
    [exitStart, exitEnd],
    reduceMotion ? [0, 0] : [0, 22],
  );
  const opacity = useTransform(
    progress,
    [exitStart, exitEnd],
    reduceMotion ? [1, 0] : [1, 1],
  );
  const entryScale = useTransform(
    progress,
    [entryStart, entryEnd],
    index === 0 ? [1, 1] : [restingScale, 1],
  );
  const entryY = useTransform(
    progress,
    [entryStart, entryEnd],
    index === 0 ? [0, 0] : [restingOffset, 0],
  );

  return (
    <motion.article
      className="absolute inset-x-0 top-0 aspect-[3/4] will-change-transform sm:aspect-[1.76/1]"
      style={{
        y: exitY,
        rotateX,
        opacity,
        zIndex: total - index,
        transformOrigin: "50% 50%",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      <motion.div
        className={`grid h-full overflow-hidden rounded-[clamp(18px,2vw,30px)] shadow-[0_16px_50px_rgba(20,17,10,0.18)] sm:grid-cols-[1.15fr_0.85fr] dark:shadow-[0_16px_50px_rgba(0,0,0,0.45)] ${toneClass[item.tone]}`}
        style={{
          y: entryY,
          scale: entryScale,
          transformOrigin: "50% 100%",
        }}
      >
        <div className="flex min-w-0 flex-col p-[clamp(24px,3vw,48px)] md:pr-[clamp(22px,3vw,48px)]">
          <span className="font-[family-name:var(--font-display)] text-[clamp(24px,2.5vw,36px)] leading-none font-semibold tracking-[-0.06em]">
            {item.number}
          </span>
          <div className="mt-auto max-w-[46rem] pt-8">
            <p className="mb-[clamp(10px,1.5vw,22px)] text-[10px] font-semibold tracking-[0.16em] uppercase opacity-70 sm:text-xs">
              {item.eyebrow}
            </p>
            <h3 className="max-w-[16ch] text-[clamp(28px,3.25vw,48px)] leading-[0.96] font-semibold tracking-[-0.05em] text-balance font-[family-name:var(--font-display)]">
              {item.title}
            </h3>
            <p className="mt-[clamp(16px,1.8vw,24px)] max-w-[42rem] text-[clamp(13px,1.1vw,16px)] leading-[1.5] opacity-80">
              {item.description}
            </p>
          </div>
        </div>
        <div className="relative m-[clamp(10px,1.2vw,18px)] min-h-[180px] overflow-hidden rounded-[clamp(12px,1.4vw,22px)] sm:ml-0">
          <img
            src={item.image}
            alt={item.imageAlt}
            className="h-full w-full object-cover"
            loading={index < 2 ? "eager" : "lazy"}
            draggable={false}
          />
        </div>
      </motion.div>
    </motion.article>
  );
}

export function HowItWorksStack() {
  const { t } = useT();
  const stackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const items: FlipItem[] = [
    {
      number: "01",
      eyebrow: t.browse,
      title: t.step1,
      description: t.step1Body,
      image: "/how-it-works/find.svg",
      imageAlt: t.step1,
      tone: "blue",
    },
    {
      number: "02",
      eyebrow: t.interested,
      title: t.step2,
      description: t.step2Body,
      image: "/how-it-works/interested.svg",
      imageAlt: t.step2,
      tone: "surface",
    },
    {
      number: "03",
      eyebrow: t.cashMeetup,
      title: t.step3,
      description: t.step3Body,
      image: "/how-it-works/meetup.svg",
      imageAlt: t.step3,
      tone: "tangerine",
    },
  ];

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.8,
    restDelta: 0.0005,
  });
  const cardProgress = reduceMotion ? scrollYProgress : smoothProgress;

  return (
    <section className="full-bleed bg-background">
      <div className="relative flex min-h-[calc(100svh-var(--header-h))] flex-col items-center justify-center overflow-hidden px-5 py-16 sm:px-10">
        <div className="mb-8 flex items-center justify-center gap-5 text-lg font-medium tracking-[-0.04em] text-muted sm:text-2xl">
          <motion.span
            aria-hidden
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            ↓
          </motion.span>
          <span>{t.scrollDown}</span>
          <motion.span
            aria-hidden
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{
              duration: 1.4,
              delay: 0.18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ↓
          </motion.span>
        </div>
        <h2 className="max-w-[16ch] text-center font-[family-name:var(--font-display)] text-[clamp(42px,7vw,82px)] leading-[0.92] font-semibold tracking-[-0.06em] text-blue">
          {t.howItWorks}
        </h2>
      </div>

      <div
        ref={stackRef}
        className="relative"
        style={{ height: `${(items.length + 1) * 100}vh` }}
      >
        <div className="sticky top-[var(--header-h)] flex h-[calc(100svh-var(--header-h))] flex-col justify-center overflow-hidden px-[clamp(14px,4vw,64px)] py-8">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[860px] [perspective:800px] sm:aspect-[1.76/1]">
            {[...items].reverse().map((item, reverseIndex) => {
              const index = items.length - reverseIndex - 1;
              return (
                <FlipCard
                  key={item.number}
                  item={item}
                  index={index}
                  total={items.length}
                  progress={cardProgress}
                  reduceMotion={reduceMotion}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
