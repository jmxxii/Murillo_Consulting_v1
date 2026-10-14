/** Small request/response helpers shared by every function in /api. */

export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

/** SITE_URL without a trailing slash, e.g. https://murilloconsulting.com */
export function siteUrl(): string {
  return env("SITE_URL").replace(/\/+$/, "");
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * The inquiry id from a dynamic route such as /api/inquiries/<id>/complete.
 * Returns undefined unless it is a UUID, so a junk id never reaches DynamoDB.
 */
export function pathId(request: Request): string | undefined {
  const url = new URL(request.url);
  const candidates = [url.searchParams.get("id"), ...url.pathname.split("/")];
  return candidates.find((part): part is string => !!part && UUID.test(part));
}

export function getCookie(request: Request, name: string): string | undefined {
  for (const pair of (request.headers.get("cookie") ?? "").split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

/** httpOnly, Secure, SameSite=Lax. maxAge 0 clears the cookie. */
export function setCookie(name: string, value: string, maxAge: number, path: string): string {
  return `${name}=${value}; Path=${path}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 302, headers });
}
