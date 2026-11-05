const {chromium}=require('@playwright/test');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch(); const results=[];
 for(const w of [320,390,820,1440,1920]){
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
  const reject=p.getByRole('button',{name:'Reddet',exact:true}); if(await reject.count())await reject.click();
  for(let y=0;y<await p.evaluate(()=>document.body.scrollHeight);y+=700){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(120);}
  await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(200);
  results.push(await p.evaluate(w=>{const c=document.querySelector('.landing-container').getBoundingClientRect();const h=document.querySelector('.landing-hero').getBoundingClientRect();return {viewport:w,documentWidth:document.documentElement.scrollWidth,containerWidth:c.width,gutter:c.x,heroWidth:h.width};},w));
  await p.screenshot({path:__dirname+'/after-'+w+'.png',fullPage:true});await p.close();
 }
 await b.close();fs.writeFileSync(__dirname+'/layout-check.json',JSON.stringify(results,null,2));console.log(results);
 if(results.some(x=>x.documentWidth>x.viewport))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
