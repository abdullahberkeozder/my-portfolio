import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.resolve("public/images");
const outputDir = path.join(sourceDir, "optimized");
const formats = ["avif", "webp", "jpg"];
const baseWidths = [320, 640, 1024];

const sourceFiles = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
  .map((entry) => entry.name)
  .sort();
const optimizedFiles = new Set(await readdir(outputDir));
const records = [];
const errors = [];

for (const fileName of sourceFiles) {
  const filePath = path.join(sourceDir, fileName);
  const [buffer, metadata] = await Promise.all([
    readFile(filePath),
    sharp(filePath).metadata(),
  ]);
  const stem = path.parse(fileName).name;
  const widths = [...baseWidths, ...(stem === "hero" ? [400] : [])]
    .sort((a, b) => a - b)
    .filter((width) => width <= metadata.width);
  const missing = [];

  for (const width of widths) {
    for (const format of formats) {
      const variant = `${stem}-${width}.${format}`;
      if (!optimizedFiles.has(variant)) missing.push(variant);
    }
  }

  if (missing.length) errors.push(...missing.map((variant) => `Eksik varyant: ${variant}`));
  if (!metadata.width || !metadata.height) errors.push(`Boyut okunamadı: ${fileName}`);

  records.push({
    fileName,
    width: metadata.width,
    height: metadata.height,
    hasExif: Boolean(metadata.exif),
    hash: createHash("sha256").update(buffer).digest("hex"),
  });
}

const duplicateGroups = Object.values(
  records.reduce((groups, record) => {
    groups[record.hash] ||= [];
    groups[record.hash].push(record.fileName);
    return groups;
  }, {}),
).filter((group) => group.length > 1);

console.log(`Kaynak medya: ${records.length}`);
console.log(`Üç formatlı responsive varyant: ${optimizedFiles.size}`);
console.log(`EXIF/provenans verisi bulunan kaynak: ${records.filter((record) => record.hasExif).length}`);

if (duplicateGroups.length) {
  console.warn(`Aynı dosya içeriğini kullanan gruplar: ${duplicateGroups.map((group) => group.join(" = ")).join("; ")}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Medya teknik bütünlük denetimi geçti.");
}
