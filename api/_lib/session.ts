import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env, getCookie, json, siteUrl } from "./http.js";

/**
 * Signed tokens for the admin session cookie and for the short-lived
 * sign-in state cookie. The audience keeps the two from being swapped.
 */
export const SESSION_COOKIE = "mc_admin";
export const SESSION_COOKIE_PATH = "/api/admin";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

type Audience = "session" | "oidc";

function key(): Uint8Array {
  const secret = env("SESSION_SECRET");
  if (secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}

export function signToken(payload: JWTPayload, ttlSeconds: number, audience: Audience) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .setAudience(audience)
    .sign(key());
}

export async function verifyToken(
  token: string | undefined,
  audience: Audience,
): Promise<JWTPayload | undefined> {
  if (!token) return undefined;
  try {
    const { payload } = await jwtVerify(token, key(), { audience, algorithms: ["HS256"] });
    return payload;
  } catch {
    return undefined;
  }
}

export interface AdminUser {
  name: string;
  email: string;
}

/**
 * Returns the signed-in admin, or the error Response to send back.
 * State-changing methods must also come from our own origin: SameSite=Lax
 * already blocks cross-site cookies, this is a second lock on the same door.
 */
export async function requireAdmin(request: Request): Promise<AdminUser | Response> {
  const session = await verifyToken(getCookie(request, SESSION_COOKIE), "session");
  if (!session) return json({ error: "unauthorized" }, 401);

  if (!["GET", "HEAD"].includes(request.method)) {
    if (request.headers.get("origin") !== new URL(siteUrl()).origin) {
      return json({ error: "forbidden" }, 403);
    }
  }

  return { name: String(session.name ?? ""), email: String(session.email ?? "") };
}
