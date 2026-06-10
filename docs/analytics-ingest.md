# Analytics ingest (`ingest-job-data-pool`)

FreeJobData’s metrics cron loads **JobDataPool listings CSV** from R2, aggregates company/role/location/industry metrics, and stores analyst-friendly JSON in Netlify Blobs. The static site reads `data/metrics-snapshot.json` at build time.

## Source data (hardcoded)

```
https://pub-e2c96b2fef074ee0809919335319632f.r2.dev/listings-june-2026.csv
```

Defined in `netlify/functions/_shared/fetch-listings.js` as `LISTINGS_CSV_URL`. No env vars are required for the ingest source.

## Run locally (no Netlify)

```bash
npm run ingest:local   # writes data/metrics-snapshot.json
npm run ensure-metrics # fetch from Netlify or fall back to local ingest
npm run dev
```

The static site hydrates from `data/metrics-snapshot.json` (entity metrics, dashboards, map signals, dataset sample rows, and per-page breakdown tables).

Writes:

- `data/metrics-snapshot.json` — full site + dashboard payload
- `data/metrics-manifest.json` — lightweight run summary

## HTTP API (production)

Function: `/.netlify/functions/ingest-job-data-pool`

| Method | Behavior |
| --- | --- |
| Scheduled (no `httpMethod`) | Full ingest from CSV → Netlify Blobs |
| `POST` | Same as scheduled |
| `GET ?view=…` | Read last snapshot from Blobs |

### GET views (for analysts)

| `view` | Returns |
| --- | --- |
| `manifest` (default) | Run metadata, row counts, indexed page totals |
| `snapshot` | Full JSON used by the site build |
| `dashboard` | `global` + homepage dashboard tables only |
| `rollups` | Top-50 company/role/location/industry tables |
| `quality` | Missing-field counters and source info |

Examples:

```bash
curl "https://freejobdata.com/.netlify/functions/ingest-job-data-pool?view=manifest"
curl "https://freejobdata.com/.netlify/functions/ingest-job-data-pool?view=rollups"
```

Manual ingest:

```bash
curl -X POST "https://freejobdata.com/.netlify/functions/ingest-job-data-pool"
```

## Metric definitions

| Metric | Definition |
| --- | --- |
| `active_jobs` | Rows where `listing_closed` is not true |
| `new_jobs_7d` | Rows with `ingestion_date` (or fallback date) in the last 7 days |
| `growthWoW` | % change: last 7d ingest volume vs previous 7d |
| `growthMoM` | % change: last 30d vs previous 30d |
| `remote_share` | % of rows with remote/hybrid in title or location |
| `median_salary` | Median of parsed `job_base_pay_range` values |
| `salary_coverage` | % of active rows with a parseable salary |

SEO index thresholds match `lib/thresholds.ts` (`company` ≥ 10, `role` ≥ 50, `location` / `industry` ≥ 100 active jobs).

## Netlify setup

1. Schedule: daily via `netlify.toml` (`@daily`).
2. Build runs `node scripts/fetch-metrics-snapshot.js` before `next build` when Netlify provides `URL` / `DEPLOY_PRIME_URL`.

After the first scheduled ingest, trigger a new deploy so the site pulls the blob snapshot into `data/metrics-snapshot.json`.

## Analyst workflow

1. Run `npm run ingest:local` to validate listing changes before deploy.
2. Inspect `data/metrics-manifest.json` for row counts and quality flags.
3. Open entity rollups via `?view=rollups` in production.
4. To point at a new month’s file, edit `LISTINGS_CSV_URL` in `fetch-listings.js`.
