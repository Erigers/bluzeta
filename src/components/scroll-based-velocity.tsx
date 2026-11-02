"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";

function ParallaxText({
  children,
  baseVelocity = 5,
  className = "",
}: {
  children: string;
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });
  const x = useTransform(baseX, (value) => `${wrap(-12.5, 0, value)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div className={`flex w-max whitespace-nowrap ${className}`} style={{ x }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="mr-[0.4em]">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function ScrollBasedVelocity({
  lines,
  default_velocity = 4,
  className = "",
}: {
  lines: [string, string];
  default_velocity?: number;
  className?: string;
}) {
  const textClass = `font-[family-name:var(--font-display)] text-lg leading-none font-normal tracking-[-0.02em] uppercase md:text-3xl md:leading-[2.2rem] ${className}`;

  return (
    <section
      aria-hidden
      className="full-bleed -mt-6 overflow-hidden border-b border-line py-1.5"
    >
      <ParallaxText baseVelocity={default_velocity} className={`${textClass} text-blue`}>
        {lines[0]}
      </ParallaxText>
      <ParallaxText
        baseVelocity={-default_velocity}
        className={`${textClass} text-tangerine`}
      >
        {lines[1]}
      </ParallaxText>
    </section>
  );
}
