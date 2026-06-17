# Abdullah Berke Ozder - Portfolio

This repository contains my frontend and full-stack practice projects. The focus is on React applications, clean UI architecture, Supabase-backed workflows, responsive interfaces, and production-minded project documentation.

## Featured Projects

### The Welding Expert App

A customer appointment and admin availability system for a local welding and metalwork business.

**Highlights**

- Public customer booking page with weekly availability
- Two-hour appointment slot model for realistic service planning
- WhatsApp, email, and in-system appointment request flows
- Admin dashboard for requests and availability management
- Supabase schema with Row Level Security policies
- Gallery page for before/after work examples and testimonials
- Deployment and research documentation

**Tech Stack**

React, Vite, React Router, React Query, Styled Components, Supabase, React Hook Form, React Hot Toast

Project folder: [the-welding-expert-app](./the-welding-expert-app/)

### The Wild Oasis

A hotel and cabin management project focused on bookings, cabins, authentication, and dashboard workflows.

**Highlights**

- Booking management workflow
- Dashboard and business metrics
- Cabin management UI
- Supabase-backed data layer
- Responsive React interface

Project folder: [the-wild-oasis](./the-wild-oasis/)

## Core Skills Demonstrated

- React application architecture
- Client-side routing with React Router
- Server state management with React Query
- Supabase database, auth, and RLS setup
- Responsive UI with Styled Components
- Form handling and validation
- Deployment preparation and environment variable hygiene
- Git and project documentation workflow

## Repository Structure

```text
my-portfolio/
  the-welding-expert-app/
    src/
    public/
    supabase/
    README.md
    DEPLOYMENT.md
    PROJECT_RESEARCH_REVIEW.md
  the-wild-oasis/
  README.md
```

## Running a Project Locally

Each project has its own setup instructions. For example:

```bash
cd the-welding-expert-app
npm install
npm run dev
```

Environment variables are intentionally not committed. Copy the relevant `.env.example` file and create a local `.env.local` file for development.

## Security Notes

- Real `.env` files are ignored.
- Supabase secret or service role keys must never be committed.
- Browser applications should only use publishable or anon keys protected by RLS.
- Deployment platforms should receive environment variables through their secure dashboard.

## Contact

- GitHub: [abdullahberkeozder](https://github.com/abdullahberkeozder)
- LinkedIn: [Abdullah Ozder](https://www.linkedin.com/in/abdullah-ozder/)
- Email: abdullahberkeozder@gmail.com

## License

Projects in this repository are shared for portfolio and learning purposes.
