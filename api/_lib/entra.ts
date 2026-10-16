import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { env, siteUrl } from "./http.js";

/**
 * Microsoft Entra sign-in (OIDC authorization code flow + PKCE), restricted
 * to our own tenant. "Assignment required" on the Entra app decides which
 * people in the tenant may sign in at all; see docs/aws-setup.md step 6.
 */
export const OIDC_COOKIE = "mc_oidc";
export const OIDC_COOKIE_PATH = "/api/admin/auth";
export const OIDC_TTL_SECONDS = 10 * 60;
const SCOPE = "openid profile email";

function tenantId(): string {
  return env("ENTRA_TENANT_ID").toLowerCase();
}

function authority(): string {
  return `https://login.microsoftonline.com/${tenantId()}`;
}

export function callbackUrl(): string {
  return `${siteUrl()}/api/admin/auth/callback`;
}

export function authorizeUrl(params: { state: string; nonce: string; codeChallenge: string }) {
  const url = new URL(`${authority()}/oauth2/v2.0/authorize`);
  url.search = new URLSearchParams({
    client_id: env("ENTRA_CLIENT_ID"),
    response_type: "code",
    response_mode: "query",
    redirect_uri: callbackUrl(),
    scope: SCOPE,
    state: params.state,
    nonce: params.nonce,
    code_challenge: params.codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

/** Exchanges the code for an ID token. Returns undefined on any failure. */
export async function exchangeCode(code: string, codeVerifier: string) {
  const response = await fetch(`${authority()}/oauth2/v2.0/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: env("ENTRA_CLIENT_ID"),
      client_secret: env("ENTRA_CLIENT_SECRET"),
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: callbackUrl(),
      scope: SCOPE,
    }),
  });
  if (!response.ok) return undefined;
  const body = (await response.json()) as { id_token?: unknown };
  return typeof body.id_token === "string" ? body.id_token : undefined;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

/**
 * Verifies signature, issuer, audience, expiry, tenant and nonce.
 * Returns the claims, or undefined if any check fails.
 */
export async function verifyIdToken(
  idToken: string,
  nonce: string,
): Promise<JWTPayload | undefined> {
  jwks ??= createRemoteJWKSet(new URL(`${authority()}/discovery/v2.0/keys`));
  try {
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer: `${authority()}/v2.0`,
      audience: env("ENTRA_CLIENT_ID"),
    });
    if (payload.tid !== tenantId() || payload.nonce !== nonce) return undefined;
    return payload;
  } catch {
    return undefined;
  }
}
