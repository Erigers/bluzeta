import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { formatPrice } from "@/lib/format";

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

export type StoryListing = {
  id: string;
  title: string;
  priceAll: number;
  imageUrl: string | null;
};

let logoDataUrl: string | null = null;
let displayFont: ArrayBuffer | null = null;

async function loadLogoDataUrl() {
  if (logoDataUrl) return logoDataUrl;
  const file = await readFile(
    path.join(process.cwd(), "public/brand/bluzeta-icon.png"),
  );
  logoDataUrl = `data:image/png;base64,${file.toString("base64")}`;
  return logoDataUrl;
}

async function loadDisplayFont(): Promise<ArrayBuffer> {
  if (displayFont) return displayFont;
  const buf = await readFile(
    path.join(process.cwd(), "src/fonts/Runtime-Regular.woff"),
  );
  displayFont = buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
  return displayFont;
}

export function formatStoryDate(date = new Date(), locale = "sq-AL") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Tirane",
  }).format(date);
}

export async function renderListingStoryImage(
  item: StoryListing,
  options?: { date?: Date },
) {
  const [logo, fontData] = await Promise.all([
    loadLogoDataUrl(),
    loadDisplayFont(),
  ]);
  const dateLabel = formatStoryDate(options?.date ?? new Date());
  const price = `${formatPrice(item.priceAll)} Lek`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0c0d12",
          color: "#f4efe6",
          fontFamily: "Runtime",
          position: "relative",
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            width={STORY_WIDTH}
            height={STORY_HEIGHT}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: STORY_WIDTH,
              height: STORY_HEIGHT,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background:
                "linear-gradient(160deg, #1b2748 0%, #0c0d12 55%, #3a2218 100%)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(12,13,18,0.72) 0%, rgba(12,13,18,0.18) 38%, rgba(12,13,18,0.2) 62%, rgba(12,13,18,0.88) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "72px 64px 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <img
                src={logo}
                width={96}
                height={96}
                alt=""
                style={{
                  width: 96,
                  height: 96,
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: 64,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                bluzeta
              </div>
            </div>
            <div
              style={{
                display: "flex",
                padding: "16px 28px",
                borderRadius: 999,
                background: "rgba(244,239,230,0.12)",
                border: "1px solid rgba(244,239,230,0.22)",
                fontSize: 28,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {dateLabel}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 28,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#4d7cff",
              }}
            >
              Sot në Tiranë
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 72,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                maxWidth: 920,
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "18px 32px",
                  borderRadius: 999,
                  background: "#ff5c1a",
                  color: "#fffdf8",
                  fontSize: 36,
                }}
              >
                {price}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  color: "rgba(244,239,230,0.78)",
                }}
              >
                Takim me cash
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      fonts: [
        {
          name: "Runtime",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
