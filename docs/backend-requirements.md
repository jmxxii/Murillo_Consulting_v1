# Backend requirements — lead intake and bill upload

**Status: not implemented.** This repository is a static SPA with no server.

## Start here: the simple setup (no backend)

This is the recommended setup. Everything below it is only needed if this
stops being enough.

1. **Lead form → a form service.** Create a form at Formspree (or similar)
   and set `VITE_LEAD_ENDPOINT` to its URL in Vercel's environment settings.
   It receives contact details only, never bills, and emails them to Larry.
   Spam filtering is included. Check the free plan's monthly limit.
2. **Bills → SharePoint "Request files" link.** Larry replies to each lead
   with an upload-only link to a folder in a SharePoint site library (not
   personal OneDrive). Set an expiry on the link. See "Option A" below.

Nothing in this setup stores bills outside Microsoft 365, and no code you
own touches them.

## The chosen architecture: two-step intake

Bills are **never** collected from an anonymous visitor.

```
1. Public form (built, working)
   contact details only — no files
   POST -> VITE_LEAD_ENDPOINT
                │
                ▼
2. Larry reviews the lead, emails a single-use upload link
   https://…/upload/<token>          token: random, expiring, one lead
                │
                ▼
3. Link-gated upload page (to build)
   asks the API for a presigned PUT, uploads DIRECT to private storage
   reuses the existing <FileDropzone> component
```

### Why not just accept files on the public form

- **No open upload endpoint.** Nothing on the public internet can push files
  at you, so there is no anonymous malware/spam/fuzzing surface.
- **You only store bills for engaged leads**, which shrinks the retention and
  breach-exposure problem to almost nothing.
- **Consent is real** — the customer uploads in response to a specific
  request, rather than ticking a box next to a dropzone.
- It matches how the business already works: personal, one-to-one.

### The constraint that rules out the obvious design

**Vercel Serverless Functions cap request bodies at 4.5 MB.** With a 10 MB
per-file and 30 MB per-submission limit, bills cannot be POSTed *through* a
function. The bytes must go **browser → storage directly**, with the function
only issuing a short-lived credential. Any design that proxies the upload
through your API will fail on a customer photographing three bills.

---

## Storage: SharePoint (recommended — the tenant already exists)

Murillo Consulting already runs Microsoft 365 (Bookings is live at
`outlook.office.com/book/EnergyStrategy@murilloconsulting.co`), so SharePoint
is already licensed, already governed, and already where Larry works.

For a business this size that beats a hand-rolled object store, mainly
because the compliance work is done for you:

| | Hand-rolled R2/S3 | SharePoint |
|---|---|---|
| Encryption at rest | You configure it | Default |
| Audit logging | You build it | Built in |
| Retention / deletion | **You write and maintain a cron job** | Purview retention labels, automatic |
| DLP, eDiscovery | No | Included |
| Access control | A bucket policy you must not misconfigure | Entra ID + MFA |
| Cost | A few dollars/month | Already paid for |

**Two requirements:**

1. **Use a SharePoint site document library, not personal OneDrive.**
   OneDrive content is tied to a user account; if that licence is removed the
   data is at risk. A site library is owned by the organisation.
2. **Tenant sharing must allow "Anyone" links** for anonymous file requests
   (SharePoint admin centre → Policies → Sharing). If your admin keeps that
   disabled, use option B below, where the visitor authenticates against a
   token you issue rather than a Microsoft anonymous link.

### Option A — "Request files" link (no code)

SharePoint/OneDrive folders support **Request files**: a link that lets
someone upload *without signing in*, while being unable to see, download or
delete anything already in the folder.

This IS the two-step flow. **The website needs no changes** — the form
already collects contact details and already promises "a secure link to share
your recent bills". That link is the file request. Set an expiry on it;
anonymous links can be forwarded.

Start here. Move to B only if the SharePoint-hosted upload page is a problem.

### Option B — in-site upload page via Microsoft Graph

Keeps the client on murilloconsulting.com.

- Entra ID app registration, `Sites.ReadWrite.All` (application permission),
  client credentials in Vercel env vars
- Function calls Graph `createUploadSession` on the target drive and returns
  the session URL
- **Browser PUTs chunks directly to Microsoft** — the bytes never pass
  through your function, which is what sidesteps the 4.5 MB limit. Same shape
  as an S3 presigned PUT.
- Endpoints 2–4 below still apply (token issue / presign / finalize), with
  Graph substituted for S3

### Option C — Microsoft Forms

Has a file-upload question type, but **file upload is believed to require
respondents to sign in with a work or school account**, which rules it out
for cold prospects. Verify current behaviour before considering it.

---

## Storage alternative: Cloudflare R2

| | Why |
|---|---|
| S3-compatible | Presigned-URL code is identical to S3; migrating later is an endpoint change, not a rewrite |
| Zero egress fees | Larry downloading bills costs nothing; S3 charges per GB out |
| Private by default | Buckets are only public if you explicitly attach a public domain — the safe state is the default |
| Cost | Free tier covers this volume; pennies beyond it |

Only worth it if you deliberately want to keep customer data out of M365.
Choose **AWS S3** instead if you already run AWS — GuardDuty Malware
Protection can scan objects on upload, which is a real advantage.

Avoid **Vercel Blob** until you have confirmed it supports genuinely private
access. It has historically served files at public-but-unguessable URLs,
which is security-by-obscurity and not acceptable for account numbers.

---

## Endpoint 1 — lead intake

`POST <VITE_LEAD_ENDPOINT>` · `application/x-www-form-urlencoded` or JSON.
Small payload, so this one can go through a function normally.

| Field | Type | Notes |
|---|---|---|
| `firstName`, `lastName` | string | |
| `businessName` | string | |
| `email` | string | |
| `phone` | string | |
| `preferredLanguage` | `en` \| `es` | |
| `businessLocation` | string | |
| `serviceType` | `electricity` \| `gas` \| `both` | |
| `locationCount` | integer 1–100 | |
| `notes` | string, optional | max 2000 chars |
| `consent` | `"true"` | reject if absent |
| `submittedLocale` | `en` \| `es` | |
| `campaign` | string, optional | attribution slug |

Re-validate every field server-side. `src/lib/leadSchema.ts` is plain zod and
can be imported directly by a Node backend — share it rather than
reimplementing.

Respond `2xx` on success. **Do not put diagnostic detail in the response
body**; the client ignores it by design.

Also required: rate limiting per IP and per email, spam protection, CORS
restricted to your production origin, HTTPS + HSTS.

---

## Endpoint 2 — issue an upload token

Called by Larry (authenticated — this is not public).

- Generates a cryptographically random token (≥32 bytes, `crypto.randomUUID()`
  is *not* sufficient entropy for a bearer credential — use `randomBytes`)
- Stores `{ token_hash, lead_id, expires_at, used_count, max_files }`
- **Store a hash of the token, never the token itself** — same reasoning as
  passwords; a database leak must not yield working upload links
- Expiry of 3–7 days
- Emails the link to the lead

---

## Endpoint 3 — presign an upload

`POST /api/upload/presign` with the token.

- [ ] Verify the token: exists, not expired, under its use limit
- [ ] Reject the request if `contentType` is not in the allow-list
- [ ] Reject if declared `size` exceeds 10 MB
- [ ] **Generate the object key server-side** — `leads/<lead_id>/<uuid>.<ext>`.
      The client-supplied filename is a display hint only and must never be a
      path component, even though the client sanitizes it.
- [ ] Return a presigned PUT valid for ~5 minutes, with `Content-Type` and
      `Content-Length` bound into the signature so the client cannot upload
      something other than what it declared
- [ ] Record the pending object against the lead

---

## Endpoint 4 — finalize

`POST /api/upload/complete` with the token and the object keys.

- [ ] **Verify server-side that each object actually matches its declared
      type by reading its first bytes from storage** (`%PDF`, `FF D8 FF`,
      `89 50 4E 47 0D 0A 1A 0A`). A presigned PUT means the client controls
      the bytes — the magic-byte check in `src/lib/fileValidation.ts` runs in
      the browser and is trivially bypassed.
- [ ] Malware scan before the object is readable by staff
- [ ] Enforce the file-count cap
- [ ] Mark the token used; notify Larry
- [ ] Delete any object that fails validation

---

## Access for staff

- Never a public URL. Ever.
- Short-lived presigned GET, issued only to an authenticated staff session.
- Encrypt at rest (SSE-KMS on S3, or R2's default encryption).
- Enable access logging on the bucket.

## Logging

- [ ] Never log bill contents, filenames, account numbers, or `notes`
- [ ] Log submission id, timestamp, outcome only
- [ ] Scrub PII before anything reaches error reporting (Sentry et al.)

---

## Retention and deletion

**Proposed — needs business/legal sign-off.**

| Data | Retention | Rationale |
|---|---|---|
| Uploaded bill files | 90 days after analysis delivered | Enough to complete the review and answer follow-ups |
| Lead contact details | 24 months from last contact | Ordinary commercial follow-up |
| Upload tokens | Deleted on use or expiry | No reason to keep a spent credential |
| Audit log (id, timestamp, outcome — no PII) | 24 months | Debugging and abuse investigation |

- [ ] **Automated** deletion job — retention that relies on someone
      remembering is not retention. R2 and S3 both support lifecycle rules.
- [ ] A documented way for a customer to request deletion, and a named person
      responsible for handling it
- [ ] Deletion must cover backups and any copy forwarded by email
- [ ] Publish a privacy notice linked from the form. The current consent text
      is accurate but is not a privacy notice.

---

## Frontend work still outstanding

- [ ] `/upload/:token` route + page (reuses `<FileDropzone>`, already built
      and tested — see `src/test/leadForm.test.tsx`)
- [ ] Swap `submitLead`'s XHR-with-progress for the presign → PUT → complete
      sequence on that page. The progress plumbing in
      `src/lib/leadSubmission.ts` is reusable; the presigned PUT is a single
      XHR and reports progress the same way.
- [ ] `t.form.upload.*` copy already exists in both languages for this page.

## Wiring up

```bash
echo 'VITE_LEAD_ENDPOINT=https://api.example.com/leads' >> .env.local
```

Set the same variable in Vercel's environment settings. No component changes
are needed — the form leaves its "unavailable" state automatically.
