import {expect,test,type Browser,type BrowserContext,type Page} from '@playwright/test';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';

const requiredVariables=[
  'E2E_SUPABASE_URL','E2E_SUPABASE_KEY','E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD',
  'E2E_GOLDEN_TRADESPERSON_EMAIL','E2E_GOLDEN_TRADESPERSON_PASSWORD','E2E_ADMIN_EMAIL','E2E_ADMIN_PASSWORD',
] as const;
type RequiredVariable=typeof requiredVariables[number];
type Participant={context:BrowserContext;page:Page};

function env(name:RequiredVariable){const value=process.env[name];if(!value)throw new Error(`Eksik zorunlu P1 uyuşmazlık yapılandırması: ${name}`);return value;}
function client(){return createClient(env('E2E_SUPABASE_URL'),env('E2E_SUPABASE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});}
async function authenticate(supabase:SupabaseClient,email:string,password:string,label:string){
  const {data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error||!data.user)throw new Error(`${label} fixture hesabı doğrulanamadı: ${error?.message??'kullanıcı yok'}`);
  return data.user;
}
async function rpc<T>(supabase:SupabaseClient,name:string,args:Record<string,unknown>):Promise<T>{
  const {data,error}=await supabase.rpc(name,args);
  if(error)throw new Error(`${name} fixture adımı başarısız: ${[error.message,error.details,error.hint].filter(Boolean).join(' | ')}`);
  return (Array.isArray(data)?data[0]:data) as T;
}

async function createDisputeFixture(){
  const customer=client(),professional=client();
  try{
    const [customerUser,professionalUser]=await Promise.all([
      authenticate(customer,env('E2E_CUSTOMER_EMAIL'),env('E2E_CUSTOMER_PASSWORD'),'Müşteri'),
      authenticate(professional,env('E2E_GOLDEN_TRADESPERSON_EMAIL'),env('E2E_GOLDEN_TRADESPERSON_PASSWORD'),'Usta'),
    ]);
    if(customerUser.id===professionalUser.id)throw new Error('Uyuşmazlık fixture tarafları farklı hesaplar olmalı.');
    const runId=randomUUID();
    const draft=await rpc<{id:string}>(customer,'upsert_request_draft',{
      p_idempotency_key:runId,p_service_id:'musluk-degisimi',p_delivery_model:'package',
      p_answers:{'faucet-type':'Mutfak bataryası','part-available':'Evet, yeni bataryayı aldım','shutoff-valve':'Evet, su kesilebiliyor'},
      p_district:'Sincan',p_neighborhood:'Törekent',p_preferred_timing:'this_week',
    });
    await rpc(customer,'submit_request',{p_request_id:draft.id,p_idempotency_key:runId});
    await rpc(customer,'match_request',{p_request_id:draft.id});
    const quote=await rpc<{id:string}>(professional,'create_quote_version',{
      p_request_id:draft.id,p_labor_amount_kurus:85000,p_material_amount_kurus:15000,
      p_estimated_duration_minutes:90,p_warranty_days:180,
      p_included_scope:['P1 admin uyuşmazlık fixture montajı'],p_excluded_scope:['Tesisat hattı yenileme'],
      p_note:`P1 ADMIN DISPUTE ${runId}`,
    });
    const accepted=await rpc<{job_id?:string;jobId?:string}>(customer,'accept_quote',{p_quote_id:quote.id});
    const jobId=accepted.job_id??accepted.jobId;
    if(!jobId){
      const {data,error}=await customer.from('jobs').select('id').eq('request_id',draft.id).single();
      if(error||!data)throw new Error(`Uyuşmazlık fixture işi bulunamadı: ${error?.message??'kayıt yok'}`);
      return {jobId:data.id,requestId:draft.id};
    }
    return {jobId,requestId:draft.id};
  }finally{
    await Promise.all([customer.auth.signOut({scope:'local'}),professional.auth.signOut({scope:'local'})]);
  }
}

async function signIn(browser:Browser,email:string,password:string,path='/giris'):Promise<Participant>{
  const context=await browser.newContext();const page=await context.newPage();
  await page.goto(path);await page.getByLabel('E-posta Adresi').fill(email);await page.getByLabel('Parola',{exact:true}).fill(password);
  const auth=page.waitForResponse(response=>new URL(response.url()).pathname==='/auth/v1/token');
  await page.getByRole('button',{name:'Giriş Yap →',exact:true}).click();expect((await auth).ok()).toBe(true);
  await page.waitForURL(/\/(taleplerim|usta\/talepler|yonetim)/,{timeout:20_000});
  return {context,page};
}

async function adminTransition(page:Page,status:string,reason:string,customerExplanation?:string,professionalExplanation?:string){
  await page.getByLabel('Yeni Aşama').selectOption(status);
  await page.getByLabel('Denetlenebilir operasyon gerekçesi').fill(reason);
  if(customerExplanation)await page.getByLabel('Müşteriye gösterilecek karar açıklaması').fill(customerExplanation);
  if(professionalExplanation)await page.getByLabel('Ustaya gösterilecek karar açıklaması').fill(professionalExplanation);
  const response=page.waitForResponse(item=>/\/api\/admin\/disputes\/[^/]+\/transition$/.test(new URL(item.url()).pathname)&&item.request().method()==='POST');
  await page.getByRole('button',{name:'Aşamayı kaydet',exact:true}).click();
  expect((await response).ok()).toBe(true);
}

test.afterEach(async({page})=>{
  await page.locator('input').evaluateAll(inputs=>inputs.forEach(input=>{if(input instanceof HTMLInputElement)input.value='';})).catch(()=>{});
});

test('müşteri uyuşmazlığı admin kararıyla iki tarafa ayrı ve canlı yansır',async({browser})=>{
  test.setTimeout(180_000);
  expect(process.env.REQUIRE_AUTH_E2E).toBe('true');
  expect(env('E2E_SUPABASE_URL')).toBe('https://hyuijuafuayzultbjvjb.supabase.co');
  for(const name of requiredVariables)env(name);
  const fixture=await createDisputeFixture();
  const [customer,professional,admin]=await Promise.all([
    signIn(browser,env('E2E_CUSTOMER_EMAIL'),env('E2E_CUSTOMER_PASSWORD')),
    signIn(browser,env('E2E_GOLDEN_TRADESPERSON_EMAIL'),env('E2E_GOLDEN_TRADESPERSON_PASSWORD'),'/usta/giris'),
    signIn(browser,env('E2E_ADMIN_EMAIL'),env('E2E_ADMIN_PASSWORD')),
  ]);
  const description=`P1 admin kararı testi ${randomUUID()} kapsamında montaj sonrası sızıntı görüldü.`;
  const customerDecision='Bağlantıların ücretsiz olarak yeniden kontrol edilmesine karar verildi.';
  const professionalDecision='Müşteriyle ücretsiz kontrol randevusu oluşturmanız ve sonucu kaydetmeniz gerekiyor.';
  try{
    // The participant opens the case only through the customer job surface.
    await customer.page.goto(`/islerim/${fixture.jobId}`);
    await customer.page.getByLabel('Sorun türü').selectOption('damage');
    await customer.page.getByLabel('Olayın açıklaması (gerekli, en az 20 karakter)').fill(description);
    const openedResponse=customer.page.waitForResponse(item=>/\/api\/jobs\/[^/]+\/disputes$/.test(new URL(item.url()).pathname)&&item.request().method()==='POST');
    await customer.page.getByRole('button',{name:'Uyuşmazlık kaydı aç',exact:true}).click();
    const opened=await openedResponse;expect(opened.status()).toBe(201);
    const openedBody=await opened.json() as {dispute?:{id?:string}};
    const disputeId=openedBody.dispute?.id;
    expect(disputeId).toMatch(/^[0-9a-f-]{36}$/);

    await Promise.all([
      customer.page.goto(`/uyusmazliklar/${disputeId}`),
      professional.page.goto(`/uyusmazliklar/${disputeId}`),
    ]);
    await Promise.all([
      expect(customer.page.getByRole('article').getByText(description,{exact:true})).toBeVisible(),
      expect(professional.page.getByRole('article').getByText(description,{exact:true})).toBeVisible(),
      expect(customer.page.locator('.realtime-indicator.is-live')).toBeVisible({timeout:20_000}),
      expect(professional.page.locator('.realtime-indicator.is-live')).toBeVisible({timeout:20_000}),
    ]);

    // Admin discovers the participant-created case from the real queue.
    await admin.page.goto('/yonetim/uyusmazliklar');
    const queueItem=admin.page.getByRole('link').filter({hasText:description});
    await expect(queueItem).toBeVisible();
    const caseHref=await queueItem.getAttribute('href');
    expect(caseHref).toBe(`/yonetim/uyusmazliklar/${disputeId}`);
    // Vinext's production preview currently leaves client-side Link navigation
    // pending after its known RSC prefetch error. Preserve queue discovery while
    // using a full browser navigation to keep this product-flow test deterministic.
    await admin.page.goto(caseHref!);
    await admin.page.waitForURL(`/yonetim/uyusmazliklar/${disputeId}`);
    await expect(admin.page.getByRole('main').locator('header').getByText(description,{exact:true})).toBeVisible();

    await adminTransition(admin.page,'triage','Dosya kapsamı ve taraf kimlikleri doğrulandı.');
    await expect(admin.page.getByText('Ön değerlendirme',{exact:true}).first()).toBeVisible({timeout:20_000});
    await adminTransition(admin.page,'investigation','Taraf beyanları ve iş kapsamı incelemeye alındı.');
    await expect(admin.page.getByText('İnceleme',{exact:true}).first()).toBeVisible({timeout:20_000});
    await adminTransition(admin.page,'resolution_proposed','Kapsam ve olay kaydı karşılaştırılarak çözüm oluşturuldu.',customerDecision,professionalDecision);
    await expect(admin.page.getByText('Çözüm önerildi',{exact:true}).first()).toBeVisible({timeout:20_000});
    await adminTransition(admin.page,'notified','Taraflara role özel çözüm açıklamaları güvenli biçimde bildirildi.',customerDecision,professionalDecision);
    await expect(admin.page.getByText('Taraflara bildirildi',{exact:true}).first()).toBeVisible({timeout:20_000});

    // Realtime refresh projects only the explanation intended for each party.
    await customer.page.bringToFront();
    await expect(customer.page.getByText(customerDecision,{exact:true}).last()).toBeVisible({timeout:20_000});
    await expect(customer.page.getByText(professionalDecision,{exact:true})).toHaveCount(0);
    await professional.page.bringToFront();
    await expect(professional.page.getByText(professionalDecision,{exact:true}).last()).toBeVisible({timeout:20_000});
    await expect(professional.page.getByText(customerDecision,{exact:true})).toHaveCount(0);

    // The database read is final evidence, not fixture preparation for the browser branch.
    const verifier=client();const adminUser=await authenticate(verifier,env('E2E_ADMIN_EMAIL'),env('E2E_ADMIN_PASSWORD'),'Admin doğrulama');
    expect(adminUser).toBeTruthy();
    const [caseRow,decisions,job]=await Promise.all([
      verifier.from('dispute_cases').select('id,status,job_id').eq('id',disputeId!).single(),
      verifier.from('dispute_decisions').select('decision_type,customer_explanation,tradesperson_explanation').eq('dispute_id',disputeId!),
      verifier.from('jobs').select('id,status').eq('id',fixture.jobId).single(),
    ]);
    expect(caseRow.error).toBeNull();expect(caseRow.data?.status).toBe('notified');expect(caseRow.data?.job_id).toBe(fixture.jobId);
    expect(decisions.error).toBeNull();expect(decisions.data?.some(item=>item.decision_type==='notified')).toBe(true);
    // Dispute operations append an auditable case and job event; they do not
    // implicitly mutate the independent job lifecycle.
    expect(job.error).toBeNull();expect(job.data?.status).toBe('scheduled');
    await verifier.auth.signOut({scope:'local'});
  }finally{
    await Promise.all([customer.context.close(),professional.context.close(),admin.context.close()]);
  }
});
