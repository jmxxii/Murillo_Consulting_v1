# Murillo Consulting, LLC — website

Bilingual (English / Spanish) marketing site for Murillo Consulting, an
energy consultancy that helps small and midsize businesses compare
electricity and natural gas options and identify potential savings.

## Stack

Vite 5 · React 18 · TypeScript · React Router 6 · Tailwind CSS 3 ·
shadcn/ui · react-hook-form + zod · Vitest + Testing Library

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:8080>.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |

Type checking: `npm run typecheck` (site and `api/`)

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `VITE_TURNSTILE_SITE_KEY` | Yes, to accept submissions | Cloudflare Turnstile site key. While unset, the form validates normally but shows an "online submission is not available yet" state pointing at the direct contact details. |

The API in `/api` needs about a dozen more server-side variables (AWS, Microsoft Entra, Turnstile secret). The full list and how to get each value is in [docs/aws-setup.md](docs/aws-setup.md). Run the API locally with `vercel dev`; `npm run dev` serves only the site.

## Routes

| Path | Page |
|---|---|
| `/` | Homepage (English — the default language) |
| `/es` | Homepage (Spanish) |
| `/campaigns/:slug` | Campaign page (English) |
| `/es/campaigns/:slug` | Campaign page (Spanish) |

This is a client-side SPA. **The host must rewrite unknown paths to
`index.html`**, or `/es` will 404 on a hard refresh. Examples:

- Netlify — `/* /index.html 200` in `_redirects`
- Vercel — a catch-all rewrite to `/index.html`
- S3 + CloudFront — error document `index.html`

## How the code is organised

```
src/
  i18n/            en.ts, es.ts, LanguageProvider — ALL customer-facing copy
  content/
    site.ts        verified business facts (contact details, section ids)
    campaigns/     data-driven campaign definitions
  components/
    layout/        Header, Footer, SiteLayout, LanguageSwitcher
    sections/      homepage sections
    lead/          LeadForm, FileDropzone
    common/        Section, SectionHeading, IconChip, ContentCard
    ui/            shadcn primitives
  lib/             analytics, leadSchema, leadSubmission, fileValidation, structuredData
  pages/           Home, CampaignPage, NotFound
```

### Content

**No customer-facing string belongs in a component.** All copy lives in
`src/i18n/en.ts` and `src/i18n/es.ts`. English is canonical: `es.ts` is typed
against `typeof en`, so a missing key, a misspelled key, or a translated list
with a different number of entries is a compile error. A test additionally
catches blank strings, dropped `{placeholders}`, and untranslated copy.

To add a language: create `src/i18n/<code>.ts` typed as `Dictionary`, add the
code to `LOCALES`, register it in `dictionaries`, and add a route branch in
`App.tsx`.

### Business facts

`src/content/site.ts` is the only place that asserts anything factual about
the company. **Unconfirmed values stay `null`** — the UI hides those entries
rather than rendering a placeholder, and JSON-LD omits them rather than
publishing a guess. Currently `phone` and `areaServed` are unconfirmed.

### Theme

Brand colors are sampled from the logo artwork in `public/assets/logo/`:
navy `#133457`, green `#366A39`, orange `#ED722F`. They are declared once as
HSL custom properties in `src/index.css` and surfaced through
`tailwind.config.ts`. **Never hardcode a hex value in a component.**

Note that `--accent` (the raw brand orange) only reaches 3.0:1 against white,
so it is for fills, icons and indicators — never text. Use `--accent-strong`
(`#BC4C10`, 5.0:1) for orange text and filled CTAs. The `cta` button variant
already does.

### Campaigns

See [docs/campaigns.md](docs/campaigns.md). Adding a campaign is one data
file plus one line in the registry.

### Analytics

`src/lib/analytics.ts` is provider-agnostic and a no-op until a `dataLayer`
or `gtag` exists on `window`. It has a hard privacy contract: nothing derived
from a bill or from a lead's personal details is ever sent, and PII-shaped
keys are stripped defensively. Read the header comment before adding events.

## Security

Energy bills are sensitive. `src/lib/fileValidation.ts` performs extension,
MIME and magic-byte checks plus filename sanitization, but **this is UX, not
security** — it runs in the browser and can be bypassed. Every check must be
repeated server-side, along with malware scanning, private storage and a
retention policy. The full contract is in
[docs/backend-requirements.md](docs/backend-requirements.md).

## Testing

```bash
npm test
```

Covers translation parity and completeness, locale routing and persistence,
navigation (desktop and mobile), page metadata per language, campaign
visibility rules, form validation in both languages, upload restrictions
including disguised executables, submission success/error/unconfigured
states, and the analytics privacy contract.
