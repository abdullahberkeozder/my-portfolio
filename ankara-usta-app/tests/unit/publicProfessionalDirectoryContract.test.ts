import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect,test} from 'vitest';

const sql=readFileSync(resolve('supabase/migrations/20260922161628_public_verified_professional_directory.sql'),'utf8');
const remoteFixture=readFileSync(resolve('supabase/tests/remote/public_verified_professional_directory.sql'),'utf8');

test('public directory is backed by the narrow current-verification projection',()=>{
  expect(sql).toContain('private.public_professional_verification(profile.user_id)');
  expect(sql).toContain('security definer');
  expect(sql).toContain("set search_path = ''");
  expect(sql).toContain('grant execute on function public.list_public_verified_professionals');
  expect(sql).not.toMatch(/select\s+[\s\S]*tradesperson_documents\./i);
});

test('public directory bounds pagination and applies service and district filters',()=>{
  expect(sql).toContain('least(greatest(coalesce(p_limit, 12), 1), 50)');
  expect(sql).toContain('service.service_id = p_service_id');
  expect(sql).toContain('area.district = p_district');
  expect(sql).toContain('count(*) over () as total_count');
});

test('remote fixture covers current, expired and missing verification without persisting data',()=>{
  expect(remoteFixture).toContain('Current verified professional is missing');
  expect(remoteFixture).toContain('Expired professional leaked');
  expect(remoteFixture).toContain('without current evidence leaked');
  expect(remoteFixture).toContain('rollback;');
});
