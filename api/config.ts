import { json } from "./_lib/http.js";

/**
 * GET /api/config (public): browser-safe settings, read at request time so
 * they never get baked into the JavaScript bundle (no VITE_* variables).
 *
 * The Turnstile site key is public by design: Cloudflare's widget needs it
 * in the visitor's browser. The secret key stays server-side.
 */
export function GET(): Response {
  return json({ turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null });
}
