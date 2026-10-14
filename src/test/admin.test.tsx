import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "@/App";

const ID = "0b9c6a44-3a2f-4e8e-9d6b-2f1f6a7c8d90";
const USER = { name: "Larry Murillo", email: "larry@murilloconsulting.co" };

const summary = (overrides: object) => ({
  id: ID,
  status: "new",
  createdAt: "2026-10-01T12:00:00.000Z",
  businessName: "Lopez Bakery",
  firstName: "Ana",
  lastName: "Lopez",
  fileCount: 2,
  ...overrides,
});

const detail = {
  ...summary({}),
  email: "ana@example.com",
  phone: "(305) 555-0123",
  preferredLanguage: "es",
  businessLocation: "Miami, FL",
  serviceType: "both",
  locationCount: 2,
  notes: "Contract renews in March.",
  submittedLocale: "es",
  files: [
    {
      name: "June bill.pdf",
      type: "application/pdf",
      size: 2048,
      available: true,
      viewUrl: "https://bucket.s3.amazonaws.com/view-pdf",
      downloadUrl: "https://bucket.s3.amazonaws.com/download-pdf",
    },
    {
      name: "meter.png",
      type: "image/png",
      size: 1024,
      available: true,
      viewUrl: "https://bucket.s3.amazonaws.com/view-png",
      downloadUrl: "https://bucket.s3.amazonaws.com/download-png",
    },
    { name: "old.pdf", type: "application/pdf", size: 10, available: false },
  ],
};

type Route = (init: RequestInit) => Response;
let routes: Record<string, Route>;
let fetchMock: ReturnType<typeof vi.fn>;

const ok = (body: unknown) => () => Response.json(body);
const status = (code: number) => () => new Response(null, { status: code });

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  routes = {
    "GET /api/admin/auth/me": ok({ user: USER }),
    "GET /api/admin/inquiries": ok({ inquiries: [summary({})] }),
    [`GET /api/admin/inquiries/${ID}`]: ok({ inquiry: detail }),
  };
  fetchMock = vi.fn(async (url: string, init: RequestInit = {}) => {
    const key = `${init.method ?? "GET"} ${url}`;
    const route = routes[key];
    if (!route) throw new Error(`Unexpected request: ${key}`);
    return route(init);
  });
  vi.stubGlobal("fetch", fetchMock);
});

describe("admin sign-in", () => {
  it("shows the Microsoft sign-in, returning to the page that was asked for", async () => {
    routes["GET /api/admin/auth/me"] = status(401);
    renderAt(`/admin/inquiries/${ID}?error=signin`);

    const button = await screen.findByRole("link", { name: "Sign in with Microsoft" });
    expect(button).toHaveAttribute(
      "href",
      `/api/admin/auth/login?returnTo=${encodeURIComponent(`/admin/inquiries/${ID}`)}`,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Sign-in didn't work/);
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
  });

  it("falls back to sign-in when the session expires mid-use", async () => {
    routes["GET /api/admin/inquiries"] = status(401);
    renderAt("/admin");

    expect(await screen.findByRole("link", { name: "Sign in with Microsoft" })).toBeInTheDocument();
  });
});

describe("inquiry list", () => {
  it("lists inquiries and filters by status", async () => {
    routes["GET /api/admin/inquiries?status=closed"] = ok({ inquiries: [] });
    renderAt("/admin");

    expect(await screen.findByRole("link", { name: "Lopez Bakery" })).toHaveAttribute(
      "href",
      `/admin/inquiries/${ID}`,
    );
    expect(screen.getByText(USER.name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Closed" }));
    expect(await screen.findByText("No closed inquiries.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Closed" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("inquiry detail", () => {
  it("previews each document from S3 and offers a download", async () => {
    renderAt(`/admin/inquiries/${ID}`);

    expect(await screen.findByRole("heading", { name: "Lopez Bakery" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ana@example.com" })).toHaveAttribute(
      "href",
      "mailto:ana@example.com",
    );
    expect(screen.getByText("Contract renews in March.")).toBeInTheDocument();

    expect(screen.getByTitle("June bill.pdf")).toHaveAttribute("src", detail.files[0].viewUrl);
    expect(screen.getByAltText("meter.png")).toHaveAttribute("src", detail.files[1].viewUrl);
    const downloads = screen.getAllByRole("link", { name: "Download" });
    expect(downloads[0]).toHaveAttribute("href", detail.files[0].downloadUrl);
    expect(screen.getByText(/This file has expired/)).toBeInTheDocument();
  });

  it("explains an inquiry that no longer exists", async () => {
    routes[`GET /api/admin/inquiries/${ID}`] = status(404);
    renderAt(`/admin/inquiries/${ID}`);

    expect(await screen.findByText(/This inquiry no longer exists/)).toBeInTheDocument();
  });

  it("deletes after confirmation and returns to the list", async () => {
    routes[`DELETE /api/admin/inquiries/${ID}`] = status(204);
    renderAt(`/admin/inquiries/${ID}`);
    await screen.findByRole("heading", { name: "Lopez Bakery" });

    fireEvent.click(screen.getByRole("button", { name: "Delete inquiry" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("and its 3 files");
    expect(fetchMock).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: "DELETE" }));

    await act(async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/admin/inquiries/${ID}`,
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
    expect(await screen.findByRole("heading", { name: "Inquiries" })).toBeInTheDocument();
  });
});
