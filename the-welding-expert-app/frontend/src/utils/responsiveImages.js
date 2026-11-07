const RESPONSIVE_WIDTHS = [320, 640, 1024];
const LOCAL_PNG_PATTERN = /^\/images\/([^/?]+)\.png(?:\?.*)?$/i;
const SUPABASE_PUBLIC_IMAGE_PATH = "/storage/v1/object/public/";

function createSrcSet(stem, format) {
  return RESPONSIVE_WIDTHS.map(
    (width) => `/images/optimized/${stem}-${width}.${format} ${width}w`,
  ).join(", ");
}

export function getResponsiveImageProps(src, sizes = "100vw") {
  const match = typeof src === "string" ? src.match(LOCAL_PNG_PATTERN) : null;

  if (!match) return { src };

  const stem = match[1];

  return {
    src: `/images/optimized/${stem}-1024.jpg`,
    srcSet: createSrcSet(stem, "jpg"),
    sizes,
    sources: [
      { type: "image/avif", srcSet: createSrcSet(stem, "avif") },
      { type: "image/webp", srcSet: createSrcSet(stem, "webp") },
    ],
    width: 1024,
    height: 1024,
  };
}

export function getSupabasePreviewUrl(
  src,
  { width = 640, height = 480, quality = 70 } = {},
) {
  if (typeof src !== "string") return src;

  try {
    const url = new URL(src);
    if (
      !url.hostname.endsWith(".supabase.co") ||
      !url.pathname.startsWith(SUPABASE_PUBLIC_IMAGE_PATH)
    ) {
      return src;
    }

    url.pathname = url.pathname.replace(
      SUPABASE_PUBLIC_IMAGE_PATH,
      "/storage/v1/render/image/public/",
    );
    url.search = new URLSearchParams({
      width: String(width),
      height: String(height),
      resize: "cover",
      quality: String(quality),
    }).toString();

    return url.toString();
  } catch {
    return src;
  }
}
