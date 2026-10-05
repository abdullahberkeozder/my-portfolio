import {spawn} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {createConnection} from 'node:net';
import {join, resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const port = 4187;
const minimumNode = [22, 13, 0];

function isCompatibleNode(version:string) {
  const current = version.split('.').map(Number);
  return current[0] > minimumNode[0]
    || (current[0] === minimumNode[0] && (current[1] > minimumNode[1]
      || (current[1] === minimumNode[1] && current[2] >= minimumNode[2])));
}

function resolveProjectNode() {
  if (isCompatibleNode(process.versions.node)) return process.execPath;
  if (process.platform !== 'win32') return null;
  const toolsDirectory = join(process.cwd(), '.tools');
  try {
    return readdirSync(toolsDirectory, {withFileTypes:true})
      .filter((entry) => entry.isDirectory() && /^node-v\d+\.\d+\.\d+-win-x64$/.test(entry.name))
      .map((entry) => ({
        executable: join(toolsDirectory, entry.name, 'node.exe'),
        version: entry.name.slice('node-v'.length, -'-win-x64'.length),
      }))
      .filter((candidate) => isCompatibleNode(candidate.version))
      .sort((left, right) => right.version.localeCompare(left.version, undefined, {numeric:true}))[0]?.executable ?? null;
  } catch {
    return null;
  }
}
async function portInUse() {
  return new Promise<boolean>((done) => {
    const socket = createConnection({host:'127.0.0.1',port});
    const finish = (used:boolean) => {socket.destroy(); done(used);};
    socket.once('connect',()=>finish(true));
    socket.once('error',()=>finish(false));
    socket.setTimeout(1000,()=>finish(true));
  });
}

/** Own one Vinext process, never kill by executable name or adopt an existing server. */
export default async function setup() {
  if (await portInUse()) throw new Error(`E2E port ${port} is already occupied; existing process left untouched.`);
  const nodeExecutable = resolveProjectNode();
  if (!nodeExecutable) {
    throw new Error(`Playwright E2E için Node.js ${minimumNode.join('.')} veya daha yeni bir sürüm gerekli; sistem Node ${process.versions.node}, proje portable runtime bulunamadı.`);
  }
  const child = spawn(nodeExecutable, [resolve('node_modules/vinext/dist/cli.js'),'start','--port',String(port)], {
    shell:false, windowsHide:true, stdio:['ignore','inherit','inherit'],
    env:{...process.env,PLAYWRIGHT_TEST:'1'},
  });
  let ended = false;
  let failure: Error | undefined;
  const closed = new Promise<void>(done => {
    child.once('error',error=>{failure=error; ended=true; done();});
    child.once('exit',()=>{ended=true; done();});
  });
  const killOwned = () => {if (!ended) child.kill('SIGKILL');};
  process.once('exit',killOwned);
  const stop = async () => {
    try {
      // Node terminates this owned PID directly on Windows, without taskkill/shell.
      killOwned();
      const exited = await Promise.race([closed.then(()=>true),delay(5000,undefined,{ref:false}).then(()=>false)]);
      if (!exited) throw new Error(`E2E server PID ${child.pid} did not exit within 5s.`);
      if (await portInUse()) throw new Error(`E2E port ${port} remains occupied after server exit.`);
      console.log('[E2E server] Stopped; port 4187 released.');
    } finally {process.removeListener('exit',killOwned);}
  };
  try {
    const deadline = Date.now()+120_000;
    while (Date.now()<deadline) {
      if (ended) throw failure ?? new Error(`E2E server exited before readiness (${child.exitCode}).`);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/`,{signal:AbortSignal.timeout(2000)});
        await response.body?.cancel();
        if (response.ok) return stop;
      } catch { /* Startup may not yet have bound the port. */ }
      await delay(100);
    }
    throw new Error('E2E server readiness timed out after 120s.');
  } catch(error) {await stop(); throw error;}
}
