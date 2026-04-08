# AIDemo

> AI友好化全栈架构实践 | 🔗 **[Live Demo](https://ai-demo-ydhu007.vercel.app)**

A full-stack web application built with Next.js, Supabase, and Tailwind CSS.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (Turborepo monorepo)
- **Auth & Database**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env file and fill in your Supabase credentials
cp apps/web/.env.example apps/web/.env.local

# Start development server
pnpm dev
```

## Project Structure

```
├── apps/
│   └── web/          # Next.js application
├── packages/
│   ├── config/       # Shared configuration
│   └── ui/           # Shared UI components
└── turbo.json        # Turborepo config
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ydhu007/AIDemo)
