# Setup guide: AWS, Microsoft Entra, Turnstile, Vercel

This is the one-time account setup behind the inquiry form and `/admin`
(see `docs/admin-plan.md`). We have no access to these accounts, so the owner
runs every step here. It takes about an hour, most of it waiting on DNS.

Keep a scratch note open while you work. Each step produces values (keys, IDs,
names) that go into Vercel in the last step. They are marked like this:
**→ `ENV_VAR_NAME`**.

## 0. Decide the URLs first

Several services need the exact site addresses, so write them down now:

| Name | Value |
|---|---|
| Production | `https://murilloconsulting.co` (the canonical URL in `index.html`). Add `https://www.murilloconsulting.co` too if that also serves the site. |
| Development preview | The **branch URL** Vercel gives the `development` branch, e.g. `https://murillo-consulting-v1-git-development-<team>.vercel.app`. Find it in Vercel → Project → Deployments → a `development` deployment → "Domains". It stays the same across deploys, unlike the per-deploy URLs. |
| Local | `http://localhost:3000` (what `vercel dev` uses) |

## 1. AWS account

1. Create an AWS account (or use the existing one) and sign in to the console.
2. Every resource below goes in **US East (Ohio) `us-east-2`**.
   **→ `APP_AWS_REGION` = `us-east-2`**. New accounts on the AWS free plan are
   locked to this one region (other regions need the account owner to upgrade
   first), and everything here works in it. Console Home has no region picker;
   it appears top right (next to the account name) once you open a regional
   service. The quickest way in is
   <https://us-east-2.console.aws.amazon.com/dynamodbv2/home?region=us-east-2>.
   CloudShell then opens in that region too.
3. **Account plan.** New accounts start on the AWS *free plan*: credits plus
   a free period (about 6 months). When it ends, AWS services stop working
   unless the account is upgraded, which would take the form and `/admin`
   down. Testing on the free plan is fine; **upgrade to the paid plan before
   launch** (Billing → upgrade plan). Remaining credits carry over. Then, in
   Billing → Budgets, create a small monthly budget (e.g. $5) with an email
   alert.
4. Note your 12-digit **account ID** (top right menu). The commands below call it
   `ACCOUNT_ID`.

The commands in this guide run in **AWS CloudShell** (the `>_` icon in the
console's top bar). Nothing to install. Console click-paths are given too.

## 2. DynamoDB table

One table holds the inquiries. Records delete themselves 90 days after
submission (TTL).

```bash
aws dynamodb create-table \
  --region us-east-2 \
  --table-name inquiries \
  --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=status,AttributeType=S \
      AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --global-secondary-indexes '[{
      "IndexName": "status-createdAt-index",
      "KeySchema": [
        {"AttributeName": "status", "KeyType": "HASH"},
        {"AttributeName": "createdAt", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    }]'

aws dynamodb wait table-exists --region us-east-2 --table-name inquiries

aws dynamodb update-time-to-live \
  --region us-east-2 \
  --table-name inquiries \
  --time-to-live-specification Enabled=true,AttributeName=expiresAt
```

Console equivalent: DynamoDB → Tables → Create table. Name `inquiries`,
partition key `id` (String). Table settings: Customize → Provisioned, auto
scaling **off**, 5 read / 5 write. Add a global secondary index: partition key
`status` (String), sort key `createdAt` (String), name
`status-createdAt-index`, 5/5. After creation: Additional settings → Time to
Live → Turn on, attribute name `expiresAt`.

- Encryption at rest is on by default (AWS owned key). Leave it.
- 10 read + 10 write units total stays inside DynamoDB's always-free allowance
  (25 + 25) and is far more than this site needs.

**→ `INQUIRIES_TABLE` = `inquiries`**

## 3. S3 bucket

Bills are stored here. The bucket is private. Browsers upload with short-lived
signed forms and staff view files through 5-minute signed links.

Bucket names are global, so add something unique:

```bash
BUCKET=murillo-consulting-inquiries-$(openssl rand -hex 4)
echo $BUCKET   # write this down

aws s3api create-bucket --region us-east-2 --bucket $BUCKET \
  --create-bucket-configuration LocationConstraint=us-east-2
```

**→ `UPLOADS_BUCKET` = the name printed above**

New buckets already have Block Public Access on, ACLs disabled and default
encryption (SSE-S3). Confirm on the bucket's Permissions and Properties tabs.
Leave them as they are.

### 3a. Deny non-TLS access

```bash
aws s3api put-bucket-policy --bucket $BUCKET --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"DenyInsecureTransport\",
    \"Effect\": \"Deny\",
    \"Principal\": \"*\",
    \"Action\": \"s3:*\",
    \"Resource\": [\"arn:aws:s3:::$BUCKET\", \"arn:aws:s3:::$BUCKET/*\"],
    \"Condition\": {\"Bool\": {\"aws:SecureTransport\": \"false\"}}
  }]
}"
```

### 3b. CORS (lets the site's browser upload directly)

Replace the origins with the ones from step 0. No trailing slashes.

```bash
cat > cors.json <<'EOF'
{
  "CORSRules": [{
    "AllowedOrigins": [
      "https://murilloconsulting.co",
      "https://www.murilloconsulting.co",
      "https://murillo-consulting-v1-git-development-TEAM.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}
EOF
aws s3api put-bucket-cors --bucket $BUCKET --cors-configuration file://cors.json
```

Only `POST` is allowed. Admin previews and downloads are plain links and
`<img>`/`<iframe>` loads, which do not need CORS.

### 3c. Delete files after 90 days

```bash
aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "expire-inquiry-files-90-days",
      "Status": "Enabled",
      "Filter": {"Prefix": "inquiries/"},
      "Expiration": {"Days": 90},
      "AbortIncompleteMultipartUpload": {"DaysAfterInitiation": 1}
    }]
  }'
```

S3 lifecycle and DynamoDB TTL each run on their own schedule and can lag a day
or two. The admin page handles a file that has expired before its record.

## 4. IAM user for the app

The site's API uses one IAM user whose permissions cover only this table, this
bucket and sending email.

1. IAM → Users → Create user, name `murillo-consulting-app`. Do **not** give it
   console access.
2. Skip "Set permissions", create the user, then open it → Permissions → Add
   permissions → Create inline policy → JSON. Paste this, replacing
   `ACCOUNT_ID` and `BUCKET_NAME`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InquiriesTable",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-2:ACCOUNT_ID:table/inquiries",
        "arn:aws:dynamodb:us-east-2:ACCOUNT_ID:table/inquiries/index/*"
      ]
    },
    {
      "Sid": "InquiryFiles",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::BUCKET_NAME/inquiries/*"
    },
    {
      "Sid": "ListInquiryFiles",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::BUCKET_NAME",
      "Condition": {"StringLike": {"s3:prefix": "inquiries/*"}}
    },
    {
      "Sid": "SendNotification",
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": "arn:aws:ses:us-east-2:ACCOUNT_ID:identity/*"
    }
  ]
}
```

   Name it `murillo-consulting-app` and save. `s3:ListBucket` is there so a
   missing file reads as "not found" instead of "access denied", and so Delete
   can find every file for an inquiry.
3. Security credentials tab → Create access key → "Application running outside
   AWS". Copy both values now; the secret is shown only once.

**→ `APP_AWS_ACCESS_KEY_ID`** and **→ `APP_AWS_SECRET_ACCESS_KEY`**

Vercel reserves `AWS_*` variable names, which is why ours start with `APP_`.

## 5. SES (email to Larry)

SES sends one short email per new inquiry: the business name and a link to
`/admin`. No bill data and no contact details.

1. Open <https://us-east-2.console.aws.amazon.com/ses/home?region=us-east-2#/identities>
   (or SES → ☰ menu → Configuration → **Identities**). Skip the landing page's
   "Get started" wizard; it is not needed. Create identity → **Domain** →
   `murilloconsulting.co`. Under "Verifying your domain", keep **Easy DKIM**,
   RSA 2048-bit. Leave "custom MAIL FROM" off. Create.
2. SES shows **three CNAME records**. Add them at the DNS host for
   `murilloconsulting.co`. They are new records with their own names and do not
   touch the existing Microsoft 365 MX, SPF or DKIM records. Status turns
   "Verified" once DNS propagates (minutes to a few hours).
3. Identities → Create identity → **Email address** → Larry's address. He gets
   a verification email and clicks the link.
4. Leave the account in the **SES sandbox**. The sandbox only sends to verified
   addresses, which is exactly what we want. Do not request production access.

**→ `SES_FROM_EMAIL`**: any address at the verified domain, e.g.
`inquiries@murilloconsulting.co`. It does not need a real mailbox.
**→ `NOTIFY_EMAIL`**: Larry's verified address.

DKIM signs as `murilloconsulting.co`, so the email passes the domain's DMARC
check even though Microsoft 365 handles the domain's normal mail.

## 6. Microsoft Entra app registration (admin sign-in)

Staff sign in to `/admin` with their Microsoft 365 account. Only accounts in our
own tenant can sign in, and only people explicitly assigned to the app.

1. Go to <https://entra.microsoft.com> as a Microsoft 365 admin.
2. Identity → Applications → **App registrations** → New registration:
   - Name: `Murillo Consulting Admin`
   - Supported account types: **Accounts in this organizational directory only
     (single tenant)**
   - Redirect URI: platform **Web**,
     `https://murilloconsulting.co/api/admin/auth/callback`
   - Register.
3. On the app's Overview page copy:
   - **Application (client) ID** **→ `ENTRA_CLIENT_ID`**
   - **Directory (tenant) ID** (a GUID, not the domain name) **→ `ENTRA_TENANT_ID`**
4. Authentication → Web → Redirect URIs → add the others, one per site from
   step 0:
   - `https://www.murilloconsulting.co/api/admin/auth/callback` (if used)
   - `https://<development branch URL>/api/admin/auth/callback`
   - `http://localhost:3000/api/admin/auth/callback`

   Leave "Access tokens" and "ID tokens" (implicit grant) **unchecked**. Save.
5. Certificates & secrets → Client secrets → New client secret, expiry 24
   months. Copy the **Value** column (not the Secret ID) right away.
   **→ `ENTRA_CLIENT_SECRET`**. Put a calendar reminder a few weeks before it
   expires: sign-in stops working the day it does.
6. API permissions: the default `Microsoft Graph → User.Read` is enough. Click
   **Grant admin consent for Murillo Consulting** so staff are not asked to
   consent on first sign-in.
7. Now lock it down. Identity → Applications → **Enterprise applications** →
   `Murillo Consulting Admin`:
   - Properties → **Assignment required? = Yes** → Save. Optionally set
     "Visible to users?" to No so it does not show up in the My Apps portal.
   - Users and groups → Add user/group → select **Larry** (and yourself) →
     Assign. On the free Entra tier you assign users one by one; assigning
     groups needs Entra ID P1.

Anyone not assigned gets a Microsoft error page and never reaches our site.

## 7. Cloudflare Turnstile (bot check on the public form)

1. Cloudflare dashboard → **Turnstile** → Add widget.
2. Name `Murillo Consulting form`. Hostnames: `murilloconsulting.co`,
   `www.murilloconsulting.co`, the development branch host (no `https://`),
   and `localhost`.
3. Widget mode: **Managed**. Pre-clearance: No. Create.
4. Copy **Site key** **→ `TURNSTILE_SITE_KEY`** and **Secret key**
   **→ `TURNSTILE_SECRET_KEY`**.

The site does not need to be on Cloudflare DNS for Turnstile to work.

For local development you can use Cloudflare's published test keys, which
always pass: site key `1x00000000000000000000AA`, secret key
`1x0000000000000000000000000000000AA`. Never use them in Vercel.

## 8. Vercel environment variables

Vercel → Project → Settings → Environment Variables. Add each variable for
**Production** and for **Preview**. For Preview, set "Git branch" to
`development` so other branches don't get the keys.

| Variable | Value | Notes |
|---|---|---|
| `APP_AWS_REGION` | `us-east-2` | |
| `APP_AWS_ACCESS_KEY_ID` | step 4 | Mark sensitive |
| `APP_AWS_SECRET_ACCESS_KEY` | step 4 | Mark sensitive |
| `INQUIRIES_TABLE` | `inquiries` | |
| `UPLOADS_BUCKET` | step 3 | |
| `SES_FROM_EMAIL` | `inquiries@murilloconsulting.co` | |
| `NOTIFY_EMAIL` | Larry's verified address | |
| `TURNSTILE_SECRET_KEY` | step 7 | Mark sensitive |
| `TURNSTILE_SITE_KEY` | step 7 | Public by design (the widget needs it in the browser), but served by `/api/config` at runtime, not built into the bundle |
| `ENTRA_TENANT_ID` | step 6 (GUID) | |
| `ENTRA_CLIENT_ID` | step 6 | |
| `ENTRA_CLIENT_SECRET` | step 6 | Mark sensitive |
| `SESSION_SECRET` | `openssl rand -base64 48` | Mark sensitive. Use a **different** value for Production and Preview |
| `SITE_URL` | Production: `https://murilloconsulting.co`. Preview: the development branch URL | No trailing slash. Used for the sign-in redirect and the link in Larry's email |

Redeploy after adding variables; existing deployments do not pick them up.

### Local development

`npm run dev` serves only the site. To run the API locally too:

```bash
npm i -g vercel
vercel link
vercel env pull .env.local
vercel dev
```

`.env.local` is gitignored. After pulling, change `SITE_URL` in it to
`http://localhost:3000`, and optionally swap in the Turnstile test keys.

## 9. Check it worked

- [ ] DynamoDB → `inquiries` → TTL shows "On" with attribute `expiresAt`
- [ ] S3 bucket → Permissions: Block Public Access all on, bucket policy and
      CORS present. Management: lifecycle rule enabled
- [ ] IAM user has exactly one inline policy and one access key
- [ ] SES → Identities: domain and Larry's address both "Verified"
- [ ] Entra → Enterprise app: Assignment required = Yes, Larry assigned
- [ ] Turnstile widget lists all hostnames
- [ ] All 14 Vercel variables set for Production and Preview (development)

Then tell us, and we run the end-to-end check on the development preview.

## Rotating secrets

- **AWS key**: create a second access key, update Vercel, redeploy, then
  deactivate and delete the old one.
- **Entra secret**: add a new secret, update Vercel, redeploy, delete the old one.
- **`SESSION_SECRET`**: change it and redeploy. Everyone is signed out.
