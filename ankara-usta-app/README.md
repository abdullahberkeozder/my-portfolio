# Ankara Usta

Ankara Usta is a local services marketplace prototype designed to connect customers in Ankara with verified tradespeople. Instead of requiring customers to understand service categories, the product lets them describe a problem in natural language, routes them to the most relevant service, and guides them through a service-specific request flow.

Live preview: [ankara-usta.sevvaltuhafiye154322.chatgpt.site](https://ankara-usta.sevvaltuhafiye154322.chatgpt.site)

## Current Product Scope

- Ankara-focused service discovery and neighborhood-based matching
- Natural-language classification that turns a customer's problem into relevant service candidates
- A centralized taxonomy containing six main categories and 26 services
- Packaged-service, quote-comparison, and on-site assessment delivery models
- Working scope-question wizards for six representative services
- Media upload, location selection, and request-summary steps
- Category tabs and popular services generated from the shared taxonomy
- A homepage focused on trust, verification, work evidence, and scope transparency
- Responsive desktop and mobile layouts

## Design System

The interface draws inspiration from Taskrabbit's straightforward task-creation experience while developing a distinct identity for Ankara Usta.

- A petrol-green, trust-blue, and warm off-white color palette
- The original **Mahalle Bağı** (Neighborhood Bond) brand motif from Figma frame `10:749`
- A two-color ring representing the connection between customer, tradesperson, and neighborhood
- A modular tile structure combining house, Tetris, and LEGO-inspired visual language
- A low-density modular rhythm that continues along the page edges
- Controlled repetition and quiet surfaces that support rather than compete with the content

## Technology

- Next.js 16
- React 19
- TypeScript
- Vinext and Vite
- Tailwind CSS 4
- OpenAI Sites deployment compatible with Cloudflare Workers

## Running the Project

Requirement: Node.js `22.13.0` or newer.

```bash
npm ci
npm run dev
```

Windows users can also use the included helper scripts. They prefer a project-local Node runtime under `.tools/` when available and otherwise use the compatible system installation.

```powershell
.\install.ps1
.\dev.ps1
```

Production build:

```bash
npm run build
npm run start
```

Code-quality check:

```bash
npm run lint
```

## Project Structure

```text
app/
  components/          Request-wizard and brand components
  data/                Service taxonomy and question definitions
  lib/                 Service-classification logic
  page.tsx             Main product surface
  globals.css          Design system and responsive rules
public/
  mahalle-bagi-figma-frame.png
docs/
```

## Next Steps

- Customer, tradesperson, and administrator accounts
- Tradesperson applications, document verification, and service-area selection
- Production quote creation and comparison
- Messaging and job-status tracking
- Reviews, complaints, and dispute management
- Persistent database, authentication, and file storage

This version is a working frontend prototype that validates the product flow and visual system. The project will become a full-stack marketplace once accounts, persistent data, and administration features are implemented.
