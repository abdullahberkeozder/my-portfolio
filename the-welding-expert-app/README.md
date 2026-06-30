# The Welding Expert App (Umut Usta Randevu Sistemi)

The Welding Expert App is a React 18, Vite, and Supabase web application tailored for a local metalwork and home maintenance service. It delivers a fast, mobile-optimized booking experience for clients, coupled with a secure, role-based operations panel for the business owner and their team.

---

## 📸 Screenshots

<p align="center">
  <strong>Masaüstü Randevu Arayüzü</strong><br>
  <img src="./docs/readme-assets/appointment-page.png" alt="Customer Booking Page" width="90%" />
</p>

<br>

<p align="center">
  <strong>Masaüstü Çalışma Galerisi (Önce / Sonra Karşılaştırmalı)</strong><br>
  <img src="./docs/readme-assets/gallery-page.png" alt="Work Gallery Page" width="90%" />
</p>

<br>

<p align="center">
  <strong>Mobil Randevu Deneyimi & Yapışkan Alt Eylem Barı</strong><br>
  <img src="./docs/readme-assets/appointment-mobile.png" alt="Mobile Booking Experience" width="320px" />
</p>

---

## ✨ Features

### 👥 Customer Booking Portal
* **Weekly Smart Availability Calendar:** Clients can view open days and choose 2-hour slots between 09:00 and 21:00.
* **Fast Checkout/Booking Options:** Submit requests directly through the system database, start a pre-filled WhatsApp conversation, or send a mail package.
* **Accordion SSS (FAQ):** A mobile-first, space-saving collapsible Q&A container.
* **Sticky Mobile CTA:** A persistent bottom action bar on mobile screens providing quick access to WhatsApp support and smooth scroll navigation to the calendar.

### 🛡️ Admin Operations Panel (`/admin`)
* **Live Operational Dashboard:** Visual analytics, statistics, and a weekly slot status calendar.
* **30-Second Auto-Refresh (Polling):** Queries are refreshed in the background every 30 seconds to catch new incoming client requests instantly.
* **Advanced Request Management:** Search through client requests by name, phone, email, notes, or admin comments, and filter by status using tabs.
* **Soft-Delete (Archiving):** Restrict physical deletion of requests. Cancelling/deleting an item marks it as archived, freeing up any locked slot in the calendar. Admins can view the archive and restore items at any time.
* **Dynamic Slot Manager:** Easily declare days as *Available*, *Limited*, or *Closed*, and toggle individual slots.
* **Team & Permission Control:** Owner-only control panel to approve pending accounts, assign roles (`Owner`, `Admin`, `Operator`, `Technician`), suspend, or demote members safely.

### ⚡ Technical & Infrastructure
* **Two-Way Database Slot Sync Trigger:** Confirmed requests lock their slot automatically. Cancelling, archiving, or deleting a confirmed request immediately re-opens the slot.
* **Localized Dynamic SEO & Schemas:** Inject page title, descriptions, canonical paths, and Google rich snippets (`LocalBusiness` JSON-LD) into client-facing pages dynamically.
* **SPA Redirection:** Handlers included for Netlify (`_redirects`) and Vercel (`vercel.json`) to prevent React Router route breakage.
* **Clean Code Structure:** Separated styling blocks into `.styles.js` files and broke giant pages down into compact, unit-tested subcomponents.

---

## 🛠️ Tech Stack

| Component | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, React Router DOM |
| **State & Data Fetching** | TanStack React Query (v4) |
| **Styling** | Styled Components (Vanilla CSS properties) |
| **Notifications** | React Hot Toast |
| **Validation** | React Hook Form |
| **Testing** | Vitest, React Testing Library, jsdom |
| **Backend** | Supabase Auth, PostgreSQL DB, Storage Buckets, RLS Policies |

---

## 🛣️ Application Routes

| Route | View Group | Description |
| --- | --- | --- |
| `/appointment` | Public | Main booking landing page |
| `/gallery` | Public | Before/After comparisons, portfolio & testimonials |
| `/login` | Public | Team access login |
| `/signup` | Public | Register a pending team profile |
| `/admin/dashboard` | Protected (Team) | Operations overview & status cards |
| `/admin/bookings` | Protected (Team) | Advanced request manager (Search & Status Filters) |
| `/admin/availability` | Protected (Team) | Weekly schedule slot planner |
| `/admin/gallery` | Protected (Owner/Admin) | Portfolio item publisher & image uploader |
| `/admin/users` | Protected (Owner-only) | Team accounts & permission controller |

*Note: Legacy routes `/dashboard` and `/bookings` redirect automatically to their protected `/admin` equivalents.*

---

## 🚀 Getting Started

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

*Tip: Promote your first profile to Owner by editing the bootstrap email address inside `role_based_access_control.sql` before running.*

---

## 🖼️ Seeding Portfolio Work Examples
The project includes a ready-to-use seed file to populate your work gallery with real examples:
1. Go to the **Supabase Storage** panel.
2. Inside the **`gallery`** bucket, upload the 9 images from `public/images/`:
   * `hinge_before.png`, `hinge_after.png` (Hinge replacement)
   * `railing_before.png`, `railing_after.png` (Railing renovation)
   * `shelf_before.png`, `shelf_after.png` (Custom heavy shelves)
   * `landscaping.png`, `painting.png`, `renovation.png` (General works)
3. Open **`supabase/seed_portfolio_images.sql`**, copy the statements, and run them in the **Supabase SQL Editor**. (The project reference prefix `qhevdwblchkotttcqoou` is pre-configured).

---

## 🔒 Security Measures
* **Row Level Security (RLS):** Enabled on all tables. Anonymous clients can only insert requests via the database function RPC, and select day/slot metrics.
* **Immutable Client Notes:** Trigger policies prevent update attempts on a customer's original message/note.
* **Owner Protection Policies:** The final active `Owner` user is guarded database-side; they cannot be demoted, suspended, or rejected, preventing lockout.
* **Sanitized Client Pages:** Booking and Gallery views remain completely accessible without authentication.
