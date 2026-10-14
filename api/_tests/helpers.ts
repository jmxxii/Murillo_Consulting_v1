/* eslint-disable @typescript-eslint/no-explicit-any -- AWS command inputs vary per command; tests assert on their shape. */
import { vi } from "vitest";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signToken } from "../_lib/session.js";

type Command = { constructor: { name: string }; input: any };

/** Routes a mocked client's `send` by command class name. Unhandled commands return {}. */
export function mockSend(
  client: { send: unknown },
  handlers: Record<string, (input: any) => unknown>,
) {
  vi.mocked(client.send as (command: Command) => Promise<unknown>).mockImplementation(
    async (command) => (handlers[command.constructor.name] ?? (() => ({})))(command.input),
  );
}

/** Inputs of every command of the given class sent through a mocked client. */
export function sent(client: { send: unknown }, name: string): any[] {
  return vi
    .mocked(client.send as (command: Command) => unknown)
    .mock.calls.map(([command]) => command)
    .filter((command) => command.constructor.name === name)
    .map((command) => command.input);
}

export function awsError(name: string) {
  return Object.assign(new Error(name), { name });
}

export const SITE = "https://murilloconsulting.com";
export const ID = "0b9c6a44-3a2f-4e8e-9d6b-2f1f6a7c8d90";

export async function adminCookie() {
  const token = await signToken(
    { name: "Larry Murillo", email: "larry@murilloconsulting.co" },
    SESSION_TTL_SECONDS,
    "session",
  );
  return `${SESSION_COOKIE}=${token}`;
}

export function request(path: string, init: RequestInit & { json?: unknown } = {}) {
  const { json, headers, ...rest } = init;
  return new Request(`${SITE}${path}`, {
    ...rest,
    headers: { "content-type": "application/json", ...headers },
    body: json === undefined ? rest.body : JSON.stringify(json),
  });
}
