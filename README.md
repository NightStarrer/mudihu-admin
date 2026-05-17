# MuDiHu Operations OS

Internal agency operations platform for **MuDiHu** (Muttugodu Digital Hub).

## Features (Phase 1 MVP)

- Authentication (Supabase) with admin / employee roles
- Client management (CRUD, search, notes, linked proposals)
- Proposal builder (phases, grouped development areas, GST totals)
- Branded PDF export via React PDF (`@react-pdf/renderer`)
- Dashboard overview
- Branding settings (colors, footer, logo upload)
- AI suggestion stubs (industry-based preview)

## Tech stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Supabase (Auth, PostgreSQL, Storage, RLS)
- **PDF:** React PDF in API routes
- **Deploy:** Vercel + Cloudflare DNS + Supabase

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Run migrations in order from `supabase/migrations/`.
3. Enable **Email** auth under Authentication → Providers.
4. Add redirect URLs: `http://localhost:3000/**` and your production Vercel URL.

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in Supabase URL, anon key, and service role key (for PDF storage uploads).

### 3. First admin user

1. Sign up via the app at `/login` (or create user in Supabase Auth).
2. In SQL Editor, promote your user:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_UUID';
```

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push to GitHub and import in Vercel.
2. Add the same env vars in Vercel project settings.
3. Point Cloudflare DNS to Vercel.

## Logo

A placeholder **MH** mark is used until you upload the official MuDiHu logo under **Settings → Branding**.

## Project structure

```
src/
  app/
    (auth)/login/
    dashboard/          # clients, proposals, settings
    api/pdf/proposal/   # PDF generation
  components/
    pdf/                # React-PDF documents
  lib/
    supabase/
    proposals/
    pdf/
    ai/                 # stub provider
supabase/migrations/
```

## License

Private — MuDiHu internal use.
