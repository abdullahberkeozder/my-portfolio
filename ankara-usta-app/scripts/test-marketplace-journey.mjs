// Real, non-mocked RPC integration test. Run ONLY against a disposable staging project.
// Completed jobs/audit events are intentionally retained: reset the staging database after testing.
import {createClient} from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {assertStagingTarget} from './staging-target.mjs';

const required=['E2E_SUPABASE_URL','E2E_SUPABASE_KEY','E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD','E2E_TRADESPERSON_EMAIL','E2E_TRADESPERSON_PASSWORD'];
const missing=required.filter(key=>!process.env[key]);
if(missing.length) throw new Error(`Missing integration configuration: ${missing.join(', ')}`);
assertStagingTarget(process.env);
const makeClient=()=>createClient(process.env.E2E_SUPABASE_URL,process.env.E2E_SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const customer=makeClient(), provider=makeClient();
const runId=randomUUID();
async function rpc(client,name,args){
  const {data,error}=await client.rpc(name,args);
  if(error) throw new Error(`${name} failed (${error.code ?? 'unknown'})`);
  return Array.isArray(data)?data[0]:data;
}
try {
  for(const [client,prefix] of [[customer,'E2E_CUSTOMER'],[provider,'E2E_TRADESPERSON']]) {
    const {error}=await client.auth.signInWithPassword({email:process.env[`${prefix}_EMAIL`],password:process.env[`${prefix}_PASSWORD`]});
    assert.equal(error,null,`Authentication failed for ${prefix}`);
  }
  const customerId=(await customer.auth.getUser()).data.user.id;
  const providerId=(await provider.auth.getUser()).data.user.id;
  assert.notEqual(customerId,providerId,'Use two distinct test accounts');
  const draft=await rpc(customer,'upsert_request_draft',{
    p_idempotency_key:runId,p_service_id:'tv-duvar-montaji',p_delivery_model:'package',
    p_answers:{'tv-size':'32–49 inç','wall-type':'Beton / tuğla',bracket:'Evet, hazır'},
    p_district:'Çankaya',p_neighborhood:'Ayrancı',p_preferred_timing:'this_week',
  });
  console.log(`Run ${runId}: draft ${draft.id}`);
  const persisted=await customer.from('service_requests').select('id,preferred_timing').eq('id',draft.id).single();
  assert.equal(persisted.error,null);assert.equal(persisted.data.preferred_timing,'this_week');
  await rpc(customer,'submit_request',{p_request_id:draft.id,p_idempotency_key:runId});
  await rpc(customer,'match_request',{p_request_id:draft.id});
  const quote=await rpc(provider,'create_quote_version',{
    p_request_id:draft.id,p_labor_amount_kurus:10000,p_material_amount_kurus:0,
    p_estimated_duration_minutes:60,p_warranty_days:30,
    p_included_scope:['Test TV montajı'],p_excluded_scope:['Duvar onarımı'],p_note:`E2E ${runId}`,
  });
  await rpc(customer,'accept_quote',{p_quote_id:quote.id});
  const jobResult=await customer.from('jobs').select('id,status').eq('request_id',draft.id).single();
  assert.equal(jobResult.error,null);const job=jobResult.data;
  assert.equal(job.status,'scheduled');
  const message=`E2E message ${runId}`;
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
  const completed=await provider.from('jobs').select('status').eq('id',job.id).single();
  assert.equal(completed.error,null);assert.equal(completed.data.status,'completed');
  console.log(`PASS: draft -> submit -> quote -> accept -> message -> complete -> review. Job ${job.id}`);
} finally {
  await Promise.all([customer.auth.signOut({scope:'local'}),provider.auth.signOut({scope:'local'})]);
}
