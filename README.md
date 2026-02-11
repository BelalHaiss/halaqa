# Halaqa Management System

A modern, clean architecture system for managing Quran memorization circles (Halaqa).

## Features

- 🏗️ **MVVM Architecture** - Clean separation of concerns
- 📦 **Modular Structure** - Each feature is self-contained
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🔐 **Authentication** - Secure login system
- 👥 **User Management** - Support for Admin, Moderator, and Tutor roles
- 📚 **Group Management** - Create and manage Quran memorization groups
- 📊 **Dashboard** - Overview of key metrics
- 📅 **Session Tracking** - Schedule and track sessions
- ✅ **Attendance** - Mark and monitor student attendance
- 📈 **Reports** - Generate insights and analytics

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Routing**: React Router v7

## Project Structure

```
src/
├── types/           # TypeScript type definitions
├── services/        # API and storage services
├── modules/         # Feature modules (MVVM)
│   ├── auth/
│   ├── dashboard/
│   ├── groups/
│   └── ...
├── components/      # Shared UI components
├── lib/            # Utilities and helpers
└── App.tsx         # Application entry
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Demo Accounts

- **Admin**: admin@halaqa.com / 123456
- **Moderator**: mod@halaqa.com / 123456
- **Tutor**: tutor1@halaqa.com / 123456

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Type check with TypeScript

## Architecture

This project follows **MVVM (Model-View-ViewModel)** pattern:

- **Model**: Types + Services (API calls)
- **View**: React components (presentation)
- **ViewModel**: Custom hooks (state + logic)

Each feature module contains:

- `/services` - API calls and business logic
- `/viewmodels` - State management hooks
- `/views` - React components

🚀 Run the Project
1️⃣ Install Dependencies
pnpm install

2️⃣ Start Database (MySQL)

Make sure Docker is running, then:

docker compose up -d

3️⃣ Run All Apps (Monorepo)

From the root directory:

pnpm run dev

This will start all 3 apps in development mode.

4️⃣ Seed the Database

Navigate to the backend folder and run:

cd apps/backend
tsx prisma db seed
