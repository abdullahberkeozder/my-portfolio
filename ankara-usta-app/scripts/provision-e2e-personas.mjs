import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { assertStagingTarget } from './staging-target.mjs';

assertStagingTarget(process.env);

const required = [
  'E2E_SUPABASE_SERVICE_ROLE_KEY',
  'E2E_CUSTOMER_EMAIL',
  'E2E_CUSTOMER_PASSWORD',
  'E2E_TRADESPERSON_EMAIL',
  'E2E_TRADESPERSON_PASSWORD',
  'E2E_ADMIN_EMAIL',
  'E2E_ADMIN_PASSWORD',
];
const missing = required.filter((name) => !process.env[name]);
assert.deepEqual(missing, [], `Missing provisioning variables: ${missing.join(', ')}`);

const admin = createClient(
  process.env.E2E_SUPABASE_URL,
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function findUser(email) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 100) return null;
  }
  throw new Error('E2E user search exceeded the guarded page limit.');
}

async function ensureUser({ email, password, displayName }) {
  const existing = await findUser(email);
  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error) throw error;
  return data.user;
}

function requireSuccess(error, label) {
  if (error) throw new Error(`${label}: ${error.code ?? 'unknown'} ${error.message}`);
}

const adminUser = await ensureUser({
  email: process.env.E2E_ADMIN_EMAIL,
  password: process.env.E2E_ADMIN_PASSWORD,
  displayName: 'E2E Yönetici',
});
const customerUser = await ensureUser({
  email: process.env.E2E_CUSTOMER_EMAIL,
  password: process.env.E2E_CUSTOMER_PASSWORD,
  displayName: 'E2E Müşteri',
});
const tradespersonUser = await ensureUser({
  email: process.env.E2E_TRADESPERSON_EMAIL,
  password: process.env.E2E_TRADESPERSON_PASSWORD,
  displayName: 'E2E Usta',
});

requireSuccess((await admin.from('user_roles').upsert([
  { user_id: adminUser.id, role: 'admin', granted_by: adminUser.id },
  { user_id: tradespersonUser.id, role: 'tradesperson', granted_by: adminUser.id },
], { onConflict: 'user_id,role' })).error, 'role provisioning failed');

requireSuccess((await admin.from('tradesperson_profiles').upsert({
  user_id: tradespersonUser.id,
  display_name: 'E2E Usta',
  bio: 'İzole doğrulama ortamındaki gerçek çoklu hesap akışları için oluşturulan test ustası.',
  city: 'Ankara',
  application_status: 'approved',
  submitted_at: new Date().toISOString(),
  reviewed_at: new Date().toISOString(),
  reviewed_by: adminUser.id,
  review_note: 'Automated isolated E2E fixture',
}, { onConflict: 'user_id' })).error, 'tradesperson profile provisioning failed');

requireSuccess((await admin.from('tradesperson_services').upsert({
  tradesperson_id: tradespersonUser.id,
  service_id: 'tv-duvar-montaji',
}, { onConflict: 'tradesperson_id,service_id' })).error, 'service provisioning failed');

const { data: existingArea, error: areaReadError } = await admin
  .from('tradesperson_service_areas')
  .select('id')
  .eq('tradesperson_id', tradespersonUser.id)
  .eq('district', 'Çankaya')
  .eq('neighborhood', 'Ayrancı')
  .maybeSingle();
requireSuccess(areaReadError, 'service area lookup failed');
if (!existingArea) {
  requireSuccess((await admin.from('tradesperson_service_areas').insert({
    tradesperson_id: tradespersonUser.id,
    district: 'Çankaya',
    neighborhood: 'Ayrancı',
  })).error, 'service area provisioning failed');
}

requireSuccess((await admin.from('tradesperson_availability').upsert({
  tradesperson_id: tradespersonUser.id,
  available_from: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
  available_to: new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10),
  accepts_urgent: true,
  active: true,
}, { onConflict: 'tradesperson_id' })).error, 'availability provisioning failed');

const { data: existingCertificate, error: certificateReadError } = await admin
  .from('tradesperson_documents')
  .select('id')
  .eq('tradesperson_id', tradespersonUser.id)
  .eq('kind', 'professional_certificate')
  .eq('status', 'verified')
  .maybeSingle();
requireSuccess(certificateReadError, 'certificate lookup failed');
if (!existingCertificate) {
  requireSuccess((await admin.from('tradesperson_documents').insert({
    tradesperson_id: tradespersonUser.id,
    kind: 'professional_certificate',
    status: 'verified',
    storage_path: `${tradespersonUser.id}/e2e-professional-certificate.pdf`,
    original_name: 'e2e-professional-certificate.pdf',
    content_type: 'application/pdf',
    byte_size: 1024,
    expires_at: new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10),
    verified_at: new Date().toISOString(),
    verified_by: adminUser.id,
    review_note: 'Automated isolated E2E fixture',
  })).error, 'certificate provisioning failed');
}

for (const [label, email, password] of [
  ['customer', process.env.E2E_CUSTOMER_EMAIL, process.env.E2E_CUSTOMER_PASSWORD],
  ['tradesperson', process.env.E2E_TRADESPERSON_EMAIL, process.env.E2E_TRADESPERSON_PASSWORD],
  ['admin', process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD],
]) {
  const client = createClient(process.env.E2E_SUPABASE_URL, process.env.E2E_SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  requireSuccess(error, `${label} authentication verification failed`);
  await client.auth.signOut({ scope: 'local' });
}

assert.notEqual(customerUser.id, tradespersonUser.id);
assert.notEqual(customerUser.id, adminUser.id);
assert.notEqual(tradespersonUser.id, adminUser.id);
console.log('PASS: isolated customer, approved tradesperson and admin personas are provisioned and can authenticate.');
