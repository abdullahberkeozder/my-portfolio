const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const project = path.resolve(__dirname, '../../..');
const server = spawn('python', ['-m','http.server','3188','--bind','127.0.0.1','--directory',project], {windowsHide:true,stdio:'ignore'});
(async()=>{
 let browser;
 try {
  let ready=false;
  for(let n=0;n<60;n++){try{const r=await fetch('http://127.0.0.1:3188/docs/design/landing-aesthetic-comparison-v1/proposal.html');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  if(!ready)throw new Error('Design preview not available');
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({deviceScaleFactor:1});
  const results=[];
  for(const width of [1440,390,320,820]){
   const height=width>900?1000:844;
   await page.setViewportSize({width,height});
   await page.goto('http://127.0.0.1:3188/docs/design/landing-aesthetic-comparison-v1/proposal.html',{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   results.push(await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),firstWorkPhotoY:document.querySelector('img[src*="discovery"]')?.getBoundingClientRect().top,h1:document.querySelector('h1')?.innerText})));
   if(width===1440||width===390){await page.screenshot({path:path.join(__dirname,`after-${width}.png`),fullPage:true});await page.screenshot({path:path.join(__dirname,`after-${width}-viewport.png`)});}
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:3188/docs/design/landing-aesthetic-comparison-v1/compare.html',{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(__dirname,'comparison-desktop.png')});
  await page.getByRole('button',{name:'Mobil · 390 px'}).click();
  await page.waitForLoadState('networkidle');
  await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
  await page.screenshot({path:path.join(__dirname,'comparison-mobile.png')});
  fs.writeFileSync(path.join(__dirname,'VISUAL-CHECKS.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
