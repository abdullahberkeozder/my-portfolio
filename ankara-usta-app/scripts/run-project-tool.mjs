import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const minimumVersion = [22, 13, 0];
const tools = {
  eslint: ['eslint', 'bin', 'eslint.js'],
  playwright: ['@playwright', 'test', 'cli.js'],
  tsc: ['typescript', 'bin', 'tsc'],
  vitest: ['vitest', 'vitest.mjs'],
};

function parseVersion(version) {
  return version.split('.').map((part) => Number.parseInt(part, 10));
}

function isCompatible(version) {
  const current = parseVersion(version);
  for (let index = 0; index < minimumVersion.length; index += 1) {
    if (current[index] > minimumVersion[index]) return true;
    if (current[index] < minimumVersion[index]) return false;
  }
  return true;
}

function findProjectNode() {
  if (isCompatible(process.versions.node)) return process.execPath;
  if (process.platform !== 'win32') return null;
  const toolsDirectory = join(process.cwd(), '.tools');
  try {
    return readdirSync(toolsDirectory, {withFileTypes: true})
      .filter((entry) => entry.isDirectory() && /^node-v\d+\.\d+\.\d+-win-x64$/.test(entry.name))
      .map((entry) => ({executable: join(toolsDirectory, entry.name, 'node.exe'), version: entry.name.slice('node-v'.length, -'-win-x64'.length)}))
      .filter((candidate) => isCompatible(candidate.version))
      .sort((left, right) => right.version.localeCompare(left.version, undefined, {numeric: true}))[0]?.executable ?? null;
  } catch {
    return null;
  }
}

const [toolName, ...forwardedArguments] = process.argv.slice(2);
const executableParts = tools[toolName];
if (!executableParts) {
  console.error(`Unknown project tool: ${toolName}`);
  process.exit(1);
}

const nodeExecutable = findProjectNode();
if (!nodeExecutable) {
  console.error(`Node.js ${minimumVersion.join('.')} or newer is required. Current: ${process.versions.node}`);
  process.exit(1);
}

const cli = join(process.cwd(), 'node_modules', ...executableParts);
const result = spawnSync(nodeExecutable, [cli, ...forwardedArguments], {cwd: process.cwd(), env: process.env, stdio: 'inherit'});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
