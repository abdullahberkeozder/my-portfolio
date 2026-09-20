import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {assertStagingTarget} from './staging-target.mjs';

const required=[
  'E2E_STAGING_PROJECT_REF','E2E_SUPABASE_URL','E2E_SUPABASE_KEY','E2E_SUPABASE_SERVICE_ROLE_KEY',
  'E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD','E2E_TRADESPERSON_EMAIL','E2E_TRADESPERSON_PASSWORD',
  'E2E_SECOND_TRADESPERSON_EMAIL','E2E_SECOND_TRADESPERSON_PASSWORD',
];
const missing=required.filter(name=>!process.env[name]);
assert.deepEqual(missing,[],`Missing concurrency configuration: ${missing.join(', ')}`);
assertStagingTarget(process.env);

const options={auth:{persistSession:false,autoRefreshToken:false}};
const makePublic=()=>createClient(process.env.E2E_SUPABASE_URL,process.env.E2E_SUPABASE_KEY,options);
const admin=createClient(process.env.E2E_SUPABASE_URL,process.env.E2E_SUPABASE_SERVICE_ROLE_KEY,options);
const customerA=makePublic(),customerB=makePublic(),professionalA=makePublic(),professionalB=makePublic();

async function authenticate(client,email,password,label){
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error||!data.user) throw new Error(`${label} authentication failed: ${error?.message??'user missing'}`);
  return data.user;
}

async function rpc(client,name,args){
  const {data,error}=await client.rpc(name,args);
  return {data:Array.isArray(data)?data[0]:data,error};
}

function requireRpc(result,label){
  if(result.error){
    const detail=[result.error.message,result.error.details,result.error.hint].filter(Boolean).join(' | ');
    throw new Error(`${label} failed (${result.error.code??'unknown'}): ${detail}`);
  }
  return result.data;
}

async function createOpenRequest(customer){
  const key=randomUUID();
  const draft=requireRpc(await rpc(customer,'upsert_request_draft',{
    p_idempotency_key:key,p_service_id:'tv-duvar-montaji',p_delivery_model:'package',
    p_answers:{'tv-size':'32–49 inç','wall-type':'Beton / tuğla',bracket:'Evet, hazır'},
    p_district:'Çankaya',p_neighborhood:'Ayrancı',p_preferred_timing:'this_week',
  }),'Open request draft');
  requireRpc(await rpc(customer,'submit_request',{p_request_id:draft.id,p_idempotency_key:key}),'Open request submission');
  requireRpc(await rpc(customer,'match_request',{p_request_id:draft.id}),'Open request matching');
  return draft.id;
}

try{
  const [customerUserA,customerUserB,professionalUserA,professionalUserB]=await Promise.all([
    authenticate(customerA,process.env.E2E_CUSTOMER_EMAIL,process.env.E2E_CUSTOMER_PASSWORD,'Customer session A'),
    authenticate(customerB,process.env.E2E_CUSTOMER_EMAIL,process.env.E2E_CUSTOMER_PASSWORD,'Customer session B'),
    authenticate(professionalA,process.env.E2E_TRADESPERSON_EMAIL,process.env.E2E_TRADESPERSON_PASSWORD,'Professional A'),
    authenticate(professionalB,process.env.E2E_SECOND_TRADESPERSON_EMAIL,process.env.E2E_SECOND_TRADESPERSON_PASSWORD,'Professional B'),
  ]);
  assert.equal(customerUserA.id,customerUserB.id,'Concurrent customer sessions must represent the same owner');
  assert.notEqual(professionalUserA.id,professionalUserB.id,'Acceptance race requires two professionals');

  const draftKey=randomUUID();
  const draftArgs={
    p_idempotency_key:draftKey,p_service_id:'tv-duvar-montaji',p_delivery_model:'package',
    p_answers:{'tv-size':'32–49 inç','wall-type':'Beton / tuğla',bracket:'Evet, hazır'},
    p_district:null,p_neighborhood:'R2-CONCURRENCY',p_preferred_timing:null,
  };
  const draftResults=await Promise.all([rpc(customerA,'upsert_request_draft',draftArgs),rpc(customerB,'upsert_request_draft',draftArgs)]);
  assert.equal(draftResults.filter(result=>!result.error).length,2,'Both idempotent draft upserts must succeed');
  const draftIds=draftResults.map(result=>result.data?.id);
  assert.ok(draftIds[0]);
  assert.equal(draftIds[0],draftIds[1],'Concurrent idempotent drafts must resolve to one request');
  const draftInvariant=await admin.from('service_requests').select('id',{count:'exact',head:true})
    .eq('customer_id',customerUserA.id).eq('idempotency_key',draftKey);
  assert.equal(draftInvariant.error,null);
  assert.equal(draftInvariant.count,1,'Exactly one draft row must exist');
  console.log('PASS: concurrent idempotent draft upserts resolved to exactly one request.');

  const requestId=await createOpenRequest(customerA);
  const matchCheck=await admin.from('request_matches').select('tradesperson_id').eq('request_id',requestId)
    .in('tradesperson_id',[professionalUserA.id,professionalUserB.id]);
  assert.equal(matchCheck.error,null);
  assert.deepEqual(new Set(matchCheck.data.map(row=>row.tradesperson_id)),new Set([professionalUserA.id,professionalUserB.id]),
    'Both approved professionals must be matched before the acceptance race');

  const quoteArgs={p_request_id:requestId,p_labor_amount_kurus:12500,p_material_amount_kurus:2500,
    p_estimated_duration_minutes:90,p_warranty_days:30,p_included_scope:['R2 concurrency fixture'],
    p_excluded_scope:['Duvar yüzey onarımı'],p_note:'R2 isolated concurrency gate'};
  const [quoteA,quoteB]=await Promise.all([
    rpc(professionalA,'create_quote_version',quoteArgs),rpc(professionalB,'create_quote_version',quoteArgs),
  ]).then(results=>results.map((result,index)=>requireRpc(result,`Professional ${index?'B':'A'} quote`)));

  const acceptanceResults=await Promise.all([
    rpc(customerA,'accept_quote',{p_quote_id:quoteA.id}),rpc(customerB,'accept_quote',{p_quote_id:quoteB.id}),
  ]);
  assert.equal(acceptanceResults.filter(result=>!result.error).length,1,'Exactly one competing acceptance must succeed');
  const [acceptedQuotes,jobs,request]=await Promise.all([
    admin.from('quotes').select('id').eq('request_id',requestId).eq('status','accepted'),
    admin.from('jobs').select('id').eq('request_id',requestId),
    admin.from('service_requests').select('status').eq('id',requestId).single(),
  ]);
  assert.equal(acceptedQuotes.error,null);assert.equal(jobs.error,null);assert.equal(request.error,null);
  assert.equal(acceptedQuotes.data.length,1,'Acceptance race must leave one accepted quote');
  assert.equal(jobs.data.length,1,'Acceptance race must create one job');
  assert.equal(request.data.status,'provider_selected','Acceptance race must close the request');
  console.log('PASS: competing quote acceptance produced one accepted quote and one job.');
}finally{await Promise.all([customerA,customerB,professionalA,professionalB].map(client=>client.auth.signOut({scope:'local'})));}
