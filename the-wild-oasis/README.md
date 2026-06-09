# The Wild Oasis 🏨

A comprehensive hotel and cabin management system designed for booking management, cabin administration, and guest services.

## 🎯 Features

- **Dashboard:** Real-time overview of bookings and business metrics
- **Booking Management:** Create, update, and delete guest bookings with full details
- **Cabin Management:** Manage cabin inventory, pricing, and capacity
- **Guest Management:** Complete guest information and contact management
- **Settings:** Configure hotel policies and pricing rules
- **User Authentication:** Secure login and account management
- **Real-time Updates:** Instant data synchronization across the platform

## 🛠️ Tech Stack

| Technology            | Purpose                       |
| --------------------- | ----------------------------- |
| **React 18**          | UI Framework                  |
| **Vite**              | Build tool & dev server       |
| **React Router 7**    | Client-side routing           |
| **React Query**       | Server state management       |
| **Styled Components** | CSS-in-JS styling             |
| **Supabase**          | Backend & PostgreSQL Database |
| **React Hook Form**   | Form management               |
| **React Hot Toast**   | Notifications                 |
| **date-fns**          | Date manipulation             |

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for backend)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/abdullahberkeozder/my-portfolio.git
cd the-wild-oasis
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── features/         # Feature-specific modules
│   ├── cabins/      # Cabin management
│   ├── bookings/    # Booking management
│   ├── settings/    # Settings management
│   └── authentication/
├── pages/           # Page components
├── ui/              # UI components
├── hooks/           # Custom React hooks
├── services/        # API calls to Supabase
├── utils/           # Utility functions
├── styles/          # Global styles
└── data/            # Mock data for development
```

## 🔐 Authentication

The application uses Supabase authentication for secure user management.

## 🗄️ Database

The project uses **Supabase** (PostgreSQL) for data storage with tables for:

- Cabins, Guests, Bookings, and Settings

## 🎨 Styling

The project uses **Styled Components** for component-scoped styling with a consistent design system.

## 📱 Core Pages

- **Dashboard** - Business metrics and activity overview
- **Cabins** - Manage cabin inventory and pricing
- **Bookings** - Handle guest bookings and check-ins
- **Users** - User account management
- **Settings** - Configure business policies

## 📝 License

MIT License

## 👤 Author

**Abdullah Berke Özder**

- GitHub: [@abdullahberkeozder](https://github.com/abdullahberkeozder)
