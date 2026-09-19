import {test,expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
test.afterEach(async ({page}) => {
  // Failure snapshots must not retain credentials in input values.
  await page.locator('input').evaluateAll(inputs => inputs.forEach(input => {if(input instanceof HTMLInputElement)input.value='';})).catch(()=>{});
});
test('selected professional survives sign-in and one submission',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  expect(process.env.E2E_SUPABASE_URL).toBe('https://hyuijuafuayzultbjvjb.supabase.co');
  const client=createClient(process.env.E2E_SUPABASE_URL!,process.env.E2E_SUPABASE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
  const profiles=await client.from('tradesperson_profiles').select('user_id').eq('display_name','TEST PROFİLİ · Montaj Ustası').single();
  expect(profiles.error).toBeNull(); const id=profiles.data!.user_id;
  await page.route('**/*.supabase.co/**',route=>new URL(route.request().url()).hostname==='hyuijuafuayzultbjvjb.supabase.co'?route.continue():route.abort());
  await page.goto(`/ustalar/${id}?service=tv-duvar-montaji`);
  await page.getByRole('button',{name:'Bu ustadan teklif al',exact:true}).click();
  for(let i=0;i<3;i++) {
    await page.getByRole('radio').first().check();
    await page.getByRole('button',{name:i===2?'Görsel ekleme adımına geç':'Sonraki soruya geç'}).click();
  }
  await page.getByRole('button',{name:'Konum ve zamanı ekle'}).click();
  await page.getByLabel('İlçe Seçin').selectOption('Çankaya');
  await page.getByLabel('Mahalle / Semt').selectOption('Ayrancı');
  await page.getByRole('button',{name:'Talep kapsamını kontrol et'}).click();
  const before=await page.getByLabel('Talep kapsamı').innerText();
  await page.getByRole('link',{name:'Giriş yap / kayıt ol ve devam et'}).click();
  await page.getByLabel('E-posta Adresi').fill(process.env.E2E_CUSTOMER_EMAIL!);
  await page.getByLabel('Parola',{exact:true}).fill(process.env.E2E_CUSTOMER_PASSWORD!);
  expect(await page.getByLabel('E-posta Adresi').inputValue().then(value=>value===process.env.E2E_CUSTOMER_EMAIL)).toBe(true);
  const authResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/auth/v1/token',{timeout:15000});
  await page.getByRole('button',{name:'Giriş Yap →',exact:true}).click();
  expect((await authResponse).ok()).toBe(true);
  await page.getByRole('button',{name:'Giriş öncesi taslağı bu hesaba aktar ve devam et',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Talebiniz hazır mı?'})).toBeVisible();
  await expect(page.getByLabel('Talep kapsamı')).toHaveText(before,{useInnerText:true});
  await expect(page.getByText('Yalnız TEST PROFİLİ · Montaj Ustası için hazırlanıyor.',{exact:true})).toBeVisible();
  const response=page.waitForResponse(r=>/\/api\/requests\/[^/]+\/submit$/.test(new URL(r.url()).pathname)&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Bu ustaya talebi gönder',exact:true}).click();
  const submitted=await response; expect(submitted.ok()).toBe(true);
  const requestId=new URL(submitted.url()).pathname.split('/')[3];
  const login=await client.auth.signInWithPassword({email:process.env.E2E_CUSTOMER_EMAIL!,password:process.env.E2E_CUSTOMER_PASSWORD!});
  expect(login.error).toBeNull();
  try {
    const row=await client.from('service_requests').select('id,target_professional_id,status,idempotency_key,district,neighborhood').eq('id',requestId).single();
    expect(row.error).toBeNull(); expect(row.data!.target_professional_id).toBe(id); expect(row.data!.status).not.toBe('draft');
    expect(row.data!.district).toBe('Çankaya'); expect(row.data!.neighborhood).toBe('Ayrancı');
    const duplicates=await client.from('service_requests').select('id',{count:'exact',head:true}).eq('idempotency_key',row.data!.idempotency_key);
    expect(duplicates.error).toBeNull(); expect(duplicates.count).toBe(1);
  } finally {await client.auth.signOut({scope:'local'});}
});
