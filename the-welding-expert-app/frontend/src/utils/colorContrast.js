function normalizeHex(hex) {
  const value = hex.replace("#", "");
  if (value.length === 3) return value.split("").map((part) => part + part).join("");
  if (value.length === 6) return value;
  throw new Error(`Geçersiz hex rengi: ${hex}`);
}

function toLinearChannel(channel) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex) {
  const value = normalizeHex(hex);
  const channels = [0, 2, 4].map((index) =>
    toLinearChannel(Number.parseInt(value.slice(index, index + 2), 16)),
  );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrast(foreground, background, minimum = 4.5) {
  return contrastRatio(foreground, background) >= minimum;
}
