import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';

function files(root){return readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(root,entry.name)):[join(root,entry.name)]);}
const css=readFileSync('app/application.css','utf8');
const source=files('app').filter(file=>/\.(tsx|ts)$/.test(file)).map(file=>readFileSync(file,'utf8')).join('\n');
const metrics={cssLines:css.split(/\r?\n/).length,important:(css.match(/!important/g)??[]).length,mediaQueries:(css.match(/@media/g)??[]).length,inlineStyles:(source.match(/style=\{\{/g)??[]).length};
// Ratchet baseline captured after the 2026-09-01 responsive/brand consolidation.
// New work may reduce these values but must not silently increase the remaining debt.
const budgets={cssLines:7252,important:569,mediaQueries:59,inlineStyles:71};
console.log('UI debt metrics',metrics);
const exceeded=Object.entries(budgets).filter(([key,value])=>metrics[key]>value);
if(exceeded.length){console.error('UI debt budget exceeded:',exceeded);process.exit(1);}
