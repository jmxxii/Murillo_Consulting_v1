# Backend requirements — lead form and bill upload

**Status: not implemented.** This repository is a static single-page app with
no server. The lead form is complete on the client and posts to whatever URL
`VITE_LEAD_ENDPOINT` names. Until that endpoint exists, the form renders an
explicit "online submission is not available yet" state and directs the
visitor to email their bills instead. It never pretends a submission
succeeded.

This document is the contract the endpoint must satisfy.

---

## Why this matters

Energy bills contain the account number, the service address, the business
name, and a full usage history. A leaked bill is a real privacy incident for
a customer who trusted us with it. Treat this endpoint as handling sensitive
personal data, not as a contact form.

---

## Request shape

`POST <VITE_LEAD_ENDPOINT>` with `Content-Type: multipart/form-data`.

| Field | Type | Notes |
|---|---|---|
| `firstName` | string | |
| `lastName` | string | |
| `businessName` | string | |
| `email` | string | |
| `phone` | string | |
| `preferredLanguage` | `en` \| `es` | |
| `businessLocation` | string | |
| `serviceType` | `electricity` \| `gas` \| `both` | |
| `locationCount` | integer 1–100 | |
| `notes` | string, optional | max 2000 chars |
| `consent` | `"true"` | reject the request if absent |
| `submittedLocale` | `en` \| `es` | language the form was completed in |
| `campaign` | string, optional | campaign slug for attribution |
| `bills` | file, repeated | 0–6 files |

Respond `2xx` on success. Any other status makes the client show a generic,
recoverable error. **Do not put diagnostic detail in the response body** —
the client deliberately ignores it, but a body is still a leak if anything
else ever reads it.

---

## Required server-side controls

The client-side checks in `src/lib/fileValidation.ts` are a UX affordance
only. Anyone can `curl` the endpoint directly. Every item below must be
enforced on the server.

### Validation (repeat all of it)

- [ ] Extension allow-list: `pdf`, `jpg`, `jpeg`, `png`
- [ ] MIME allow-list: `application/pdf`, `image/jpeg`, `image/png`
- [ ] **Magic-byte sniffing** — the declared type is attacker-controlled.
      `%PDF`, `FF D8 FF`, `89 50 4E 47 0D 0A 1A 0A`
- [ ] Per-file size cap: 10 MB
- [ ] Per-request total cap: 30 MB
- [ ] File-count cap: 6
- [ ] Reject zero-byte files
- [ ] Re-validate every text field (the same rules as `src/lib/leadSchema.ts`;
      that schema is plain zod and can be shared with a Node backend)

### Storage

- [ ] **Generate the storage key server-side** (UUID). The `filename` in the
      multipart part is a client-supplied *display hint* and must never be
      used as a path component, even though the client sanitizes it.
- [ ] Store outside the web root, in a private bucket with public access
      explicitly blocked.
- [ ] Encrypt at rest.
- [ ] Serve only via short-lived signed URLs to authenticated staff. No
      permanent public URL, ever.
- [ ] Never place an account number, email, or object key in a query string.

### Hardening

- [ ] Malware scan before the file is durably stored or forwarded.
- [ ] Rate limit per IP and per email.
- [ ] Spam protection (a honeypot field or a privacy-respecting captcha —
      note that the site must remain usable for people on older devices).
- [ ] HTTPS only; HSTS.
- [ ] CORS restricted to the production origin.
- [ ] Request size limit at the proxy layer, so oversized bodies are dropped
      before they reach application code.

### Logging

- [ ] Do **not** log bill contents, filenames, account numbers, or the
      `notes` field.
- [ ] Log the submission id, timestamp, and outcome only.
- [ ] Scrub PII from error reporting (Sentry et al.) before it is sent.

---

## Retention and deletion

**These values are a proposal and need business/legal sign-off.**

| Data | Proposed retention | Rationale |
|---|---|---|
| Uploaded bill files | 90 days after the analysis is delivered | Long enough to complete the review and answer follow-up questions |
| Lead contact details | 24 months from last contact | Ordinary commercial follow-up |
| Submission audit log (id, timestamp, outcome — no PII) | 24 months | Debugging and abuse investigation |

Also required:

- [ ] Automated deletion job — retention that depends on someone remembering
      is not retention.
- [ ] A documented way for a customer to request deletion, and a person
      responsible for handling it.
- [ ] Deletion must cover backups and any copy forwarded to email.
- [ ] State the retention period in a privacy notice linked from the form.
      The form currently says only that the information is used to prepare
      the analysis; that is accurate but not sufficient as a privacy notice.

---

## Suggested implementations

Any of these satisfies the contract. Listed cheapest-first:

1. **Serverless function + object storage** — Vercel/Netlify function or AWS
   Lambda writing to S3/R2 with a private ACL, then emailing a signed link to
   Larry. Smallest amount of new infrastructure.
2. **Managed form backend** with file support (e.g. Formspree, Basin) —
   fastest to ship, but confirm their retention, encryption and DPA terms
   before sending customer bills through a third party.
3. **Small dedicated API** if lead data eventually needs to live in a CRM.

---

## Wiring it up

Once the endpoint exists:

```bash
echo 'VITE_LEAD_ENDPOINT=https://api.example.com/leads' >> .env.local
```

Set the same variable in the hosting provider's environment for production.
No component changes are needed — the form switches out of its "unavailable"
state automatically.
