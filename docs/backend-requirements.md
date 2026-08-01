# Backend requirements — lead intake and bill upload

**Status: not implemented.** This repository is a static SPA with no server.

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

## Storage: Cloudflare R2 (recommended)

| | Why |
|---|---|
| S3-compatible | Presigned-URL code is identical to S3; migrating later is an endpoint change, not a rewrite |
| Zero egress fees | Larry downloading bills costs nothing; S3 charges per GB out |
| Private by default | Buckets are only public if you explicitly attach a public domain — the safe state is the default |
| Cost | Free tier covers this volume; pennies beyond it |

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
