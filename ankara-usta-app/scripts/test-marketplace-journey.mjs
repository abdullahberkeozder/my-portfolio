// Real, non-mocked Musluk Değişimi RPC integration test.
// Run only through run-p1-musluk-remote.mjs against the isolated staging project.
import {createClient} from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {assertStagingTarget} from './staging-target.mjs';

const required=['E2E_SUPABASE_URL','E2E_SUPABASE_KEY','E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD','E2E_GOLDEN_TRADESPERSON_EMAIL','E2E_GOLDEN_TRADESPERSON_PASSWORD'];
const missing=required.filter(key=>!process.env[key]);
if(missing.length) throw new Error(`Missing integration configuration: ${missing.join(', ')}`);
assertStagingTarget(process.env);
const makeClient=()=>createClient(process.env.E2E_SUPABASE_URL,process.env.E2E_SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const customer=makeClient(), provider=makeClient();
const runId='9f6d21c4-3a67-4d2e-8b51-210920260001';
async function rpc(client,name,args){
  const {data,error}=await client.rpc(name,args);
  if(error) {
    const context=[error.message,error.details,error.hint].filter(Boolean).join(' | ');
    throw new Error(`${name} failed (${error.code ?? 'unknown'}): ${context}`);
  }
  return Array.isArray(data)?data[0]:data;
}
try {
  for(const [client,emailName,passwordName] of [[customer,'E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD'],[provider,'E2E_GOLDEN_TRADESPERSON_EMAIL','E2E_GOLDEN_TRADESPERSON_PASSWORD']]) {
    const {error}=await client.auth.signInWithPassword({email:process.env[emailName],password:process.env[passwordName]});
    assert.equal(error,null,`Authentication failed for ${emailName}`);
  }
  const customerId=(await customer.auth.getUser()).data.user.id;
  const providerId=(await provider.auth.getUser()).data.user.id;
  assert.notEqual(customerId,providerId,'Use two distinct test accounts');
  const draft=await rpc(customer,'upsert_request_draft',{
    p_idempotency_key:runId,p_service_id:'musluk-degisimi',p_delivery_model:'package',
    p_answers:{'faucet-type':'Mutfak bataryası','part-available':'Evet, yeni bataryayı aldım','shutoff-valve':'Evet, su kesilebiliyor'},
    p_district:'Sincan',p_neighborhood:'Törekent',p_preferred_timing:'this_week',
  });
  console.log(`Run ${runId}: draft ${draft.id}`);
  const persisted=await customer.from('service_requests').select('id,preferred_timing').eq('id',draft.id).single();
  assert.equal(persisted.error,null);assert.equal(persisted.data.preferred_timing,'this_week');
  await rpc(customer,'submit_request',{p_request_id:draft.id,p_idempotency_key:runId});
  await rpc(customer,'match_request',{p_request_id:draft.id});
  const matched=await provider.from('request_matches').select('request_id,tradesperson_id').eq('request_id',draft.id).eq('tradesperson_id',providerId).single();
  assert.equal(matched.error,null,'Golden professional must be matched for the faucet request');
  const providerScope=await provider.from('service_requests').select('service_id,answers,district,neighborhood,preferred_timing').eq('id',draft.id).single();
  assert.equal(providerScope.error,null);assert.equal(providerScope.data.service_id,'musluk-degisimi');
  assert.deepEqual(providerScope.data.answers,{'faucet-type':'Mutfak bataryası','part-available':'Evet, yeni bataryayı aldım','shutoff-valve':'Evet, su kesilebiliyor'});
  assert.equal(providerScope.data.district,'Sincan');assert.equal(providerScope.data.neighborhood,'Törekent');
  const quote=await rpc(provider,'create_quote_version',{
    p_request_id:draft.id,p_labor_amount_kurus:145000,p_material_amount_kurus:0,
    p_estimated_duration_minutes:60,p_warranty_days:30,
    p_included_scope:['Eski bataryanın sökülmesi','Yeni mutfak bataryasının montajı','Bağlantı ve sızdırmazlık kontrolü'],p_excluded_scope:['Yeni batarya bedeli','Tesisat hattı onarımı'],p_note:`P1 MUSLUK GOLDEN ${runId}`,
  });
  await rpc(customer,'accept_quote',{p_quote_id:quote.id});
  const jobResult=await customer.from('jobs').select('id,status').eq('request_id',draft.id).single();
  assert.equal(jobResult.error,null);const job=jobResult.data;
  assert.equal(job.status,'scheduled');
  const message=`P1 Musluk kapsam teyidi ${runId}`;
  await rpc(customer,'send_job_message',{p_job_id:job.id,p_body:message,p_idempotency_key:randomUUID()});
  const received=await provider.from('job_messages').select('body').eq('job_id',job.id).eq('body',message).single();
  assert.equal(received.error,null);assert.equal(received.data.body,message);
  const premature=await customer.rpc('create_job_review',{p_job_id:job.id,p_rating:5,p_comment:'Premature test review'});
  assert.ok(premature.error,'Review before completion must be denied');
  await rpc(provider,'transition_job',{p_job_id:job.id,p_status:'in_progress'});
  await rpc(provider,'transition_job',{p_job_id:job.id,p_status:'awaiting_customer_approval'});
  await rpc(customer,'transition_job',{p_job_id:job.id,p_status:'completed'});
  const review=await rpc(customer,'create_job_review',{p_job_id:job.id,p_rating:5,p_comment:`Controlled staging review ${runId}`});
  assert.ok(review.id);
  const [completed,certificate,events]=await Promise.all([
    provider.from('jobs').select('status,accepted_quote_id').eq('id',job.id).single(),
    customer.from('workmanship_certificates').select('scope_snapshot').eq('job_id',job.id).single(),
    customer.from('job_events').select('sequence,event_type').eq('job_id',job.id).order('sequence'),
  ]);
  assert.equal(completed.error,null);assert.equal(completed.data.status,'completed');assert.equal(completed.data.accepted_quote_id,quote.id);
  assert.equal(certificate.error,null);assert.equal(certificate.data.scope_snapshot.quote_id,quote.id);
  assert.equal(events.error,null);assert.ok(events.data.some(event=>event.event_type==='review_created'));
  assert.deepEqual(events.data.map(event=>event.sequence),events.data.map((_,index)=>index+1),'Job event sequence must be contiguous');
  console.log(`PASS: Musluk Değişimi draft -> submit -> match -> quote -> accept -> message -> complete -> review. Job ${job.id}`);
} finally {
  await Promise.all([customer.auth.signOut({scope:'local'}),provider.auth.signOut({scope:'local'})]);
}
