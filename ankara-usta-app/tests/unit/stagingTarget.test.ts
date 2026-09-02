import {describe,it,expect} from 'vitest';
import {assertStagingTarget} from '../../scripts/staging-target.mjs';
const ref='abcdefghijklmnopqrst';
const valid={E2E_STAGING_PROJECT_REF:ref,E2E_SUPABASE_URL:`https://${ref}.supabase.co`,E2E_ALLOW_STAGING_WRITES:'true'};
describe('staging write isolation',()=>{
  it('accepts an explicitly named separate project',()=>expect(()=>assertStagingTarget(valid)).not.toThrow());
  it('rejects production even with write permission',()=>expect(()=>assertStagingTarget({...valid,E2E_STAGING_PROJECT_REF:'qzrktfyouloqxjbkhjce',E2E_SUPABASE_URL:'https://qzrktfyouloqxjbkhjce.supabase.co'})).toThrow());
  it('rejects a URL for a different project',()=>expect(()=>assertStagingTarget({...valid,E2E_SUPABASE_URL:'https://qzrktfyouloqxjbkhjce.supabase.co'})).toThrow());
  it('rejects missing allowlist',()=>expect(()=>assertStagingTarget({...valid,E2E_STAGING_PROJECT_REF:undefined})).toThrow());
  it('rejects missing write consent',()=>expect(()=>assertStagingTarget({...valid,E2E_ALLOW_STAGING_WRITES:undefined})).toThrow());
  it.each(['http://abcdefghijklmnopqrst.supabase.co','https://abcdefghijklmnopqrst.supabase.co.evil.example','https://user:password@abcdefghijklmnopqrst.supabase.co','https://abcdefghijklmnopqrst.supabase.co/other'])('rejects unsafe endpoint %s',(url)=>expect(()=>assertStagingTarget({...valid,E2E_SUPABASE_URL:url})).toThrow());
});
