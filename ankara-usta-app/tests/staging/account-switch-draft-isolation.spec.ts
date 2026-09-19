import {expect,test,type Page} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';

const stagingUrl='https://hyuijuafuayzultbjvjb.supabase.co';

test.afterEach(async({page})=>{
  // Failure artifacts must never retain credentials in form controls.
  await page.locator('input').evaluateAll(inputs=>inputs.forEach(input=>{
    if(input instanceof HTMLInputElement)input.value='';
  })).catch(()=>{});
});

async function signIn(page:Page,email:string,password:string,next:string) {
  await page.goto(`/giris?next=${encodeURIComponent(next)}`);
  await page.getByLabel('E-posta Adresi').fill(email);
  await page.getByLabel('Parola',{exact:true}).fill(password);
  const token=page.waitForResponse(response=>new URL(response.url()).pathname==='/auth/v1/token',{timeout:15_000});
  await page.getByRole('button',{name:'Giriş Yap →',exact:true}).click();
  expect((await token).ok()).toBe(true);
  await expect(page).toHaveURL(new RegExp(next.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
}

async function signOut(page:Page) {
  await page.goto('/hesap?workspace=customer');
  await page.getByRole('button',{name:'Oturumu kapat',exact:true}).click();
  await expect(page).toHaveURL(/\/giris$/);
}

test('same browser keeps customer A draft isolated from customer B',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  expect(process.env.E2E_SUPABASE_URL).toBe(stagingUrl);
  const publicClient=createClient(stagingUrl,process.env.E2E_SUPABASE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
  const profile=await publicClient.from('tradesperson_profiles').select('user_id').eq('display_name','TEST PROFİLİ · Montaj Ustası').single();
  expect(profile.error).toBeNull();
  const professionalId=profile.data!.user_id;
  const requestPath=`/ustalar/${professionalId}/talep?service=tv-duvar-montaji`;
  await page.route('**/*.supabase.co/**',route=>new URL(route.request().url()).hostname==='hyuijuafuayzultbjvjb.supabase.co'?route.continue():route.abort());

  await signIn(page,process.env.E2E_CUSTOMER_EMAIL!,process.env.E2E_CUSTOMER_PASSWORD!,requestPath);
  let draftResponse:ReturnType<Page['waitForResponse']>|undefined;
  for(let index=0;index<3;index+=1) {
    const radios=page.getByRole('radio');
    await radios.first().check();
    if(index===2) draftResponse=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/requests/draft'&&response.request().method()==='POST');
    await page.getByRole('button',{name:index===2?'Görsel ekleme adımına geç':'Sonraki soruya geç'}).click();
  }
  expect((await draftResponse!).ok()).toBe(true);
  const customerALocalKeys=await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('orkestra:draft:v2:')));
  expect(customerALocalKeys).toHaveLength(1);
  await expect.poll(()=>page.evaluate(()=>{
    const key=Object.keys(localStorage).find(item=>item.startsWith('orkestra:draft:v2:'))!;
    return JSON.parse(localStorage.getItem(key)!).requestId as string|undefined;
  })).toMatch(/^[0-9a-f-]{36}$/);
  const customerADraftId=await page.evaluate(()=>{
    const key=Object.keys(localStorage).find(item=>item.startsWith('orkestra:draft:v2:'))!;
    return JSON.parse(localStorage.getItem(key)!).requestId as string;
  });
  expect(customerADraftId).toMatch(/^[0-9a-f-]{36}$/);
  await signOut(page);

  await signIn(page,process.env.E2E_SECOND_CUSTOMER_EMAIL!,process.env.E2E_SECOND_CUSTOMER_PASSWORD!,requestPath);
  await expect(page.getByRole('heading',{name:'Televizyonun ekran boyutu nedir?'})).toBeVisible();
  await expect(page.getByRole('radio').first()).not.toBeChecked();
  await expect(page.getByRole('heading',{name:'Kayıtlı taslağınız var'})).toHaveCount(0);
  const customerBLocalKeys=await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('orkestra:draft:v2:')));
  expect(customerBLocalKeys).toHaveLength(2);
  expect(customerBLocalKeys.filter(key=>key!==customerALocalKeys[0])).toHaveLength(1);
  const customerBClient=createClient(stagingUrl,process.env.E2E_SUPABASE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
  const customerBLogin=await customerBClient.auth.signInWithPassword({email:process.env.E2E_SECOND_CUSTOMER_EMAIL!,password:process.env.E2E_SECOND_CUSTOMER_PASSWORD!});
  expect(customerBLogin.error).toBeNull();
  try {
    const foreignDraft=await customerBClient.from('service_requests').select('id').eq('id',customerADraftId).maybeSingle();
    expect(foreignDraft.error).toBeNull();
    expect(foreignDraft.data).toBeNull();
  } finally {await customerBClient.auth.signOut({scope:'local'});}
  await signOut(page);

  await signIn(page,process.env.E2E_CUSTOMER_EMAIL!,process.env.E2E_CUSTOMER_PASSWORD!,requestPath);
  await expect(page.getByRole('heading',{name:'Kayıtlı taslağınız var'})).toBeVisible();
  await page.getByRole('button',{name:'Hesabımdaki taslağa devam et'}).click();
  await expect(page.getByRole('heading',{name:'İsterseniz fotoğraf veya video ekleyin'})).toBeVisible();
  const restoredDraftId=await page.evaluate(()=>{
    const entries=Object.entries(localStorage).filter(([key])=>key.startsWith('orkestra:draft:v2:'));
    const draft=entries.map(([,value])=>JSON.parse(value)).find(value=>value.requestId);
    return draft?.requestId as string|undefined;
  });
  expect(restoredDraftId).toBe(customerADraftId);
});
