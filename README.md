# Continuum — Game Discovery & Library Tracker

A modern web application for discovering video games and managing a personal gaming library. Built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Game Discovery** — Browse curated games from RAWG/IGDB APIs with hero carousels, category shelves, and infinite-scroll search
- **Personal Library** — Track games with statuses (backlog, playing, completed, dropped, wishlist), log hours, ratings, and reviews
- **Player Dashboard** — View total games, hours played, average rating, and recent activity
- **Game Details** — Screenshots, descriptions, ratings, platforms, genres, stores, tags
- **Command Palette** — Quick-search games with genre/platform filters (Cmd/Ctrl+K)
- **Authentication** — Email/password auth via NextAuth.js with Prisma sessions
- **Category Browsing** — Filter games by genre (Action, RPG, Shooter, Strategy, Adventure, Indie)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 (strict) |
| UI | React 19, Tailwind CSS v4, shadcn/ui (Vega) |
| Data Fetching | TanStack React Query v5 |
| Database | SQLite via Prisma 7 + better-sqlite3 |
| Auth | NextAuth.js v4 (credentials) + bcryptjs |
| Validation | Zod 4 |
| Icons | lucide-react |
| Smooth Scroll | Lenis |
| E2E Testing | Selenium WebDriver |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or bun

### Setup

```bash
git clone <repo-url>
cd continuum
cp .env.example .env.local   # Add your API keys (see API_SETUP.md)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### API Keys

This project requires keys from [RAWG](https://rawg.io/apidocs) and optionally [Twitch/IGDB](https://api-docs.igdb.com/). See [API_SETUP.md](./API_SETUP.md) for detailed instructions.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test:e2e` | Run Selenium E2E tests |
| `npm run test:smoke` | Run release smoke checks |
| `npm run ci:verify` | Lint + typecheck + build (CI gate) |

## Project Structure

```
app/              Next.js App Router (pages, layouts, API routes)
  ├── api/        API routes (auth, library, rawg, igdb, health)
  ├── auth/       Sign-in / sign-up pages
  ├── backlog/    Backlog library page
  ├── categories/ Category filtered views
  ├── completed/  Completed games page
  ├── games/      Game detail pages
  └── profile/    Player dashboard
components/       React components (UI kit, blocks, shared)
hooks/            Custom React hooks (use-games, use-library)
lib/              Core libraries (axios, prisma, services, types)
providers/        React context providers (auth, query, theme, scroll)
prisma/           Schema, migrations, SQLite database
scripts/          Utility scripts (smoke tests, health checks)
tests/            Selenium E2E tests
ansible/          Ansible deployment playbooks
```

## Deployment

The project includes full Docker, Jenkins, and Ansible support:

- **Docker** — Multi-stage build with standalone output (`Dockerfile`, `docker-compose.prod.yml`)
- **Jenkins** — Declarative pipeline in `JenkinsFile` with quality gates, container build, smoke tests
- **Ansible** — Playbooks in `ansible/` for remote deployment

## Documentation

| File | Contents |
|---|---|
| `ARCHITECTURE.md` | Layered architecture and data flow |
| `DEVELOPMENT.md` | Code patterns and best practices |
| `GETTING_STARTED.md` | 5-minute quickstart |
| `API_SETUP.md` | API key acquisition guide |
| `PRODUCTION_RELEASE.md` | Production release runbook |
| `JENKINS_DOCKER_SETUP.md` | Jenkins CI/CD setup |
| `QUICK_REFERENCE.md` | Cheat sheet |
| `CHECKLIST.md` | Setup verification |

## License

MIT
