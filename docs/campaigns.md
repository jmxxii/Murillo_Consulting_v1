# Adding a campaign page

Campaigns are data, not pages. There is one template
(`src/pages/CampaignPage.tsx`) that renders any object satisfying the
`Campaign` type. Launching a campaign means adding one file and one line —
no components, no duplicated layout, no routing changes.

## Steps

1. **Copy the example.**

   ```bash
   cp src/content/campaigns/restaurants.ts src/content/campaigns/retail.ts
   ```

2. **Edit the content.** At minimum set `name`, `slug`, `audience`, `hero`
   and `seo`. Every visitor-facing string is typed `Localized<string>`, so
   TypeScript will not let you ship a campaign that is missing its Spanish
   copy.

3. **Register it** in `src/content/campaigns/index.ts`:

   ```ts
   import retail from "./retail";
   export const campaigns: Campaign[] = [restaurants, retail];
   ```

4. **Preview it.** `npm run dev`, then visit `/campaigns/retail` and
   `/es/campaigns/retail`. Draft campaigns render in development only.

5. **Go live.** Set `status: "active"` and, if the campaign is time-boxed,
   `startDate` / `endDate`. Add both URLs to `public/sitemap.xml`.

## Available fields

| Field | Required | Notes |
|---|---|---|
| `name` | ✅ | Internal only, never rendered |
| `slug` | ✅ | URL segment; lowercase kebab-case |
| `status` | ✅ | `draft` \| `active` \| `ended` |
| `startDate` / `endDate` | | `YYYY-MM-DD`, inclusive; outside the window the page 404s |
| `attribution` | | Value sent with leads and analytics; defaults to `slug` |
| `audience` | ✅ | Industry/audience chip in the hero |
| `hero` | ✅ | `eyebrow`, `headline`, `supporting`, `primaryCta`, optional `secondaryCta`, `image`, `imageAlt` |
| `seo` | ✅ | `title`, `description`, optional `ogImage` |
| `benefits` | | Heading + optional body + card list |
| `process` | | Overrides the standard three steps |
| `services` | | Overrides the standard three services |
| `testimonials` | | **See the warning below** |
| `faq` | | Campaign-specific questions |
| `form` | | Overrides the form heading, intro, submit label and thank-you copy |

Omit an optional section and it simply does not render.

## Status and visibility

| `status` | Development | Production |
|---|---|---|
| `draft` | Renders, banner shown, `noindex` | 404 |
| `active` | Renders (subject to dates) | Renders (subject to dates) |
| `ended` | 404 | 404 |

Draft pages are always `noindex, nofollow`, so a preview link cannot end up
in search results.

## Rules

- **Never invent a testimonial.** `testimonials` exists for when a real
  client has agreed *in writing* to be quoted. A test asserts that no
  campaign in the repo ships with testimonials — if you add a genuine one,
  update that test deliberately.
- **Never promise savings.** Use "potential savings", "options that may be
  available", "more competitive rates".
- **Keep the utility/supplier distinction.** If a campaign restates the
  reliability message, it must keep separating the utility (delivery,
  infrastructure, outages) from the supply/rate option being evaluated.
- **The main site stays general.** Industry-specific angles belong here, not
  on the homepage.

## What is automatic

Routing, both language variants, page metadata, canonical + hreflang,
`noindex` for drafts, JSON-LD, `campaign_view` / `campaign_conversion`
analytics, and lead attribution on the form.
