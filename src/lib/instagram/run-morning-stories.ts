import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import {
  listUnpostedStoriesSince,
  recordInstagramStoryPost,
} from "@/lib/instagram/listings";
import { getInstagramConfig, publishInstagramStory } from "@/lib/instagram/publish";
import { renderListingStoryImage } from "@/lib/instagram/story-image";
import { createStoryMediaUrl } from "@/lib/instagram/story-url";

const MAX_STORIES = 25;

function sinceYesterdayMorningTirane(now = new Date()) {
  // Look back 30 hours so a delayed cron still catches yesterday evening posts.
  return new Date(now.getTime() - 30 * 60 * 60 * 1000);
}

export type MorningStoriesResult = {
  dryRun: boolean;
  configured: boolean;
  considered: number;
  posted: Array<{
    listingId: string;
    title: string;
    imageUrl: string;
    mediaId?: string;
  }>;
  skipped: Array<{ listingId: string; reason: string }>;
  errors: Array<{ listingId: string; error: string }>;
};

async function maybeArchiveRenderedPng(
  listingId: string,
  dayStamp: string,
  imageUrl: string | null,
  title: string,
  priceAll: number,
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const response = await renderListingStoryImage({
    id: listingId,
    title,
    priceAll,
    imageUrl,
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  const blob = await put(
    `instagram-stories/${dayStamp}/${listingId}.png`,
    bytes,
    {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
      allowOverwrite: true,
    },
  );
  return blob.url;
}

export async function runMorningInstagramStories(options?: {
  dryRun?: boolean;
  limit?: number;
  includeMockups?: boolean;
}): Promise<MorningStoriesResult> {
  const dryRun = Boolean(options?.dryRun);
  const limit = options?.limit ?? MAX_STORIES;
  const config = getInstagramConfig();
  const candidates = await listUnpostedStoriesSince(
    sinceYesterdayMorningTirane(),
    limit,
    { includeMockups: options?.includeMockups },
  );

  const result: MorningStoriesResult = {
    dryRun,
    configured: Boolean(config),
    considered: candidates.length,
    posted: [],
    skipped: [],
    errors: [],
  };

  if (!config && !dryRun) {
    for (const item of candidates) {
      result.skipped.push({
        listingId: item.id,
        reason: "missing_instagram_credentials",
      });
    }
    return result;
  }

  const dayStamp = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Tirane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  for (const item of candidates) {
    try {
      const signedUrl = createStoryMediaUrl(item.id);
      const archived = await maybeArchiveRenderedPng(
        item.id,
        dayStamp,
        item.images[0] ?? null,
        item.title,
        item.priceAll,
      );
      const imageUrl = archived || signedUrl;

      if (dryRun || !config) {
        result.posted.push({
          listingId: item.id,
          title: item.title,
          imageUrl,
        });
        continue;
      }

      const published = await publishInstagramStory(imageUrl, config);
      await recordInstagramStoryPost({
        id: randomUUID(),
        listingId: item.id,
        imageUrl,
        containerId: published.containerId,
        mediaId: published.mediaId,
      });
      result.posted.push({
        listingId: item.id,
        title: item.title,
        imageUrl,
        mediaId: published.mediaId,
      });
    } catch (error) {
      result.errors.push({
        listingId: item.id,
        error: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  return result;
}
