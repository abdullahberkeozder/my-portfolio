# Deployment notes

## Recommended hosting

Vercel or Netlify is enough for this Vite + React app. The app is static on the
frontend and talks to Supabase directly through the publishable key.

## Build settings

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20 LTS or newer

## Environment variables

Add these variables in the hosting provider dashboard:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Do not add the Supabase secret key to Vercel, Netlify, or any frontend `.env`
file. The browser must only use the publishable key.

## Supabase settings

In Supabase Dashboard:

1. Go to Authentication -> URL Configuration.
2. Set Site URL to your production domain.
3. Add redirect URLs for local and production:
   - `http://localhost:5173`
   - `https://your-production-domain.com`

## Admin flow

1. Run `supabase/welding_appointments_schema.sql` in SQL Editor.
2. Open `/signup` and create an admin account.
3. Approve the account in SQL Editor:

```sql
update public.admin_profiles
set role = 'admin', is_active = true
where user_id = (
  select id from auth.users where email = 'your-admin-email@example.com'
);
```

After approval, sign in from `/login` and open `/admin/bookings`.
