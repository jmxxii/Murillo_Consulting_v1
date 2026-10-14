import { setCookie } from "../../_lib/http.js";
import { SESSION_COOKIE, SESSION_COOKIE_PATH } from "../../_lib/session.js";

/** POST /api/admin/auth/logout */
export function POST(): Response {
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": setCookie(SESSION_COOKIE, "", 0, SESSION_COOKIE_PATH) },
  });
}
