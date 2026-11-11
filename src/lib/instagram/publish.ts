const GRAPH_VERSION = "v22.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export type InstagramConfig = {
  accessToken: string;
  igUserId: string;
};

export function getInstagramConfig(): InstagramConfig | null {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim();
  if (!accessToken || !igUserId) return null;
  return { accessToken, igUserId };
}

type GraphError = {
  error?: { message?: string; code?: number; error_subcode?: number };
};

async function graphPost<T>(
  path: string,
  token: string,
  body: Record<string, string>,
): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  url.searchParams.set("access_token", token);
  for (const [key, value] of Object.entries(body)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url, { method: "POST" });
  const json = (await res.json()) as T & GraphError;
  if (!res.ok || json.error) {
    throw new Error(
      json.error?.message || `Instagram Graph error (${res.status})`,
    );
  }
  return json;
}

async function graphGet<T>(path: string, token: string): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("fields", "status_code,status");
  const res = await fetch(url, { method: "GET" });
  const json = (await res.json()) as T & GraphError;
  if (!res.ok || json.error) {
    throw new Error(
      json.error?.message || `Instagram Graph error (${res.status})`,
    );
  }
  return json;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntilReady(containerId: string, token: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const status = await graphGet<{ status_code?: string }>(
      `/${containerId}`,
      token,
    );
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") {
      throw new Error(`Story container ${containerId} failed processing`);
    }
    await sleep(1500);
  }
  throw new Error(`Story container ${containerId} timed out`);
}

export async function publishInstagramStory(
  imageUrl: string,
  config: InstagramConfig,
) {
  const container = await graphPost<{ id: string }>(
    `/${config.igUserId}/media`,
    config.accessToken,
    {
      image_url: imageUrl,
      media_type: "STORIES",
    },
  );

  await waitUntilReady(container.id, config.accessToken);

  const published = await graphPost<{ id: string }>(
    `/${config.igUserId}/media_publish`,
    config.accessToken,
    { creation_id: container.id },
  );

  return {
    containerId: container.id,
    mediaId: published.id,
  };
}
