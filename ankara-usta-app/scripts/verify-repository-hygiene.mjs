import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {basename,extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptPath=fileURLToPath(import.meta.url);
const repositoryRoot=resolve(scriptPath,'../../..');
const tracked=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{cwd:repositoryRoot,encoding:'utf8'})
  .split('\0')
  .filter(Boolean);

const allowedEnvironmentExamples=/\.env(?:\.[^/\\]+)?\.example$/i;
const forbiddenPaths=tracked.filter(path=>{
  const name=basename(path);
  return (name==='.env'||name.startsWith('.env.'))&&!allowedEnvironmentExamples.test(path);
});

const binaryExtensions=new Set(['.png','.jpg','.jpeg','.gif','.webp','.ico','.pdf','.woff','.woff2','.zip','.gz']);
const highConfidenceSecrets=[
  {name:'private key',pattern:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/},
  {name:'GitHub token',pattern:/\bgh[pousr]_[A-Za-z0-9]{30,}\b/},
  {name:'Supabase secret key',pattern:/\bsb_secret_[A-Za-z0-9]{24,}\b/},
  {name:'Resend API key',pattern:/\bre_[A-Za-z0-9]{20,}\b/},
  {name:'JWT-like credential',pattern:/\beyJ[A-Za-z0-9_-]{80,}\b/}
];
const findings=[];

for(const relativePath of tracked){
  if(relativePath.endsWith('scripts/verify-repository-hygiene.mjs')||binaryExtensions.has(extname(relativePath).toLowerCase())) continue;
  let content='';
  try{content=readFileSync(resolve(repositoryRoot,relativePath),'utf8')}catch{continue}
  for(const secret of highConfidenceSecrets){
    if(secret.pattern.test(content)) findings.push(`${relativePath}: ${secret.name}`);
  }
}

if(forbiddenPaths.length||findings.length){
  console.error('Repository hygiene check failed.');
  for(const path of forbiddenPaths) console.error(`Tracked environment file: ${path}`);
  for(const finding of findings) console.error(`Potential secret: ${finding}`);
  process.exit(1);
}

console.log(`Repository hygiene verified across ${tracked.length} repository files.`);
