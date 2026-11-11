export type ScenePreset = "white" | "beige" | "custom";

export const SCENE_COLORS: Record<"white" | "beige", string> = {
  white: "#ffffff",
  beige: "#f3eee6",
};

export function sceneColor(preset: ScenePreset, customHex: string) {
  if (preset === "custom") return customHex || "#ffffff";
  return SCENE_COLORS[preset];
}

export async function fetchImageBlob(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("fetch_failed");
  return response.blob();
}

export async function removePhotoBackground(source: Blob) {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(source, {
    model: "isnet_quint8",
    output: {
      format: "image/png",
      quality: 0.9,
    },
    progress: () => {},
  });
}

function loadImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_load_failed"));
    };
    image.src = url;
  });
}

export async function compositeOnColor(cutout: Blob, background: string) {
  const image = await loadImage(cutout);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("encode_failed"));
      },
      "image/jpeg",
      0.92,
    );
  });
  return blob;
}
