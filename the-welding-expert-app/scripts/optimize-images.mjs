import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.resolve("public/images");
const outputDir = path.join(sourceDir, "optimized");
const widths = [320, 640, 1024];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const sourceFiles = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
  .map((entry) => entry.name)
  .sort();

for (const fileName of sourceFiles) {
  const sourcePath = path.join(sourceDir, fileName);
  const stem = path.parse(fileName).name;
  const metadata = await sharp(sourcePath).metadata();
  const targetWidths = [...widths, ...(stem === "hero" ? [400] : [])]
    .sort((a, b) => a - b)
    .filter((width) => width <= metadata.width);

  for (const width of targetWidths) {
    const pipeline = sharp(sourcePath).resize({
      width,
      withoutEnlargement: true,
      fit: "inside",
    });

    await Promise.all([
      pipeline
        .clone()
        .avif({ quality: stem === "hero" ? 68 : 62, effort: 5 })
        .toFile(path.join(outputDir, `${stem}-${width}.avif`)),
      pipeline
        .clone()
        .webp({ quality: stem === "hero" ? 78 : 72, effort: 5 })
        .toFile(path.join(outputDir, `${stem}-${width}.webp`)),
      pipeline
        .clone()
        .jpeg({ quality: stem === "hero" ? 64 : 60, mozjpeg: true })
        .toFile(path.join(outputDir, `${stem}-${width}.jpg`)),
    ]);
  }
}

console.log(
  `Optimized ${sourceFiles.length} images at ${widths.join(", ")}px, plus a 400px hero, in AVIF, WebP and JPEG.`,
);
