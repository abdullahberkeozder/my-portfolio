import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, extname, join, resolve} from 'node:path';

const projectRoot = process.cwd();
const appRoot = join(projectRoot, 'app');
const requiredEntrypoint = join(appRoot, 'application.css');
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const relativeStyleImport = /(?:import\s+[^'\"]*from\s+|import\s*|@import\s+)["'](\.[^"']+\.css)["']/g;
const failures = [];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

if (!existsSync(requiredEntrypoint)) {
  failures.push('app/application.css bulunamadı. Uygulamanın tek global stil giriş noktası gereklidir.');
}

for (const file of walk(appRoot).filter((path) => sourceExtensions.has(extname(path)))) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(relativeStyleImport)) {
    const target = resolve(dirname(file), match[1]);
    if (!existsSync(target)) failures.push(`${file}: ${match[1]} bulunamadı.`);
  }
}

const layout = readFileSync(join(appRoot, 'layout.tsx'), 'utf8');
if (!layout.includes("import './application.css';")) {
  failures.push("app/layout.tsx yalnızca './application.css' global stil girişini kullanmalıdır.");
}
if (/import ['\"]\.\/phase\d+\.css['\"]/.test(layout)) {
  failures.push('app/layout.tsx içinde faz numaralı CSS importu kullanılamaz.');
}

if (failures.length) {
  console.error('Stil bütünlüğü denetimi başarısız:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Stil giriş noktaları doğrulandı.');
