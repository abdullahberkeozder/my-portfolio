import {describe,expect,it} from 'vitest';
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';

function routeFiles(directory:string):string[]{
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const path=join(directory,entry.name);
    return entry.isDirectory()?routeFiles(path):entry.name==='route.ts'?[path]:[];
  });
}

describe('API error response contract',()=>{
  for(const file of routeFiles(join(process.cwd(),'app','api'))){
    it(`${file.slice(process.cwd().length+1)} does not expose raw or unstructured errors`,()=>{
      const source=readFileSync(file,'utf8');
      expect(source).not.toMatch(/error\s+instanceof\s+Error\s*\?\s*error\.message/);
      expect(source).not.toMatch(/matchingWarning\s*:\s*[^,}\n]*\.message/);
      expect(source).not.toMatch(/NextResponse\.json\s*\(\s*\{\s*error\s*:/);
      expect(source).not.toMatch(/jsonApiError\s*\(\s*['"`]/);
    });
  }
});
