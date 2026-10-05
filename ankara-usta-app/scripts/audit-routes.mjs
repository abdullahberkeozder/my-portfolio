import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

const files = walk('./app');
const pageFiles = walk('./app').filter(f => f.endsWith('page.tsx'));
const knownRoutes = pageFiles.map(f => {
  let r = f.replace(/^[\\\/]?app[\\\/]/, '').replace(/[\\\/]page\.tsx$/, '').replace(/\\/g, '/');
  return r === 'page.tsx' || r === '' ? '/' : '/' + r;
});

// Route pattern matching
function routeExists(targetUrl) {
  // Strip query and hash
  let urlPath = targetUrl.split('?')[0].split('#')[0];
  if (urlPath === '') urlPath = '/';

  // Exact match
  if (knownRoutes.includes(urlPath)) return true;

  // Check dynamic route match
  // e.g. /islerim/123 matches /islerim/[id]
  // e.g. /ankara/cankaya/boyaci matches /ankara/[district]/[service]
  // e.g. /ustalar/123 matches /ustalar/[id]
  // e.g. /ustalar/123/talep matches /ustalar/[id]/talep
  // e.g. /taleplerim/123/teklifler matches /taleplerim/[id]/teklifler
  // e.g. /teklifler/123 matches /teklifler/[id]
  // e.g. /uyusmazliklar/123 matches /uyusmazliklar/[id]
  // e.g. /gorusmeler/req/pro matches /gorusmeler/[requestId]/[professionalId]
  // e.g. /yonetim/uyusmazliklar/123 matches /yonetim/uyusmazliklar/[id]

  const parts = urlPath.split('/').filter(Boolean);
  for (const kr of knownRoutes) {
    const kparts = kr.split('/').filter(Boolean);
    if (parts.length === kparts.length) {
      let match = true;
      for (let i = 0; i < parts.length; i++) {
        if (kparts[i].startsWith('[') && kparts[i].endsWith(']')) {
          continue; // dynamic param matches any non-empty segment
        }
        if (kparts[i] !== parts[i]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }

  // Also check if targetUrl has template interpolation like ${...}
  if (targetUrl.includes('${')) {
    // replace ${...} with a dummy string
    const simulated = targetUrl.replace(/\$\{[^}]+\}/g, 'param1');
    return routeExists(simulated);
  }

  return false;
}

const deadLinks = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');

  // href="..."
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const val = match[1];
    if (!val.startsWith('http') && !val.startsWith('mailto:') && !val.startsWith('tel:') && !val.startsWith('#')) {
      if (!routeExists(val)) {
        deadLinks.push({ file: f, type: 'href', target: val });
      }
    }
  }

  // href={`...`}
  const hrefTemplateRegex = /href=\{`([^`]+)`\}/g;
  while ((match = hrefTemplateRegex.exec(content)) !== null) {
    const val = match[1];
    if (!val.startsWith('http') && !val.startsWith('#')) {
      if (!routeExists(val)) {
        deadLinks.push({ file: f, type: 'href-template', target: val });
      }
    }
  }

  // redirect(...)
  const redRegex = /redirect\((['"`][^'"`)]+['"`])\)/g;
  while ((match = redRegex.exec(content)) !== null) {
    const val = match[1].slice(1, -1);
    if (!routeExists(val)) {
      deadLinks.push({ file: f, type: 'redirect', target: val });
    }
  }

  // router.push(...)
  const pushRegex = /router\.push\((['"`][^'"`)]+['"`])\)/g;
  while ((match = pushRegex.exec(content)) !== null) {
    const val = match[1].slice(1, -1);
    if (!routeExists(val)) {
      deadLinks.push({ file: f, type: 'router.push', target: val });
    }
  }
}

console.log('=== ROUTE VALIDATION RESULTS ===');
if (deadLinks.length === 0) {
  console.log('All links and redirects point to valid routes!');
} else {
  console.log(`Found ${deadLinks.length} INVALID or DEAD link(s):`);
  deadLinks.forEach(d => {
    console.log(`- [${d.type}] "${d.target}" in ${path.relative(process.cwd(), d.file).replace(/\\/g, '/')}`);
  });
}
