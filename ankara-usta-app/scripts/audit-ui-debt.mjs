import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function files(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = join(root, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

const applicationCss = readFileSync('app/application.css', 'utf8');
const source = files('app')
  .filter((file) => /\.(tsx|ts)$/.test(file))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
const budgets = JSON.parse(
  readFileSync('docs/engineering/UI-DEBT-BASELINE-2026-10-29.json', 'utf8')
).budgets;

const metrics = {
  cssLines: applicationCss.split(/\r?\n/).length,
  important: (applicationCss.match(/!important/g) ?? []).length,
  mediaQueries: (applicationCss.match(/@media/g) ?? []).length,
  inlineStyles: (source.match(/style=\{\{/g) ?? []).length,
};

console.log('UI debt metrics', metrics);
console.log('UI debt budgets', budgets);

const exceeded = Object.entries(budgets).filter(([key, value]) => metrics[key] > value);
if (exceeded.length) {
  console.error('UI debt budget exceeded:', exceeded);
  process.exit(1);
}
