import {expect,test,type Browser,type Page} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';

const requiredVariables=[
  'E2E_SUPABASE_URL','E2E_SUPABASE_KEY','E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD',
  'E2E_GOLDEN_TRADESPERSON_EMAIL','E2E_GOLDEN_TRADESPERSON_PASSWORD',
] as const;

function env(name:typeof requiredVariables[number]){
  const value=process.env[name];
  if(!value)throw new Error(`Eksik zorunlu P1 tarayıcı yapılandırması: ${name}`);
  return value;
}

async function signIn(page:Page,email:string,password:string,path?:string){
  if(path)await page.goto(path);
  await page.getByLabel('E-posta Adresi').fill(email);
  await page.getByLabel('Parola',{exact:true}).fill(password);
  const authResponse=page.waitForResponse(response=>new URL(response.url()).pathname==='/auth/v1/token');
  await page.getByRole('button',{name:'Giriş Yap →',exact:true}).click();
  expect((await authResponse).ok()).toBe(true);
}

async function openProfessional(browser:Browser){
  const context=await browser.newContext();
  const page=await context.newPage();
  await signIn(page,env('E2E_GOLDEN_TRADESPERSON_EMAIL'),env('E2E_GOLDEN_TRADESPERSON_PASSWORD'),'/usta/giris');
  await page.waitForURL(/\/usta\/(talepler|usta-basvurusu)/,{timeout:20_000});
  return {context,page};
}

async function confirmJobAction(page:Page,action:string){
  await page.getByRole('tab',{name:'Onay ve işlemler'}).click();
  await page.getByRole('button',{name:action,exact:true}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toContainText(`${action} işlemini onaylıyor musunuz?`);
  await dialog.getByRole('button',{name:'Evet, İşlemi Onayla →',exact:true}).click();
}

test.afterEach(async({page})=>{
  // Failure artifacts must never retain credentials in visible form fields.
  await page.locator('input').evaluateAll(inputs=>inputs.forEach(input=>{
    if(input instanceof HTMLInputElement)input.value='';
  })).catch(()=>{});
});

test('Musluk Değişimi: wizarddan iki oturumlu iş tamamlamaya gerçek tarayıcı yolu',async({browser,page})=>{
  test.setTimeout(150_000);
  test.skip(process.env.REQUIRE_AUTH_E2E !== 'true', 'Only run with active remote Supabase credentials.');
  expect(env('E2E_SUPABASE_URL')).toBe('https://hyuijuafuayzultbjvjb.supabase.co');
  for(const name of requiredVariables)env(name);

  await page.setViewportSize({width:1440,height:1000});
  await page.route('**/*.supabase.co/**',route=>
    new URL(route.request().url()).hostname==='hyuijuafuayzultbjvjb.supabase.co'?route.continue():route.abort());

  // Guest wizard: the request is assembled before authentication.
  await page.goto('/');
  await page.getByLabel('Hızlı arama etiketleri').getByRole('button',{name:'Musluk Değişimi'}).click();
  await page.getByRole('button',{name:'Bu Hizmetle Devam Et →'}).click();
  // The dialog's accessible name intentionally follows the active step title.
  // Anchor to the single modal and assert the service context separately.
  const wizard=page.getByRole('dialog');
  await expect(wizard.getByText('Musluk Değişimi',{exact:true})).toBeVisible();
  for(const [answer,next] of [
    ['Mutfak bataryası','Sonraki soruya geç'],
    ['Evet, yeni bataryayı aldım','Sonraki soruya geç'],
    ['Evet, su kesilebiliyor','Görsel ekleme adımına geç'],
  ] as const){
    await wizard.getByRole('radio',{name:answer,exact:true}).check();
    await wizard.getByRole('button',{name:next,exact:true}).click();
  }
  const locationStep=wizard.getByRole('button',{name:'Konum ve zamanı ekle',exact:true});
  await locationStep.focus();
  await expect(locationStep).toBeFocused();
  await locationStep.press('Enter');
  await wizard.getByLabel('İlçe Seçin').selectOption('Sincan');
  await wizard.getByLabel('Mahalle / Semt').selectOption('Törekent');
  await wizard.getByRole('button',{name:'Talep kapsamını kontrol et',exact:true}).click();
  const beforeAuth=await wizard.getByLabel('Talep kapsamı').innerText();

  // Same-tab auth return must restore the exact draft and summary.
  await wizard.getByRole('link',{name:'Giriş yap / kayıt ol ve devam et'}).click();
  await signIn(page,env('E2E_CUSTOMER_EMAIL'),env('E2E_CUSTOMER_PASSWORD'));
  await page.getByRole('button',{name:'Giriş öncesi taslağı bu hesaba aktar ve devam et',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Talebiniz hazır mı?'})).toBeVisible();
  await expect(page.getByLabel('Talep kapsamı')).toHaveText(beforeAuth,{useInnerText:true});
  const submitResponse=page.waitForResponse(response=>
    /\/api\/requests\/[^/]+\/submit$/.test(new URL(response.url()).pathname)&&response.request().method()==='POST');
  await page.getByRole('button',{name:'Talebi gönder',exact:true}).click();
  const submitted=await submitResponse;
  expect(submitted.ok()).toBe(true);
  const requestId=new URL(submitted.url()).pathname.split('/')[3];
  await expect(page.getByRole('link',{name:'Talebi görüntüle'})).toHaveAttribute('href',`/taleplerim/${requestId}/teklifler?created=1`);

  const professional=await openProfessional(browser);
  try{
    // Professional reviews the real request scope and creates the first quote.
    await professional.page.goto(`/usta/teklifler/${requestId}`);
    await expect(professional.page.getByRole('heading',{name:'Musluk Değişimi',level:1})).toBeVisible();
    await expect(professional.page.getByText('Mutfak bataryası',{exact:true})).toBeVisible();
    await professional.page.getByLabel('İşçilik Ücreti (TL)').fill('850');
    await professional.page.getByLabel('Malzeme Ücreti (TL)').fill('150');
    await professional.page.getByLabel('Tahmini Süre (Dakika)').fill('90');
    await professional.page.getByLabel('İşçilik Garantisi (Gün)').fill('180');
    await professional.page.getByLabel('Dahil Kapsam').fill('Eski bataryanın sökülmesi\nYeni bataryanın montajı\nSızdırmazlık kontrolü');
    await professional.page.getByLabel('Hariç Kapsam').fill('Yeni batarya bedeli\nTesisat hattı onarımı');
    const quoteMarker=`P1 BROWSER MUSLUK ${randomUUID()}`;
    await professional.page.getByLabel('Müşteriye Not').fill(quoteMarker);
    await professional.page.getByRole('button',{name:'Yeni Teklif Sürümünü Gönder →'}).click();
    await expect(professional.page.getByRole('status').filter({hasText:'Teklifin 1. sürümü gönderildi.'})).toBeVisible();

    // Customer compares and accepts through the product confirmation contract.
    await page.goto(`/taleplerim/${requestId}/teklifler`);
    await expect(page.getByText(quoteMarker,{exact:true})).toBeVisible();
    await expect(page.getByRole('table',{name:'Teklif karşılaştırma matrisi'})).toBeVisible();
    await page.getByRole('button',{name:'Bu teklifi kabul et',exact:true}).click();
    const acceptance=page.waitForResponse(response=>
      /\/api\/quotes\/[^/]+\/accept$/.test(new URL(response.url()).pathname)&&response.request().method()==='POST');
    await page.getByRole('dialog').getByRole('button',{name:'Şartları onayla ve kabul et',exact:true}).click();
    expect((await acceptance).ok()).toBe(true);
    await page.waitForURL(/\/islerim\/[0-9a-f-]{36}$/,{timeout:20_000});
    const jobId=new URL(page.url()).pathname.split('/').at(-1)!;

    await professional.page.goto(`/islerim/${jobId}`);
    await Promise.all([
      expect(page.locator('.realtime-indicator.is-live')).toBeVisible({timeout:20_000}),
      expect(professional.page.locator('.realtime-indicator.is-live')).toBeVisible({timeout:20_000}),
    ]);

    // Both authenticated sessions exchange messages before work begins.
    const customerMessage=`Musluk konumu hazır ${randomUUID()}`;
    const professionalMessage=`Randevu öncesi teyit ${randomUUID()}`;
    await page.getByLabel('Mesajınızı buraya yazın...').fill(customerMessage);
    await professional.page.getByLabel('Mesajınızı buraya yazın...').fill(professionalMessage);
    await Promise.all([
      page.getByRole('button',{name:'Gönder →'}).click(),
      professional.page.getByRole('button',{name:'Gönder →'}).click(),
    ]);
    for(const participant of [page,professional.page]){
      await expect(participant.getByText(customerMessage,{exact:true})).toHaveCount(1,{timeout:20_000});
      await expect(participant.getByText(professionalMessage,{exact:true})).toHaveCount(1,{timeout:20_000});
    }

    // Professional starts and delivers; customer receives each transition and completes.
    await confirmJobAction(professional.page,'İşe başla');
    await expect(professional.page.getByText('İş Devam Ediyor',{exact:true})).toBeVisible({timeout:20_000});
    await page.bringToFront();
    await expect(page.getByText('İş Devam Ediyor',{exact:true})).toBeVisible({timeout:20_000});

    await confirmJobAction(professional.page,'İşi bitirdim, onaya gönder');
    await expect(professional.page.getByText('Müşteri Onayı Bekleniyor',{exact:true})).toBeVisible({timeout:20_000});
    await page.bringToFront();
    await expect(page.getByText('Müşteri Onayı Bekleniyor',{exact:true})).toBeVisible({timeout:20_000});

    await confirmJobAction(page,'İşi onaylayın ve tamamlayın');
    await expect(page.getByText('Tamamlandı & Onaylandı',{exact:true})).toBeVisible({timeout:20_000});
    await professional.page.bringToFront();
    await expect(professional.page.getByText('Tamamlandı & Onaylandı',{exact:true})).toBeVisible({timeout:20_000});

    // Completion also opens the verified review surface.
    await page.bringToFront();
    await page.getByLabel('Değerlendirmeniz (isteğe bağlı, en az 10 karakter)').fill('İletişim ve montaj süreci test ortamında başarıyla tamamlandı.');
    await page.getByRole('button',{name:'Değerlendirmeyi gönder',exact:true}).click();
    await expect(page.getByText('İletişim ve montaj süreci test ortamında başarıyla tamamlandı.',{exact:true})).toBeVisible({timeout:20_000});

    // Database reads are evidence only; no product step above is prepared by RPC.
    const verification=createClient(env('E2E_SUPABASE_URL'),env('E2E_SUPABASE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
    const login=await verification.auth.signInWithPassword({email:env('E2E_CUSTOMER_EMAIL'),password:env('E2E_CUSTOMER_PASSWORD')});
    expect(login.error).toBeNull();
    const [job,review,duplicates]=await Promise.all([
      verification.from('jobs').select('id,status,request_id').eq('id',jobId).single(),
      verification.from('reviews').select('id,rating,comment').eq('job_id',jobId).single(),
      verification.from('service_requests').select('id',{count:'exact',head:true}).eq('id',requestId),
    ]);
    expect(job.error).toBeNull();expect(job.data?.status).toBe('completed');expect(job.data?.request_id).toBe(requestId);
    expect(review.error).toBeNull();expect(review.data?.rating).toBe(5);
    expect(duplicates.error).toBeNull();expect(duplicates.count).toBe(1);
    await verification.auth.signOut({scope:'local'});
  }finally{
    await professional.context.close();
  }
});
