# App router layout

URLs are unchanged. Parentheses are [Next.js route groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) (organize files only).

```
app/
├── page.tsx                 → /
├── layout.tsx, globals.css, robots.ts, sitemap.ts
├── api/                     → /api
│
├── (datasets)/              # Sitelink: Datasets
│   └── datasets/
│       ├── page.tsx         → /datasets
│       └── [slug]/          → /datasets/:slug
│
├── (metrics)/               # Sitelink: Metrics
│   ├── metrics/
│   │   └── page.tsx         → /metrics
│   ├── companies/           → /companies, /companies/:slug
│   ├── jobs/                → /jobs, /jobs/:slug
│   ├── locations/           → /locations, /locations/:slug
│   └── industries/          → /industries, /industries/:slug
│
└── (community)/             # Sitelink: Community
    ├── community/
    │   └── page.tsx         → /community
    ├── news/                → /news
    ├── press/               → /press
    ├── about/               → /about
    ├── methodology/         → /methodology
    └── reports/             → /reports, /reports/:slug
```

Hub definitions (nav, sitemap, JSON-LD): `lib/site-hubs.ts`.
