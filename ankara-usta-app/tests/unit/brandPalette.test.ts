import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'app/application.css'), 'utf8');
function token(name: string) {
  const value = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  if (!value) throw new Error(`Missing brand color: ${name}`);
  return value;
}
function luminance(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map(channel => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

describe('Orkestra brand palette', () => {
  it.each([
    ['brand-cobalt', 'brand-yellow'],
    ['brand-cobalt', 'brand-parchment'],
    ['brand-charcoal', 'brand-parchment'],
    ['brand-cobalt', 'orchestra-hero-surface'],
    ['brand-cobalt', 'brand-lemonade'],
    ['brand-charcoal', 'brand-lemonade-soft'],
  ])('%s on %s supports normal-size text contrast', (foreground, background) => {
    const values = [luminance(token(foreground)), luminance(token(background))].sort((a, b) => a - b);
    expect((values[1] + 0.05) / (values[0] + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
});
