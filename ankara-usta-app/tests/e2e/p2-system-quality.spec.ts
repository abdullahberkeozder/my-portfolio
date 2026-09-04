import {expect,test} from '@playwright/test';

test('active navigation has a current-page label in desktop and compact modes',async({page})=>{
  await page.goto('/nasil-calisir');await page.getByRole('button',{name:'Reddet',exact:true}).click();
  const menu=page.getByRole('button',{name:'Menü',exact:true});const compact=await menu.isVisible();if(compact)await menu.click();
  const nav=page.getByRole('navigation',{name:compact?'Mobil navigasyon':'Ana navigasyon',exact:true});
  await expect(nav.getByRole('link',{name:'Nasıl çalışır?',exact:true})).toHaveAttribute('aria-current','page');
});

test('privacy controls cannot cover an open mobile menu',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  const banner=page.getByRole('region',{name:'Gizlilik ve Çerez Tercihleri'});
  await expect(banner).toBeVisible();
  const menu=page.getByRole('button',{name:'Menü',exact:true});await menu.focus();await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog',{name:'Menü',exact:true});await expect(dialog).toBeVisible();await expect(banner).toBeHidden();
  await expect(dialog.getByRole('button',{name:'Kapat'})).toBeFocused();
  await expect(dialog.getByRole('link',{name:'Usta olarak katıl'})).toHaveAttribute('href','/usta/kayit');
  await expect(dialog.getByRole('link',{name:'Yardım ve destek'})).toHaveAttribute('href','/yardim');
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(menu).toBeFocused();await expect(banner).toBeVisible();
  await banner.getByRole('button',{name:'Reddet',exact:true}).click();await page.reload();await expect(banner).toHaveCount(0);
});

test('hero no longer forces a full-screen sticky spacer',async({page})=>{
  await page.goto('/');const inner=page.locator('.orkestra-hero-inner');await expect(inner).toBeVisible();
  await expect(inner).not.toHaveCSS('position','sticky');
  const heading=page.getByRole('heading',{name:/İşini anlat.*Doğru ustayla buluş/});await expect(heading).toBeVisible();
  const logo=page.locator('.orkestra-hero-emblem');await expect(logo).toHaveCount(1);
  const box=await logo.boundingBox();expect(box!.height).toBeGreaterThan(0);expect(box!.y).toBeLessThan(200);
});

test('320px routes reflow and reduced motion disables logo animation',async({page})=>{
  await page.setViewportSize({width:320,height:720});await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['/','/nasil-calisir','/usta-basvurusu']){
    await page.goto(route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),route).toBe(true);
  }
  await page.goto('/');const logo=page.locator('.orchestra-directional-logo').first();await expect(logo).toHaveCount(1);await expect(logo).toHaveCSS('animation-name','none');
});
