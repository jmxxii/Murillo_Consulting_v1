import { exchangeCode, OIDC_COOKIE, OIDC_COOKIE_PATH, verifyIdToken } from "../../_lib/entra.js";
import { getCookie, redirect, setCookie } from "../../_lib/http.js";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_PATH,
  SESSION_TTL_SECONDS,
  signToken,
  verifyToken,
} from "../../_lib/session.js";

/** GET /api/admin/auth/callback: Microsoft redirects here after sign-in. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const clearPending = setCookie(OIDC_COOKIE, "", 0, OIDC_COOKIE_PATH);
  const fail = (reason: string) => {
    console.warn("[auth] sign-in failed:", reason);
    return redirect("/admin?error=signin", [clearPending]);
  };

  const pending = await verifyToken(getCookie(request, OIDC_COOKIE), "oidc");
  const code = url.searchParams.get("code");
  if (url.searchParams.has("error")) return fail("denied by Microsoft");
  if (!pending || !code || url.searchParams.get("state") !== pending.state) return fail("state");

  const idToken = await exchangeCode(code, String(pending.verifier));
  if (!idToken) return fail("token exchange");

  const claims = await verifyIdToken(idToken, String(pending.nonce));
  if (!claims) return fail("id token");

  const session = await signToken(
    {
      sub: String(claims.oid ?? claims.sub),
      name: claims.name,
      email: claims.preferred_username ?? claims.email,
    },
    SESSION_TTL_SECONDS,
    "session",
  );
  return redirect("/admin", [
    clearPending,
    setCookie(SESSION_COOKIE, session, SESSION_TTL_SECONDS, SESSION_COOKIE_PATH),
  ]);
}
