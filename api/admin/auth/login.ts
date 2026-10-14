import { createHash, randomBytes } from "node:crypto";
import { authorizeUrl, OIDC_COOKIE, OIDC_COOKIE_PATH, OIDC_TTL_SECONDS } from "../../_lib/entra.js";
import { redirect, setCookie } from "../../_lib/http.js";
import { signToken } from "../../_lib/session.js";

/** Only paths inside /admin, so the sign-in flow cannot be used as an open redirect. */
const SAFE_RETURN = /^\/admin(\/[\w-]+)*$/;

/** GET /api/admin/auth/login?returnTo=/admin/inquiries/<id>: starts Microsoft sign-in. */
export async function GET(request: Request): Promise<Response> {
  const requested = new URL(request.url).searchParams.get("returnTo") ?? "";
  const returnTo = SAFE_RETURN.test(requested) ? requested : "/admin";

  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(verifier).digest("base64url");

  const pending = await signToken({ state, nonce, verifier, returnTo }, OIDC_TTL_SECONDS, "oidc");
  return redirect(authorizeUrl({ state, nonce, codeChallenge }), [
    setCookie(OIDC_COOKIE, pending, OIDC_TTL_SECONDS, OIDC_COOKIE_PATH),
  ]);
}
