import { json } from "../../_lib/http.js";
import { requireAdmin } from "../../_lib/session.js";

/** GET /api/admin/auth/me: the signed-in admin, or 401. The admin page uses it as its sign-in gate. */
export async function GET(request: Request): Promise<Response> {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  return json({ user });
}
