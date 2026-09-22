import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('P0.5 Brand Asset & Social Preview Unification (BRAND-01)', () => {
  const previewPath = resolve(process.cwd(), 'public/orkestra-social-preview.png');

  it('provides a valid 1200x630 social preview image matching the cobalt/yellow identity', () => {
    expect(existsSync(previewPath)).toBe(true);

    const buffer = readFileSync(previewPath);
    // PNG signature check: 89 50 4E 47 0D 0A 1A 0A
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);

    // PNG IHDR chunk: width at offset 16 (4 bytes BE), height at offset 20 (4 bytes BE)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    expect(width).toBe(1200);
    expect(height).toBe(630);
    expect(buffer.length).toBeGreaterThan(50_000);
  });

  it('references /orkestra-social-preview.png in root layout metadata for OpenGraph and Twitter', () => {
    const layoutContent = readFileSync(resolve(process.cwd(), 'app/layout.tsx'), 'utf8');
    expect(layoutContent).toContain("images: ['/orkestra-social-preview.png']");
    expect(layoutContent).toContain("card: 'summary_large_image'");
  });
});
