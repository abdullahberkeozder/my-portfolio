-- Local reset seed intentionally contains no fabricated users.
-- Auth users must be created through Supabase Auth so foreign keys, identities,
-- role triggers and RLS tests exercise the same path as production.
-- Integration personas are provisioned separately through protected CI secrets.
select 1;
