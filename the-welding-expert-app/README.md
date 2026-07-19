# The Welding Expert App (Umut Usta Booking System)

**Live Demo:** [umut-usta.vercel.app/appointment](https://umut-usta.vercel.app/appointment)

The Welding Expert App is a React 18, Vite, and Supabase web application tailored for a local metalwork and home maintenance service. It delivers a fast, mobile-optimized booking experience for clients, coupled with a secure, role-based operations panel for the business owner and their team.

---

## Product Design & User Experience (Design Thinking)

The application resolves communication and scheduling friction between local home service providers and customers. By introducing a self-service client calendar alongside automated multi-channel messaging options, the application drastically reduces booking drop-off rates.

<details>
<summary><strong>Friction Reduction & User Journey Map</strong></summary>

### The Problem
Traditional scheduling requires multiple phone calls and manual negotiation. Customers often abandon forms if selecting an available date and time slot feels complex or disconnected.

### UX Resolution
A **2-Step Booking Wizard** designed specifically for mobile thumb zones. Customers select services, check calendar availability, choose their preferred time slot, and submit booking requests in under 45 seconds.

* **Primary Files:** [CustomerBooking.jsx](file:///c:/Users/a-ber/Documents/Git/my-portfolio/the-welding-expert-app/src/pages/CustomerBooking.jsx), [BookingCalendar.jsx](file:///c:/Users/a-ber/Documents/Git/my-portfolio/the-welding-expert-app/src/features/booking/components/BookingCalendar.jsx)
* **Mobile Layout:**
  <p align="center">
    <img src="./docs/readme-assets/appointment-mobile.png" alt="Mobile Booking Experience" width="280px" />
  </p>
</details>

---

## Operations & Data Visualization

Operational efficiency is supported by providing real-time data insights directly to business operators, enabling quick confirmations, workload trend analysis, and funnel performance tracking.

<details>
<summary><strong>Operational Analytics & Funnel Diagnostics</strong></summary>

### The Problem
Small service providers lack visibility into workload trends, completed job volumes, or drop-off steps in their booking funnels.

### Visualization Resolution
A live administrative control center featuring **weekly trend charts (recharts)** displaying requests over the last 8 weeks, business KPIs (Total, New, Confirmed, Cancelled, Completed counts), and a conversion funnel mapping wizard milestones (Wizard Open → Step 1 Done → Form Submit → WhatsApp Click).

* **Primary Files:** [Dashboard.jsx](file:///c:/Users/a-ber/Documents/Git/my-portfolio/the-welding-expert-app/src/pages/Dashboard.jsx), [AnalyticsDashboard.jsx](file:///c:/Users/a-ber/Documents/Git/my-portfolio/the-welding-expert-app/src/features/analytics/components/AnalyticsDashboard.jsx)
* **Dashboard View:**
  <p align="center">
    <img src="./docs/readme-assets/appointment-page.png" alt="Operations Panel" width="80%" />
  </p>
</details>

---

## Systems Engineering & Data Security

Veracity and atomic state synchronization are enforced at the database transaction layer to prevent scheduling discrepancies like double-bookings and unauthorized record updates.

<details>
<summary><strong>Concurrency Control & Race Condition Mitigation</strong></summary>

### The Problem
Two customers might attempt to book the exact same time slot concurrently, leading to double-bookings and operational conflicts.

### Engineering Resolution
Guarded scheduling at the database transaction layer using a PostgreSQL RPC. When executing `create_appointment_request()`, a row lock is requested on the availability slot:
```sql
SELECT slot.id INTO v_slot_id
FROM public.appointment_availability_slots as slot
WHERE slot.slot_time = p_requested_time AND slot.is_available = true
FOR UPDATE OF slot;
```
This queues up concurrent requests, allowing only the first write attempt to proceed while gracefully notifying others.

* **Primary Schema Configs:** [welding_appointments_schema.sql](file:///c:/Users/a-ber/Documents/Git/my-portfolio/the-welding-expert-app/supabase/welding_appointments_schema.sql)
</details>

---

## Features

### Customer Booking Portal
* **Weekly Smart Availability Calendar:** Clients can view open days and choose 2-hour slots between 09:00 and 21:00.
* **Dynamic Services & Pricing Details:** Services, description lists, and starting price taglines are loaded directly from the database configurations.
* **Fast Checkout/Booking Options:** Submit requests directly through the system database, start a pre-filled WhatsApp conversation, or send a mail package.
* **Accordion SSS (FAQ):** A mobile-first, space-saving collapsible Q&A container.
* **Sticky Mobile CTA:** A persistent bottom action bar on mobile screens providing quick access to WhatsApp support and smooth scroll navigation to the calendar.

### Admin Operations Panel (/admin)
* **Live Operational Dashboard:** Real-time business KPIs (Total, New, Confirmed, Cancelled, Completed counts), weekly trend charts (recharts) for the last 8 weeks, and a weekly slot status calendar.
* **Conversion Funnel Analytics:** Dynamic conversion statistics and drop-off rate tracking for the booking wizard milestones.
* **Dynamic Services Customizer:** Inline configuration console to update services, pricing taglines, and bullet points on the fly.
* **30-Second Auto-Refresh (Polling):** Queries are refreshed in the background every 30 seconds to catch new incoming client requests instantly.
* **Advanced Request Management:** Search through client requests by name, phone, email, notes, or admin comments, and filter by status using tabs.
* **Server-Side Pagination:** Bookings list query supports range paginated chunks (20 requests/page) for scalable request loads.
* **Soft-Delete (Archiving):** Restrict physical deletion of requests. Cancelling/deleting an item marks it as archived, freeing up any locked slot in the calendar. Admins can view the archive and restore items at any time.
* **Dynamic Slot Manager:** Easily declare days as *Available*, *Limited*, or *Closed*, and toggle individual slots.
* **Team & Permission Control:** Owner-only control panel to approve pending accounts, assign roles (`Owner`, `Admin`, `Operator`, `Technician`), suspend, or demote members safely.

### Technical & Infrastructure
* **Two-Way Database Slot Sync Trigger:** Confirmed requests lock their slot automatically. Cancelling, archiving, or deleting a confirmed request immediately re-opens the slot.
* **Privacy-First Custom Session Logger:** Custom session events are logged directly into the database to calculate dashboard conversion analytics without relying on third-party cookies.
* **Localized Dynamic SEO & Schemas:** Inject page title, descriptions, canonical paths, and Google rich snippets (`LocalBusiness` JSON-LD) into client-facing pages dynamically.
* **SPA Redirection:** Handlers included for Netlify (`_redirects`) and Vercel (`vercel.json`) to prevent React Router route breakage.
* **Clean Code Structure:** Separated styling blocks into `.styles.js` files and broke giant pages down into compact, unit-tested subcomponents.

---

## Tech Stack

| Component | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, React Router DOM |
| **State & Data Fetching** | TanStack React Query (v4) |
| **Data Visualization** | Recharts (Responsive charts) |
| **Styling** | Styled Components (Vanilla CSS properties) |
| **Notifications** | React Hot Toast |
| **Validation** | React Hook Form |
| **Testing** | Vitest, React Testing Library, jsdom |
| **Backend** | Supabase Auth, PostgreSQL DB, Storage Buckets, RLS Policies |

---

## Application Routes

| Route | View Group | Description |
| --- | --- | --- |
| `/appointment` | Public | Main booking landing page |
| `/gallery` | Public | Before/After comparisons, portfolio & testimonials |
| `/login` | Public | Team access login |
| `/signup` | Public | Register a pending team profile |
| `/admin/dashboard` | Protected (Team) | Operations overview, status cards, and trend analytics |
| `/admin/bookings` | Protected (Team) | Paginated request manager with search & status filters |
| `/admin/availability` | Protected (Team) | Weekly schedule slot planner |
| `/admin/services` | Protected (Admin/Owner) | Dynamic service config & price editor |
| `/admin/gallery` | Protected (Owner/Admin) | Portfolio item publisher & image uploader |
| `/admin/users` | Protected (Owner-only) | Team accounts & permission controller |

*Note: Legacy routes `/dashboard` and `/bookings` redirect automatically to their protected `/admin` equivalents.*

---

## Getting Started

### 1. Installation
Install dependencies and launch the Vite development server:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
```

### 3. Supabase Migrations
Execute the SQL scripts in the following order inside the **Supabase SQL Editor**:
1. `supabase/welding_appointments_schema.sql` (Base schema, tables, triggers, and sample data)
2. `supabase/role_based_access_control.sql` (Role definitions, policies, Owner bootstrap)
3. `supabase/gallery_management_setup.sql` (Storage bucket creation, policy grants, index keys)
4. `supabase/sync_appointment_status_with_slot.sql` (Re-open cancelled slot trigger)
5. `supabase/archive_appointment_requests.sql` (Archiving column addition, trigger logic updates)
6. `supabase/analytics_events_migration.sql` (Analytics tracking tables & RLS rules)
7. `supabase/service_configs_migration.sql` (Dynamic services pricing definitions & seed data)
8. `supabase/customer_self_service_requests.sql` (Customer tracking links, cancellation/change requests, feedback fields & public RPCs)

*Tip: Promote your first profile to Owner by editing the bootstrap email address inside `role_based_access_control.sql` before running.*

---

## Seeding Portfolio Work Examples
The project includes a ready-to-use seed file to populate your work gallery with real examples:
1. Go to the **Supabase Storage** panel.
2. Inside the **`gallery`** bucket, upload the 9 images from `public/images/`:
   * `hinge_before.png`, `hinge_after.png` (Hinge replacement)
   * `railing_before.png`, `railing_after.png` (Railing renovation)
   * `shelf_before.png`, `shelf_after.png` (Custom heavy shelves)
   * `landscaping.png`, `painting.png`, `renovation.png` (General works)
3. Open **`supabase/seed_portfolio_images.sql`**, copy the statements, and run them in the **Supabase SQL Editor**. (The project reference prefix `qhevdwblchkotttcqoou` is pre-configured).

---

## Security Measures
- **Row Level Security (RLS):** Enabled on all tables. Anonymous clients can only insert requests via the database function RPC, and select day/slot metrics.
- **Immutable Client Notes:** Trigger policies prevent update attempts on a customer's original message/note.
- **Owner Protection Policies:** The final active `Owner` user is guarded database-side; they cannot be demoted, suspended, or rejected, preventing lockout.
- **Sanitized Client Pages:** Booking and Gallery views remain completely accessible without authentication.
