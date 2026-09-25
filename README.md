# 💌 Secret Admirer App

A complete, production-ready romantic web application built with **Vite + React + TypeScript + Supabase + Vercel**.

## 🌹 Features

- **Romantic Landing Page** — Beautiful intro with animated text and interactive questionnaire
- **Secure Authentication** — Supabase Auth with email confirmation
- **Role-Based Access** — User and Admin portals with strict RLS
- **Private Messaging** — Real-time chat between user and admin via Supabase Realtime
- **Questionnaire System** — Personalized questions with persistent responses
- **Notifications** — Real-time push notifications with read/unread states
- **Admin Portal** — Full management of users, questions, responses, conversations, and notifications
- **Premium UI** — Glassmorphism, Framer Motion animations, romantic color palette

---

## 🚀 Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Navigate to **SQL Editor**
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. This creates all tables, RLS policies, triggers, and seed data

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Find these values in: **Supabase Dashboard → Project Settings → API**

### 3. Create an Admin User

After running the migration:

1. Register a new account through the app
2. In Supabase SQL Editor, run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### 4. Configure Supabase Auth

In **Supabase Dashboard → Authentication → URL Configuration**:
- **Site URL**: `https://your-vercel-domain.vercel.app`
- **Redirect URLs**: 
  - `https://your-vercel-domain.vercel.app/app`
  - `http://localhost:5173/app` (for development)

### 5. Local Development

```bash
npm install
npm run dev
```

### 6. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy!

---

## 🏗️ Architecture

```
Vite → React + TypeScript → Supabase → Vercel

src/
├── components/
│   ├── routing/     # Protected routes, role-based routing
│   └── ui/          # Reusable UI components
├── contexts/        # Auth context (React Context + Zustand)
├── layouts/         # UserLayout, AdminLayout
├── lib/             # Supabase client
├── pages/
│   ├── user/        # Home, OurStory, MyAnswers, Messages, Notifications, Profile
│   └── admin/       # Dashboard, Users, Responses, Conversations, Messages, Questions, Notifications, Settings, Profile
├── services/        # API service layers (auth, messaging, notifications, admin, questionnaire)
├── store/           # Zustand auth store
└── types/           # TypeScript database types
```

## 🔒 Security

- **Row Level Security (RLS)** on all tables
- Users can only access their own data
- Admin role is set server-side only (cannot be self-assigned)
- Supabase service role key is never exposed to frontend
- All API calls use the anon key with RLS enforcement

## 📱 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Vite** | Build tool & dev server |
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **Framer Motion** | Animations |
| **Supabase Auth** | Authentication |
| **Supabase PostgreSQL** | Database |
| **Supabase Realtime** | Live messaging & notifications |
| **Supabase RLS** | Row-level security |
| **Zustand** | Client state management |
| **React Router v6** | Client-side routing |
| **React Hot Toast** | Toast notifications |
| **date-fns** | Date formatting |
| **Vercel** | Deployment platform |
