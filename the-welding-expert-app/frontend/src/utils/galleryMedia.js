function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getExplicitAlt(item, stage) {
  const keys = stage === "before"
    ? ["before_image_alt", "before_alt"]
    : ["image_alt", "after_image_alt", "after_alt"];

  return keys.map((key) => cleanText(item?.[key])).find(Boolean) || "";
}

export function getGalleryImageAlt(item, stage = "after") {
  const explicitAlt = getExplicitAlt(item, stage);
  if (explicitAlt) return explicitAlt;

  const title = cleanText(item?.title) || "Umut Usta uygulaması";
  const category = cleanText(item?.category);
  const location = cleanText(item?.location);
  const context = [category, location].filter(Boolean).join(", ");
  const state = stage === "before"
    ? "uygulama öncesindeki mevcut durum"
    : "tamamlanan uygulama";

  return `${title}: ${state}${context ? `; ${context}` : ""}`;
}

export function hasBeforeAfterPair(item) {
  return Boolean(item?.before_image_url && item?.image_url);
}
