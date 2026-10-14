import { createHash, randomBytes } from "node:crypto";
import { authorizeUrl, OIDC_COOKIE, OIDC_COOKIE_PATH, OIDC_TTL_SECONDS } from "../../_lib/entra.js";
import { redirect, setCookie } from "../../_lib/http.js";
import { signToken } from "../../_lib/session.js";

/** GET /api/admin/auth/login: starts Microsoft sign-in. */
export async function GET(): Promise<Response> {
  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(verifier).digest("base64url");

  const pending = await signToken({ state, nonce, verifier }, OIDC_TTL_SECONDS, "oidc");
  return redirect(authorizeUrl({ state, nonce, codeChallenge }), [
    setCookie(OIDC_COOKIE, pending, OIDC_TTL_SECONDS, OIDC_COOKIE_PATH),
  ]);
}
