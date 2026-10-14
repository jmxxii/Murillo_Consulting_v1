import { createRemoteJWKSet, generateKeyPair, SignJWT } from "jose";
import { GET as callback } from "../admin/auth/callback.js";
import { GET as login } from "../admin/auth/login.js";
import { GET as me } from "../admin/auth/me.js";
import { POST as logout } from "../admin/auth/logout.js";
import { requireAdmin } from "../_lib/session.js";
import { request } from "./helpers.js";

vi.mock("jose", async (importOriginal) => ({
  ...(await importOriginal<typeof import("jose")>()),
  createRemoteJWKSet: vi.fn(),
}));

const TENANT = "11111111-2222-3333-4444-555555555555";
let microsoftKey: { privateKey: CryptoKey; publicKey: CryptoKey };

beforeAll(async () => {
  microsoftKey = await generateKeyPair("RS256");
});

beforeEach(() => {
  // Stands in for Microsoft's published signing keys.
  vi.mocked(createRemoteJWKSet).mockReturnValue((async () => microsoftKey.publicKey) as never);
});

function cookieValue(res: Response, name: string) {
  const header = res.headers.getSetCookie().find((c) => c.startsWith(`${name}=`));
  return header?.split(";")[0].slice(name.length + 1);
}

/** Runs login, then returns what Microsoft would send back to the callback. */
async function startSignIn(returnTo?: string) {
  const query = returnTo === undefined ? "" : `?returnTo=${encodeURIComponent(returnTo)}`;
  const res = await login(request(`/api/admin/auth/login${query}`));
  const location = new URL(res.headers.get("location")!);
  return {
    location,
    state: location.searchParams.get("state")!,
    nonce: location.searchParams.get("nonce")!,
    pending: cookieValue(res, "mc_oidc")!,
    loginResponse: res,
  };
}

function idToken(claims: Record<string, unknown>) {
  return new SignJWT({ tid: TENANT, name: "Larry Murillo", preferred_username: "larry@murilloconsulting.co", oid: "oid-1", ...claims })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(`https://login.microsoftonline.com/${TENANT}/v2.0`)
    .setAudience("client-id")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(microsoftKey.privateKey);
}

function tokenEndpoint(token: string) {
  const fetchMock = vi.fn(async () => Response.json({ id_token: token }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function returnFromMicrosoft(params: Record<string, string>, pending: string) {
  const query = new URLSearchParams(params).toString();
  return callback(
    request(`/api/admin/auth/callback?${query}`, { headers: { cookie: `mc_oidc=${pending}` } }),
  );
}

describe("admin sign-in", () => {
  it("login redirects to our tenant with PKCE, state and nonce in a short-lived cookie", async () => {
    const { location, loginResponse } = await startSignIn();

    expect(location.origin + location.pathname).toBe(
      `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`,
    );
    expect(Object.fromEntries(location.searchParams)).toMatchObject({
      client_id: "client-id",
      response_type: "code",
      redirect_uri: "https://murilloconsulting.co/api/admin/auth/callback",
      code_challenge_method: "S256",
    });
    expect(location.searchParams.get("code_challenge")).toMatch(/^[\w-]{43}$/);

    const cookie = loginResponse.headers.getSetCookie()[0];
    expect(cookie).toMatch(/^mc_oidc=.+; Path=\/api\/admin\/auth; Max-Age=600; HttpOnly; Secure; SameSite=Lax$/);
  });

  it("callback exchanges the code, verifies the ID token and starts a session", async () => {
    const { state, nonce, pending } = await startSignIn();
    const fetchMock = tokenEndpoint(await idToken({ nonce }));

    const res = await returnFromMicrosoft({ code: "auth-code", state }, pending);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/admin");
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, { body: URLSearchParams }];
    expect(init.body.get("code")).toBe("auth-code");
    expect(init.body.get("code_verifier")).toMatch(/^[\w-]{43}$/);
    expect(init.body.get("client_secret")).toBe("client-secret");

    const session = cookieValue(res, "mc_admin")!;
    expect(cookieValue(res, "mc_oidc")).toBe("");
    const user = await requireAdmin(
      request("/api/admin/inquiries", { headers: { cookie: `mc_admin=${session}` } }),
    );
    expect(user).toEqual({ name: "Larry Murillo", email: "larry@murilloconsulting.co" });
  });

  it.each([
    ["another tenant", { tid: "99999999-2222-3333-4444-555555555555" }],
    ["a wrong nonce", { nonce: "replayed" }],
  ])("rejects an ID token from %s", async (_label, claims) => {
    const { state, nonce, pending } = await startSignIn();
    tokenEndpoint(await idToken({ nonce, ...claims }));

    const res = await returnFromMicrosoft({ code: "auth-code", state }, pending);

    expect(res.headers.get("location")).toBe("/admin?error=signin");
    expect(cookieValue(res, "mc_admin")).toBeUndefined();
  });

  it("rejects a mismatched state without calling Microsoft", async () => {
    const { pending } = await startSignIn();
    const fetchMock = tokenEndpoint("unused");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const res = await returnFromMicrosoft({ code: "auth-code", state: "forged" }, pending);

    expect(res.headers.get("location")).toBe("/admin?error=signin");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["/admin/inquiries/0b9c6a44-3a2f-4e8e-9d6b-2f1f6a7c8d90", "/admin/inquiries/0b9c6a44-3a2f-4e8e-9d6b-2f1f6a7c8d90"],
    ["https://evil.example/admin", "/admin"],
    ["//evil.example", "/admin"],
    ["/admin/../evil", "/admin"],
  ])("after sign-in, returnTo %s lands on %s", async (returnTo, expected) => {
    const { state, nonce, pending } = await startSignIn(returnTo);
    tokenEndpoint(await idToken({ nonce }));

    const res = await returnFromMicrosoft({ code: "auth-code", state }, pending);

    expect(res.headers.get("location")).toBe(expected);
  });

  it("me returns the signed-in admin, or 401", async () => {
    const { state, nonce, pending } = await startSignIn();
    tokenEndpoint(await idToken({ nonce }));
    const session = cookieValue(await returnFromMicrosoft({ code: "c", state }, pending), "mc_admin");

    const signedIn = await me(request("/api/admin/auth/me", { headers: { cookie: `mc_admin=${session}` } }));
    expect(await signedIn.json()).toEqual({
      user: { name: "Larry Murillo", email: "larry@murilloconsulting.co" },
    });
    expect((await me(request("/api/admin/auth/me"))).status).toBe(401);
  });

  it("logout clears the session cookie", async () => {
    const res = logout();
    expect(res.status).toBe(204);
    expect(res.headers.get("set-cookie")).toMatch(/^mc_admin=; Path=\/api\/admin; Max-Age=0/);
  });
});
