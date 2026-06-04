# FreeJobData

FreeJobData is a Next.js App Router site for publishing free job market datasets, SEO landing pages, and research reports powered by JobDataPool.

## App structure

Routes are grouped by sitelink hub under `app/(datasets)`, `app/(metrics)`, and `app/(community)` — see [app/README.md](app/README.md). Public URLs are unchanged (`/datasets`, `/metrics`, `/community`, etc.).

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment

```env
NEXT_PUBLIC_SITE_URL=https://freejobdata.com
JOBDATAPOOL_API_URL=https://jobdatapool.com/api/v1
JOBDATAPOOL_INTERNAL_API_KEY=
DATABASE_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Included MVP

- Static-data versions of company, role, location, industry, dataset, and report pages.
- Dynamic metadata, canonical URLs, robots rules, sitemap generation, and JSON-LD.
- Sample CSV downloads under `public/samples`.
- Script stubs for syncing JobDataPool data and generating weekly reports.
- Community intelligence page with Firebase Auth role detection and Deck.gl job-location map.

## Community roles

The community page reads Firebase ID-token custom claims client-side for display:

- `role: "freejobdata_team"`, `role: "team"`, `freejobdataRole: "team"`, or `admin: true` renders the FreeJobData Team publisher view.
- All other signed-in users render as community contributors.

Server-side writes still need enforcement through Firebase Security Rules or a trusted API that verifies ID tokens.

Live metrics come from **`ingest-job-data-pool`** (Netlify cron over JobDataPool `listings-june-2026-api.json` on R2). See [docs/analytics-ingest.md](docs/analytics-ingest.md).

```bash
npm run ingest:local   # write data/metrics-snapshot.json for local dev / validation
```

## Deploy on Netlify

FreeJobData is a standalone Next.js site in this repository. Netlify detects Next.js 16 automatically and runs the OpenNext adapter (no extra plugin pin required).

### 1. Connect the site

1. In [Netlify](https://app.netlify.com/), choose **Add new site** → **Import an existing project**.
2. Connect the `freejobdata` Git repository (this folder is its own repo).
3. Confirm build settings (Netlify should read `netlify.toml`):

   | Setting | Value |
   | --- | --- |
   | Base directory | *(leave empty — repo root is the app)* |
   | Build command | `npm run build` |
   | Publish directory | `.next` |
   | Node version | `20` |

4. Deploy. The first build runs `next build` and publishes ~147 static/SSG pages.

### 2. Environment variables

Set these under **Site configuration → Environment variables** (production scope):

| Variable | Production value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://freejobdata.com` | Also set in `netlify.toml` for production context. |
| `JOBDATAPOOL_API_URL` | `https://jobdatapool.com/api/v1` | Used by `npm run sync`, not the static MVP build. |
| `JOBDATAPOOL_INTERNAL_API_KEY` | *(optional)* | Bearer token if JobDataPool requires it. |

Ingest source URL is hardcoded in `netlify/functions/_shared/fetch-listings.js` (no env var).

Deploy previews pick up Netlify’s `URL` / `DEPLOY_PRIME_URL` for canonicals when `NEXT_PUBLIC_SITE_URL` is unset.

### 3. Custom domain

1. **Domain management** → add `freejobdata.com` (and `www` if desired).
2. Point DNS to Netlify per their wizard.
3. Enable HTTPS (automatic once DNS propagates).

### 4. Local Netlify dev (optional)

```bash
npm install -g netlify-cli
netlify link
netlify dev
```

Runs the Next dev server with Netlify’s local proxy (default port 8888).

### Monorepo note

If this app ever lives inside a larger repo (for example `jobdatapool/freejobdata`), set **Base directory** to `freejobdata` in the Netlify UI so builds run from that folder.
