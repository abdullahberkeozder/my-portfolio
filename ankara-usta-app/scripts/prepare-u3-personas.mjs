import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {createClient} from '@supabase/supabase-js';

const file=new URL('../.env.e2e.local',import.meta.url);
const env=parseEnv(readFileSync(file,'utf8'));
const ref='hyuijuafuayzultbjvjb';
if(env.E2E_STAGING_PROJECT_REF!==ref||env.E2E_SUPABASE_URL!==`https://${ref}.supabase.co`) throw new Error('Wrong staging target.');
if(!process.argv.includes('--apply')) throw new Error('Explicit --apply required. Only dedicated U3 test accounts are changed.');
const ignored=spawnSync('git',['check-ignore','.env.e2e.local'],{encoding:'utf8'});
if(ignored.status!==0) throw new Error('Credential file must be Git-ignored.');
const result=spawnSync(process.execPath,['node_modules/supabase/dist/supabase.js','projects','api-keys','--project-ref',ref,'--reveal','--output','json'],{encoding:'utf8',windowsHide:true});
if(result.status!==0) throw new Error('Staging key lookup failed.');
const parsed=JSON.parse(result.stdout);
const keys=Array.isArray(parsed)?parsed:parsed.api_keys??parsed.keys;
const secret=keys.find(k=>k.name==='service_role')?.api_key??keys.find(k=>k.type==='secret')?.api_key;
const pub=keys.find(k=>k.type==='publishable')?.api_key??keys.find(k=>k.name==='anon')?.api_key;
if(!secret||!pub) throw new Error('Staging keys unavailable.');
for(const role of ['CUSTOMER','SECOND_CUSTOMER','ADMIN','TRADESPERSON','SECOND_TRADESPERSON']) {
  const email=`u3-${role.toLowerCase().replaceAll('_','-')}@orkestra.example`;
  if(env[`E2E_${role}_EMAIL`]&&env[`E2E_${role}_EMAIL`]!==email) throw new Error('Refusing to replace unrelated credentials.');
  env[`E2E_${role}_EMAIL`]=email;
  env[`E2E_${role}_PASSWORD`] ||= randomBytes(32).toString('base64url')+'aA1!';
}
// Persist generated credentials before provisioning, allowing safe recovery after partial failure.
// Service-role key stays in memory and is never stored in this file.
writeFileSync(file,Object.entries(env).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join('\n')+'\n',{mode:0o600});
const admin=createClient(env.E2E_SUPABASE_URL,secret,{auth:{persistSession:false,autoRefreshToken:false}});
function check(error){if(error) throw new Error(`Fixture operation failed (${error.code??error.status}).`);}
// The shared provisioner also normalizes the primary professional. Create the
// second customer before applying the two U3-specific professional profiles.
const secondCustomerProvision=spawnSync(process.execPath,['scripts/provision-e2e-personas.mjs'],{encoding:'utf8',windowsHide:true,env:{...process.env,...env,
  E2E_ALLOW_STAGING_WRITES:'true',E2E_SUPABASE_KEY:pub,E2E_SUPABASE_SERVICE_ROLE_KEY:secret,
  E2E_CUSTOMER_EMAIL:env.E2E_SECOND_CUSTOMER_EMAIL,E2E_CUSTOMER_PASSWORD:env.E2E_SECOND_CUSTOMER_PASSWORD,
}});
if(secondCustomerProvision.status!==0) throw new Error('Second customer provisioning failed; credentials retained for retry.');
console.log('PASS: SECOND_CUSTOMER test account ready.');
for(const [role,name,service,district,neighborhood] of [
  ['TRADESPERSON','TEST PROFİLİ · Montaj Ustası','tv-duvar-montaji','Çankaya','Ayrancı'],
  ['SECOND_TRADESPERSON','TEST PROFİLİ · Uzun İsimli Tesisat ve Ev Bakım Hizmetleri Ustası','musluk-degisimi','Sincan','Törekent'],
]) {
  const provision=spawnSync(process.execPath,['scripts/provision-e2e-personas.mjs'],{encoding:'utf8',windowsHide:true,env:{...process.env,...env,
    E2E_ALLOW_STAGING_WRITES:'true',E2E_SUPABASE_KEY:pub,E2E_SUPABASE_SERVICE_ROLE_KEY:secret,
    E2E_TRADESPERSON_EMAIL:env[`E2E_${role}_EMAIL`],E2E_TRADESPERSON_PASSWORD:env[`E2E_${role}_PASSWORD`],
  }});
  if(provision.status!==0) throw new Error('Persona provisioning failed; credentials retained for retry.');
  const client=createClient(env.E2E_SUPABASE_URL,pub,{auth:{persistSession:false,autoRefreshToken:false}});
  const login=await client.auth.signInWithPassword({email:env[`E2E_${role}_EMAIL`],password:env[`E2E_${role}_PASSWORD`]});
  check(login.error);
  const id=login.data.user.id;
  check((await admin.from('tradesperson_profiles').update({display_name:name,bio:'Yalnız izole E2E ortamı için örnek profil. Gerçek hizmet sağlayıcı değildir.'}).eq('user_id',id)).error);
  check((await admin.from('tradesperson_services').upsert({tradesperson_id:id,service_id:service},{onConflict:'tradesperson_id,service_id'})).error);
  const area=await admin.from('tradesperson_service_areas').select('id').eq('tradesperson_id',id).eq('district',district).eq('neighborhood',neighborhood).maybeSingle();
  check(area.error);
  if(!area.data) check((await admin.from('tradesperson_service_areas').insert({tradesperson_id:id,district,neighborhood})).error);
  check((await client.auth.signOut({scope:'local'})).error);
  console.log(`PASS: ${role} test profile ready.`);
}
console.log('PASS: dedicated U3 personas prepared. Secrets remain local; production unchanged.');
