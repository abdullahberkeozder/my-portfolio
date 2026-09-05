/** Deterministic multi-session tests using the product's authenticated RPCs. */
import {expect,test,type Browser,type BrowserContext,type Page} from '@playwright/test';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';

const requiredVariables=['E2E_SUPABASE_URL','E2E_SUPABASE_KEY','E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD','E2E_TRADESPERSON_EMAIL','E2E_TRADESPERSON_PASSWORD'] as const;
const missingVariables=requiredVariables.filter(name=>!process.env[name]);
const requiredMode=process.env.REQUIRE_AUTH_E2E==='true';
const hasIntegrationConfiguration=missingVariables.length===0;
type Fixture={quoteRequestId:string;jobId:string};

function env(name:typeof requiredVariables[number]){const value=process.env[name];if(!value)throw new Error(`Eksik E2E yapılandırması: ${name}`);return value;}
function client(){return createClient(env('E2E_SUPABASE_URL'),env('E2E_SUPABASE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});}
async function authenticate(supabase:SupabaseClient,email:string,password:string,label:string){const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error||!data.user)throw new Error(`${label} test hesabı doğrulanamadı: ${error?.message??'kullanıcı yok'}`);return data.user;}
async function rpc<T>(supabase:SupabaseClient,name:string,args:Record<string,unknown>):Promise<T>{const {data,error}=await supabase.rpc(name,args);if(error){const detail=[error.message,error.details,error.hint].filter(Boolean).join(' | ');throw new Error(`${name} fixture adımı başarısız (${error.code??'unknown'}): ${detail}`);}return (Array.isArray(data)?data[0]:data) as T;}

async function createOpenRequest(customer:SupabaseClient){
  const key=randomUUID();
  const draft=await rpc<{id:string}>(customer,'upsert_request_draft',{p_idempotency_key:key,p_service_id:'tv-duvar-montaji',p_delivery_model:'package',p_answers:{'tv-size':'32–49 inç','wall-type':'Beton / tuğla',bracket:'Evet, hazır'},p_district:'Çankaya',p_neighborhood:'Ayrancı',p_preferred_timing:'this_week'});
  await rpc(customer,'submit_request',{p_request_id:draft.id,p_idempotency_key:key});
  await rpc(customer,'match_request',{p_request_id:draft.id});
  return draft.id;
}

async function createFixture():Promise<Fixture>{
  const customer=client(),tradesperson=client();
  try{
    const customerUser=await authenticate(customer,env('E2E_CUSTOMER_EMAIL'),env('E2E_CUSTOMER_PASSWORD'),'Müşteri');
    const tradespersonUser=await authenticate(tradesperson,env('E2E_TRADESPERSON_EMAIL'),env('E2E_TRADESPERSON_PASSWORD'),'Usta');
    if(customerUser.id===tradespersonUser.id)throw new Error('Müşteri ve usta farklı test hesapları olmalı.');
    const runId=randomUUID();
    const quoteRequestId=await createOpenRequest(customer);
    const jobRequestId=await createOpenRequest(customer);
    const quote=await rpc<{id:string}>(tradesperson,'create_quote_version',{p_request_id:jobRequestId,p_labor_amount_kurus:12500,p_material_amount_kurus:2500,p_estimated_duration_minutes:90,p_warranty_days:30,p_included_scope:['Deterministik E2E montajı'],p_excluded_scope:['Duvar yüzey onarımı'],p_note:`E2E aktif iş ${runId}`});
    await rpc(customer,'accept_quote',{p_quote_id:quote.id});
    const {data:job,error}=await customer.from('jobs').select('id,status').eq('request_id',jobRequestId).single();
    if(error||!job||job.status!=='scheduled')throw new Error(`Aktif iş fixture'ı oluşmadı: ${error?.message??job?.status??'kayıt yok'}`);
    return {quoteRequestId,jobId:job.id};
  }finally{await Promise.all([customer.auth.signOut({scope:'local'}),tradesperson.auth.signOut({scope:'local'})]);}
}

async function signInContext(browser:Browser,email:string,password:string):Promise<{context:BrowserContext;page:Page}>{const context=await browser.newContext();const page=await context.newPage();await page.goto('/giris');await page.getByLabel('E-posta Adresi').fill(email);await page.getByLabel('Parola',{exact:true}).fill(password);await page.getByRole('button',{name:'Giriş Yap →'}).click();await page.waitForURL(/\/(taleplerim|usta\/talepler|yonetim)/,{timeout:15000});return {context,page};}
async function openParticipants(browser:Browser){const customer=await signInContext(browser,env('E2E_CUSTOMER_EMAIL'),env('E2E_CUSTOMER_PASSWORD'));const tradesperson=await signInContext(browser,env('E2E_TRADESPERSON_EMAIL'),env('E2E_TRADESPERSON_PASSWORD'));return {customer,tradesperson};}
async function closeParticipants(...contexts:BrowserContext[]){await Promise.all(contexts.map(context=>context.close()));}
async function expectRealtimeLive(page:Page){await expect(page.locator('.realtime-indicator.is-live')).toBeVisible({timeout:15000});}

test.describe('gerçek çoklu oturum Realtime akışları',()=>{
  test.describe.configure({timeout:60000});
  let fixture:Fixture;
  test.beforeAll(async()=>{if(!hasIntegrationConfiguration){if(requiredMode)throw new Error(`Zorunlu çoklu hesap E2E yapılandırması eksik: ${missingVariables.join(', ')}`);return;}fixture=await createFixture();});
  test.beforeEach(()=>{test.skip(!hasIntegrationConfiguration&&!requiredMode,`İsteğe bağlı yerel çalıştırmada çoklu hesap ayarları yok: ${missingVariables.join(', ')}`);});

  test('usta teklif gönderdiğinde müşteri sayfası yenilemeden güncellenir',async({browser})=>{
    const {customer,tradesperson}=await openParticipants(browser);const marker=`Canlı teklif ${randomUUID()}`;
    try{
      await Promise.all([customer.page.goto(`/taleplerim/${fixture.quoteRequestId}/teklifler`),tradesperson.page.goto(`/usta/teklifler/${fixture.quoteRequestId}`)]);
      await expect(customer.page.getByText('Henüz teklif yok')).toBeVisible();
      await Promise.all([expectRealtimeLive(customer.page),expectRealtimeLive(tradesperson.page)]);
      await tradesperson.page.getByLabel('İşçilik Ücreti (TL)').fill('575');await tradesperson.page.getByLabel('Malzeme Ücreti (TL)').fill('125');await tradesperson.page.getByLabel('Müşteriye Not').fill(marker);
      await tradesperson.page.getByRole('button',{name:'Yeni Teklif Sürümünü Gönder →'}).click();
      await expect(tradesperson.page.getByRole('status').filter({hasText:'Teklifin 1. sürümü gönderildi.'})).toBeVisible();
      // Returning to the customer's session exercises the product's focus
      // catch-up path as well as the live postgres_changes subscription.
      await customer.page.bringToFront();
      await expect(customer.page.getByText(marker)).toBeVisible({timeout:15000});
    }finally{await closeParticipants(customer.context,tradesperson.context);}
  });

  test('iki tarafın eşzamanlı mesajları iki oturumda da tekil ve eksiksiz görünür',async({browser})=>{
    const {customer,tradesperson}=await openParticipants(browser);const customerMessage=`Müşteri eşzamanlı mesaj ${randomUUID()}`;const tradespersonMessage=`Usta eşzamanlı mesaj ${randomUUID()}`;
    try{
      await Promise.all([customer.page.goto(`/islerim/${fixture.jobId}`),tradesperson.page.goto(`/islerim/${fixture.jobId}`)]);
      await Promise.all([expectRealtimeLive(customer.page),expectRealtimeLive(tradesperson.page)]);
      await customer.page.getByLabel('Mesajınızı buraya yazın...').fill(customerMessage);await tradesperson.page.getByLabel('Mesajınızı buraya yazın...').fill(tradespersonMessage);
      await Promise.all([customer.page.getByRole('button',{name:'Gönder →'}).click(),tradesperson.page.getByRole('button',{name:'Gönder →'}).click()]);
      for(const page of [customer.page,tradesperson.page]){await expect(page.getByText(customerMessage)).toHaveCount(1,{timeout:15000});await expect(page.getByText(tradespersonMessage)).toHaveCount(1,{timeout:15000});}
    }finally{await closeParticipants(customer.context,tradesperson.context);}
  });

  test('usta kapsam değişikliği gönderdiğinde müşteri oturumunda anında görünür',async({browser})=>{
    const {customer,tradesperson}=await openParticipants(browser);const description=`E2E kapsam değişikliği ${randomUUID()}`;
    try{
      await Promise.all([customer.page.goto(`/islerim/${fixture.jobId}`),tradesperson.page.goto(`/islerim/${fixture.jobId}`)]);
      await Promise.all([expectRealtimeLive(customer.page),expectRealtimeLive(tradesperson.page)]);
      await Promise.all([customer.page.getByRole('tab',{name:'Kapsam'}).click(),tradesperson.page.getByRole('tab',{name:'Kapsam'}).click()]);
      await tradesperson.page.getByLabel('Ek işin veya değişikliğin açık tanımı').fill(description);await tradesperson.page.getByLabel('İşçilik farkı (TL)').fill('175');await tradesperson.page.getByLabel('Malzeme farkı (TL)').fill('50');await tradesperson.page.getByLabel('Süre farkı (dk)').fill('30');
      await tradesperson.page.getByRole('button',{name:'Değişikliği Onaya Gönder →'}).click();
      await expect(tradesperson.page.getByRole('status').filter({hasText:'İşlem kaydedildi.'})).toBeVisible();
      await customer.page.bringToFront();
      await expect(customer.page.getByText(description)).toBeVisible({timeout:15000});
    }finally{await closeParticipants(customer.context,tradesperson.context);}
  });
});

test('analitik olayları properties alanında PII taşımaz',async({page})=>{
  const piiKeys=['email','phone','address_line','body','password','token'];
  await page.addInitScript(()=>{window.addEventListener('orkestra:analytics',event=>{const state=window as unknown as {__analyticsEvents?:unknown[]};state.__analyticsEvents??=[];state.__analyticsEvents.push((event as CustomEvent).detail);});});
  await page.goto('/');await page.evaluate(()=>localStorage.setItem('ankara_analytics_consent','accepted'));await page.getByRole('textbox',{name:'İhtiyacınızı yazın'}).fill('elektrik arızası');await page.getByRole('button',{name:'Hizmet bul'}).click();
  const events=await page.evaluate(()=>(window as unknown as {__analyticsEvents?:Array<{eventName:string;properties:Record<string,unknown>}>}).__analyticsEvents??[]);
  for(const event of events)for(const piiKey of piiKeys)expect(Object.keys(event.properties??{}),`Olay ${event.eventName} PII alanı ${piiKey} taşımamalı`).not.toContain(piiKey);
});
