# The Welding Expert App

The Welding Expert App is a React and Supabase application for a local welding and metalwork service. It combines a public, account-free booking experience with a role-based operations panel for owners and team members.

## Screenshots

### Customer Booking Page

![Customer booking page](./docs/readme-assets/appointment-page.png)

### Work Gallery Page

![Work gallery page](./docs/readme-assets/gallery-page.png)

### Mobile Booking Experience

![Mobile booking page](./docs/readme-assets/appointment-mobile.png)

## Features

- Customer appointment page with weekly availability
- Two-hour booking slots between 09:00 and 21:00
- Future date selection for appointment planning
- WhatsApp, email, and in-system request options
- Live operations dashboard backed by Supabase data
- Appointment request and availability management
- Owner-controlled team accounts, roles, and access states
- Owner/Admin gallery publishing with Supabase Storage uploads
- Role-aware navigation, protected routes, and database policies
- Atomic appointment confirmation and slot closing
- Gallery page for work examples, before/after content, and testimonials
- Public business information, service overview, FAQ, and address section
- Supabase schema with RLS policies and an account approval flow

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React 18, Vite, React Router |
| Data fetching | TanStack React Query |
| Styling | Styled Components |
| Forms | React Hook Form, controlled form state |
| Testing | Vitest, Testing Library, jsdom |
| Notifications | React Hot Toast |
| Backend | Supabase Auth, PostgreSQL, RLS |
| Documentation | SQL schema, deployment notes, research review |

## Routes

| Route | Purpose |
| --- | --- |
| `/appointment` | Public customer booking page |
| `/gallery` | Work examples, gallery, and references |
| `/login` | Team account login |
| `/signup` | Team access request |
| `/admin/dashboard` | Role-aware operations overview |
| `/admin/bookings` | Appointment request management |
| `/admin/availability` | Weekly availability and slot management |
| `/admin/gallery` | Owner/Admin work gallery management |
| `/admin/users` | Owner-only team and permission management |

Legacy redirects are kept for `/dashboard` and `/bookings`.

## Getting Started

```bash
npm install
npm run dev
```

The default Vite development URL is usually:

```text
http://localhost:5173
```

## Environment Variables

Create a local `.env.local` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Only use a publishable or anon Supabase key in the browser. Do not place a Supabase secret key or service role key in any frontend environment file.

## Supabase Setup

Run the schema in:

```text
supabase/welding_appointments_schema.sql
supabase/role_based_access_control.sql
supabase/gallery_management_setup.sql
```

Run them in this order. The role migration upgrades the original single-admin
model, and the gallery migration secures gallery records and Storage access.

The schema creates:

- `appointment_availability_days`
- `appointment_availability_slots`
- `appointment_requests`
- `admin_profiles`
- `gallery_items`
- Public `gallery` Storage bucket with an 8 MB image limit
- Owner, Admin, Operator, and Technician roles
- Pending, active, suspended, and rejected account states
- Role-aware helper functions and RLS policies
- Initial sample availability data

The role migration promotes `abdullahberkeozder@gmail.com` to the initial
Owner when that Auth user already exists. Change this bootstrap email in the
migration before running it for another business. Verify the result in SQL
Editor:

```sql
select full_name, email, role, status
from public.admin_profiles
order by created_at;
```

New registrations enter the system as pending team accounts. The Owner can
approve them, assign roles, suspend access, reactivate accounts, or remove
them from the team from **Admin > Ekip ve yetkiler**. Customers do not need an
account.

## Roles and Access

| Role | Dashboard | Appointments | Availability | Team access |
| --- | --- | --- | --- | --- |
| Owner | Yes | Manage | Manage | Full control |
| Admin | Yes | Manage | Manage | No |
| Operator | Yes | Manage | Manage | No |
| Technician | Yes | Assigned-work foundation | No | No |

Owner and Admin accounts can also create, edit, publish, unpublish, order, and
delete gallery items. Gallery uploads accept JPEG, PNG, and WebP files. Public
visitors can read published records and images but cannot view draft records
or modify gallery content.

Account state is stored separately from role: `pending`, `active`,
`suspended`, or `rejected`. Only an active Owner can approve accounts, assign
roles, suspend access, reactivate members, or remove them from the team. The
database prevents the final active Owner from losing access.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test:run
```

`npm run test` starts Vitest in watch mode. `npm run test:run` runs the full
suite once and is used by the GitHub Actions workflow.

The application uses route-level lazy loading. Customer, gallery,
authentication, and admin pages are emitted as separate production chunks.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel and Netlify guidance.

Recommended production setup:

- Add `VITE_SUPABASE_URL`
- Add `VITE_SUPABASE_ANON_KEY`
- Configure SPA fallback for React Router
- Never add Supabase secret keys to a frontend deployment

## Research Notes

See [PROJECT_RESEARCH_REVIEW.md](./PROJECT_RESEARCH_REVIEW.md) for product, UX, local SEO, Supabase, and deployment recommendations.

## Security Checklist

- `.env.local` is ignored
- `node_modules`, `dist`, `build`, screenshots, and logs are ignored
- RLS is enabled for public Supabase tables
- Public users can only read visible availability and submit requests through the secured RPC
- Operational access requires an active team profile and an allowed role
- Team account changes are performed through an Owner-only database function
- The final active Owner cannot be suspended, rejected, or demoted
- Customers do not need an Auth account

## Future Improvements

- Move testimonials to a Supabase table
- Add image resizing and thumbnail generation for gallery uploads
- Add LocalBusiness JSON-LD and page-level SEO metadata
- Add a dedicated assigned-work view for Technician accounts
- Expand integration coverage for admin booking and availability workflows
