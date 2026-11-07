import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("public/images/optimized");
const maxFileBytes = 320 * 1024;
// The archive includes three complete format families; a browser downloads only
// one candidate per rendered image.
const maxTotalBytes = 15 * 1024 * 1024;
const maxCriticalImageBytes = 700 * 1024;
const expectedMinimumFiles = 100;
const criticalImages = [
  "hero-640.avif",
  "painting-320.avif",
  "railing_repair-320.avif",
  "landscaping-320.avif",
  "renovation-320.avif",
  "sliding_gate_after-320.avif",
  "gate_motor_after-320.avif",
  "smart_lock_after-320.avif",
  "estimate-320.avif",
];

const files = await readdir(outputDir);
const assets = await Promise.all(
  files.map(async (fileName) => ({
    fileName,
    bytes: (await stat(path.join(outputDir, fileName))).size,
  })),
);

const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);
const oversized = assets.filter((asset) => asset.bytes > maxFileBytes);
const criticalImageBytes = assets
  .filter((asset) => criticalImages.includes(asset.fileName))
  .reduce((sum, asset) => sum + asset.bytes, 0);
const errors = [];

if (assets.length < expectedMinimumFiles) {
  errors.push(`Expected at least ${expectedMinimumFiles} optimized files, found ${assets.length}.`);
}

if (totalBytes > maxTotalBytes) {
  errors.push(
    `Optimized image set is ${(totalBytes / 1024 / 1024).toFixed(2)} MB; budget is 12 MB.`,
  );
}

if (criticalImageBytes > maxCriticalImageBytes) {
  errors.push(
    `Critical customer-page images are ${(criticalImageBytes / 1024).toFixed(1)} KB; budget is 700 KB.`,
  );
}

if (oversized.length > 0) {
  errors.push(
    `Files over 320 KB: ${oversized.map((asset) => asset.fileName).join(", ")}.`,
  );
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Performance budget passed: ${assets.length} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MB total, ${(criticalImageBytes / 1024).toFixed(1)} KB critical images, largest ${(Math.max(...assets.map((asset) => asset.bytes)) / 1024).toFixed(1)} KB.`,
  );
}
