import "./flower-garden.css";

const petals = [1, 2, 3, 4] as const;
const sparks = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const stemLeaves = [1, 2, 3, 4, 5, 6] as const;

const blades = Array.from({ length: 26 }, (_, index) => ({
  x: `${3 + (index / 25) * 94}%`,
  h: `${10 + ((index * 13) % 16)}vmin`,
  lean: `${(index % 2 === 0 ? -1 : 1) * (4 + (index % 6))}deg`,
  d: `${(index % 7) * 0.18}s`,
  dur: `${2.2 + (index % 5) * 0.35}s`,
  back: index % 3 === 0,
}));

const hearts = [
  { x: "18%", s: "1.1rem", d: "0.2s" },
  { x: "30%", s: "0.8rem", d: "2.4s" },
  { x: "46%", s: "1.35rem", d: "1.1s" },
  { x: "58%", s: "0.75rem", d: "3.6s" },
  { x: "72%", s: "1.15rem", d: "0.8s" },
  { x: "84%", s: "0.9rem", d: "4.2s" },
];

function Flower({ variant }: { variant: 1 | 2 | 3 }) {
  const leaves = variant === 1 ? stemLeaves : stemLeaves.slice(0, 4);
  return (
    <div className={`bz-flower bz-flower--${variant}`}>
      <div className="bz-bloom">
        {petals.map((petal) => (
          <span key={petal} className={`bz-petal bz-petal--${petal}`} />
        ))}
        <span className="bz-core" />
        {sparks.map((spark) => (
          <span key={spark} className={`bz-spark bz-spark--${spark}`} />
        ))}
      </div>
      <div className="bz-stem">
        {leaves.map((leaf) => (
          <span key={leaf} className={`bz-sleaf bz-sleaf--${leaf}`} />
        ))}
      </div>
    </div>
  );
}

export function FlowerGarden({
  count,
  caption,
}: {
  count: string;
  caption: string;
}) {
  return (
    <section className="bz-garden relative left-1/2 w-[100dvw] max-w-[100dvw] -translate-x-1/2 -mt-6 -mb-24 md:-mb-12" aria-labelledby="garden-count">
      <div className="bz-sky" aria-hidden="true" />
      <div className="bz-stat">
        <p id="garden-count" className="bz-count">
          {count}
        </p>
        <p className="bz-caption">{caption}</p>
      </div>
      <div className="bz-scene" aria-hidden="true">
        {hearts.map((heart) => (
          <span
            key={heart.x}
            className="bz-heart"
            style={{ ["--x" as string]: heart.x, ["--s" as string]: heart.s, ["--d" as string]: heart.d }}
          >
            ♥
          </span>
        ))}
        <div className="bz-ground" />
        <Flower variant={1} />
        <Flower variant={2} />
        <Flower variant={3} />
        <div className="bz-frond bz-frond--left">
          <div className="bz-frond__shape" />
        </div>
        <div className="bz-frond bz-frond--right">
          <div className="bz-frond__shape" />
        </div>
        <div className="bz-grass">
          {blades.map((blade) => (
            <span
              key={blade.x}
              className={blade.back ? "bz-blade bz-blade--back" : "bz-blade"}
              style={{
                ["--x" as string]: blade.x,
                ["--h" as string]: blade.h,
                ["--lean" as string]: blade.lean,
                ["--d" as string]: blade.d,
                ["--dur" as string]: blade.dur,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
