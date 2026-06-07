# SMC/ICT Trading Journal

A modern responsive React trading journal for EUR/USD, XAU/USD, and other pairs. It includes a daily journal, screenshot comparison, weekly analytics, monthly analytics, dark mode, Supabase-ready storage, and Vercel deployment support.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Supabase values to `.env`. Without Supabase credentials, the app uses `localStorage` so the UI remains usable during development.

## Supabase

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Create a public storage bucket named `trade-screenshots`.
3. Add the Vercel environment variables from `.env.example`.

## Deploy

Deploy the folder to Vercel. Build command: `npm run build`. Output directory: `dist`.
