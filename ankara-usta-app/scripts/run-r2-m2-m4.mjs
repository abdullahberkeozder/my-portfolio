import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {assertStagingTarget} from './staging-target.mjs';

const required=['E2E_SUPABASE_URL','E2E_SUPABASE_KEY','E2E_CUSTOMER_EMAIL','E2E_CUSTOMER_PASSWORD','E2E_SECOND_CUSTOMER_EMAIL','E2E_SECOND_CUSTOMER_PASSWORD','E2E_TRADESPERSON_EMAIL','E2E_TRADESPERSON_PASSWORD','E2E_SECOND_TRADESPERSON_EMAIL','E2E_SECOND_TRADESPERSON_PASSWORD'];
const missing=required.filter(name=>!process.env[name]);assert.deepEqual(missing,[],`Missing M2/M4 configuration: ${missing.join(', ')}`);assertStagingTarget(process.env);
const opts={auth:{persistSession:false,autoRefreshToken:false}};const client=()=>createClient(process.env.E2E_SUPABASE_URL,process.env.E2E_SUPABASE_KEY,opts);
const customer=client(),otherCustomer=client(),professional=client(),otherProfessional=client();
async function login(c,email,password,label){const {data,error}=await c.auth.signInWithPassword({email,password});if(error||!data.user)throw new Error(`${label} login failed: ${error?.message??'user missing'}`);return data.user;}
async function rpc(c,name,args){const {data,error}=await c.rpc(name,args);return {data:Array.isArray(data)?data[0]:data,error};}
function value(result,label){if(result.error)throw new Error(`${label}: ${result.error.message}`);return result.data;}
async function openRequest(){const key=randomUUID();const d=value(await rpc(customer,'upsert_request_draft',{p_idempotency_key:key,p_service_id:'tv-duvar-montaji',p_delivery_model:'package',p_answers:{'tv-size':'32–49 inç','wall-type':'Beton / tuğla',bracket:'Evet, hazır'},p_district:'Çankaya',p_neighborhood:'Ayrancı',p_preferred_timing:'this_week'}),'open draft');value(await rpc(customer,'submit_request',{p_request_id:d.id,p_idempotency_key:key}),'open submit');value(await rpc(customer,'match_request',{p_request_id:d.id}),'open matching');return d.id;}
async function quote(requestId){return value(await rpc(professional,'create_quote_version',{p_request_id:requestId,p_labor_amount_kurus:12500,p_material_amount_kurus:2500,p_estimated_duration_minutes:90,p_warranty_days:30,p_included_scope:['R2 M4 fixture'],p_excluded_scope:['Duvar onarımı'],p_note:'R2 M4'}),'quote');}
try{
  const [customerUser,otherCustomerUser,professionalUser,otherProfessionalUser]=await Promise.all([login(customer,process.env.E2E_CUSTOMER_EMAIL,process.env.E2E_CUSTOMER_PASSWORD,'customer'),login(otherCustomer,process.env.E2E_SECOND_CUSTOMER_EMAIL,process.env.E2E_SECOND_CUSTOMER_PASSWORD,'other customer'),login(professional,process.env.E2E_TRADESPERSON_EMAIL,process.env.E2E_TRADESPERSON_PASSWORD,'professional'),login(otherProfessional,process.env.E2E_SECOND_TRADESPERSON_EMAIL,process.env.E2E_SECOND_TRADESPERSON_PASSWORD,'other professional')]);
  assert.notEqual(customerUser.id,otherCustomerUser.id);assert.notEqual(professionalUser.id,otherProfessionalUser.id);

  const directKey=randomUUID();const direct=value(await rpc(customer,'upsert_direct_request_draft',{p_idempotency_key:directKey,p_service_id:'tv-duvar-montaji',p_delivery_model:'package',p_answers:{'tv-size':'32–49 inç','wall-type':'Beton / tuğla',bracket:'Evet, hazır'},p_target_professional_id:professionalUser.id,p_district:'Çankaya',p_neighborhood:'Ayrancı',p_preferred_timing:'this_week'}),'direct draft');
  value(await rpc(customer,'submit_request',{p_request_id:direct.id,p_idempotency_key:directKey}),'direct submit');
  const deniedBeforeResponse=await rpc(otherProfessional,'respond_request_invitation',{p_request_id:direct.id,p_action:'decline',p_reason:'Bu davet bana ait değil.',p_confirm:false});assert.ok(deniedBeforeResponse.error,'Non-target professional must not respond to invitation');
  value(await rpc(professional,'respond_request_invitation',{p_request_id:direct.id,p_action:'decline',p_reason:'Bu tarihte müsait değilim.',p_confirm:false}),'target decline');
  const broadened=value(await rpc(customer,'respond_request_invitation',{p_request_id:direct.id,p_action:'broaden',p_reason:null,p_confirm:true}),'owner broaden');
  assert.equal(broadened.status,'broadened');assert.ok(broadened.successor_request_id);console.log('PASS: M2 direct invitation denial, target decline and explicit broaden.');

  const conversationRequest=await openRequest();
  const key=randomUUID();const sent=value(await rpc(customer,'request_conversation',{p_request_id:conversationRequest,p_professional_id:professionalUser.id,p_action:'send',p_body:'Kapsamı teyit edebilir misiniz?',p_key:key,p_after:0}),'conversation send');
  const conversationRetry=value(await rpc(customer,'request_conversation',{p_request_id:conversationRequest,p_professional_id:professionalUser.id,p_action:'send',p_body:'Kapsamı teyit edebilir misiniz?',p_key:key,p_after:0}),'conversation retry');assert.equal(conversationRetry.acknowledgedId,sent.acknowledgedId);
  const forbidden=await rpc(otherCustomer,'request_conversation',{p_request_id:conversationRequest,p_professional_id:professionalUser.id,p_action:'fetch',p_body:null,p_key:null,p_after:0});assert.ok(forbidden.error,'Unrelated customer must not read conversation');console.log('PASS: M3 participant-only conversation and idempotent retry.');

  const revisionRequest=await openRequest();const base=await quote(revisionRequest);const feedback=value(await rpc(customer,'request_quote_revision',{p_quote_id:base.id,p_fields:['price','scope'],p_reason:'Malzeme ve işçilik kalemlerini yeniden değerlendirebilir misiniz?'}),'revision request');assert.equal(feedback.quote_id,base.id);
  const unauthorized=await rpc(otherCustomer,'request_quote_revision',{p_quote_id:base.id,p_fields:['price'],p_reason:'Bu talep bana ait değildir, test.'});assert.ok(unauthorized.error,'Unrelated customer must not request revision');
  const revisionArgs={p_base_quote_id:base.id,p_labor_amount_kurus:14000,p_material_amount_kurus:3000,p_estimated_duration_minutes:120,p_warranty_days:30,p_included_scope:['R2 M4 revised'],p_excluded_scope:['Duvar onarımı'],p_note:'R2 revision v2'};
  const revisionCandidates=[revisionArgs,{...revisionArgs,p_labor_amount_kurus:15000,p_note:'R2 competing revision'}];
  const race=await Promise.all(revisionCandidates.map(args=>rpc(professional,'revise_quote_version',args)));
  assert.equal(race.filter(result=>!result.error).length,1,'Exactly one concurrent revision from the same base must win');
  const winnerIndex=race.findIndex(result=>!result.error);
  const winner=value(race[winnerIndex],'revision winner');
  const retry=value(await rpc(professional,'revise_quote_version',revisionCandidates[winnerIndex]),'revision retry');
  assert.equal(retry.id,winner.id,'Retrying the winning payload must return the same quote version');
  assert.equal(retry.supersedes_quote_id,base.id);console.log('PASS: M4 feedback, unauthorized denial, stale-base race and idempotent retry.');
}finally{await Promise.all([customer,otherCustomer,professional,otherProfessional].map(c=>c.auth.signOut({scope:'local'})));}
