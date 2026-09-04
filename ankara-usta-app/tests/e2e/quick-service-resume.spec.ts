import {expect,test} from '@playwright/test';

for(const service of ['Musluk Değişimi','Tek Oda Boya','Avize Montajı']) {
  for(const width of [320,390,1280]) {
    test(`${service}: first opening and draft resume stay in view at ${width}px`,async({page})=>{
      await page.setViewportSize({width,height:844});
      await page.goto('/');
      await page.getByRole('button',{name:'Reddet',exact:true}).click();
      const open=async()=>{
        await page.getByRole('button',{name:service,exact:true}).click();
        await page.getByRole('button',{name:'Bu Hizmetle Devam Et →',exact:true}).click();
      };
      await open();
      const wizard=page.getByRole('dialog',{name:service,exact:true});
      await expect(wizard).toBeVisible();
      const firstAnswer=wizard.getByRole('radio').first();
      await wizard.locator('label').filter({has:page.getByRole('radio')}).first().click();
      await expect(firstAnswer).toBeChecked();
      await wizard.getByRole('button',{name:'Kapat',exact:true}).click();
      await open();
      const pending=page.getByRole('dialog',{name:`${service} — Talebe devam et`,exact:true});
      await expect(pending.getByRole('heading',{name:'Kayıtlı taslağınız var'})).toBeInViewport();
      await expect(page.getByRole('dialog')).toHaveCount(1);
      const resume=pending.getByRole('button',{name:'Hesabımdaki taslağa devam et'});
      await expect(resume).toBeInViewport({ratio:1});
      await expect(pending.getByRole('button',{name:'Taslağı sil ve yeni başla'})).toBeInViewport({ratio:1});
      const bounds=await pending.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
      await resume.click();
      await expect(wizard).toBeVisible();
      await expect(firstAnswer).toBeChecked();
      await expect(wizard.getByRole('heading',{level:2})).toBeFocused();
      await wizard.getByRole('button',{name:'Kapat',exact:true}).click();
      await open();
      await expect(pending).toBeInViewport();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
    });
  }
}
