import { useEffect, useState } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Inbox, Loader2, LogOut } from "lucide-react";
import { Navigate, NavLink, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { adminApi, ApiError, isUnauthorized, type AdminUser } from "./api";
import InquiryDetail from "./InquiryDetail";
import InquiryList from "./InquiryList";

/**
 * Staff-only area at /admin. Loaded with React.lazy from App.tsx, so public
 * visitors never download it. English only, never indexed.
 *
 * Signed out is a normal state, not an error: `me` resolves to null and the
 * sign-in screen shows. If any later request gets a 401 (session expired),
 * `me` is reset to null and the same screen takes over.
 */
function useNoIndex() {
  useEffect(() => {
    // Overwrite rather than add: public pages leave an "index, follow" tag behind.
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    const previousRobots = meta.content;
    const previousTitle = document.title;
    meta.content = "noindex, nofollow";
    document.title = "Admin | Murillo Consulting";
    return () => {
      if (created) meta.remove();
      else meta.content = previousRobots;
      document.title = previousTitle;
    };
  }, []);
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 text-center shadow-card">
        {children}
      </div>
    </div>
  );
}

function SignIn() {
  const location = useLocation();
  const [params] = useSearchParams();
  const href = `/api/admin/auth/login?returnTo=${encodeURIComponent(location.pathname)}`;

  return (
    <Centered>
      <Logo variant="color" asLink={false} loading="eager" className="mx-auto" />
      <h1 className="mt-6 font-display text-xl font-bold text-primary">Admin sign-in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use your Murillo Consulting Microsoft account.
      </p>
      {params.get("error") === "signin" && (
        <p role="alert" className="mt-4 rounded-md bg-destructive-subtle px-3 py-2 text-sm text-destructive">
          Sign-in didn't work. Make sure you're using your @murilloconsulting.co account and that
          you've been given access to this app.
        </p>
      )}
      <Button asChild className="mt-6 w-full">
        <a href={href}>Sign in with Microsoft</a>
      </Button>
    </Centered>
  );
}

function Shell({ user }: { user: AdminUser }) {
  const queryClient = useQueryClient();
  const signOut = async () => {
    await adminApi.logout().catch(() => undefined);
    queryClient.setQueryData(["me"], null);
  };

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:flex-col lg:items-stretch lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <Logo variant="color" asLink={false} loading="eager" className="h-7 lg:h-8" />
        <nav className="flex-1 lg:mt-8" aria-label="Admin">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors lg:w-auto",
                isActive ? "bg-primary-subtle text-primary-subtle-foreground" : "text-foreground hover:bg-surface",
              )
            }
          >
            <Inbox className="h-4 w-4" aria-hidden="true" />
            Inquiries
          </NavLink>
        </nav>
        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:border-t lg:border-border lg:pt-4">
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="lg:mt-2 lg:justify-start">
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <Routes>
          <Route index element={<InquiryList />} />
          <Route path="inquiries/:id" element={<InquiryDetail />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Gate() {
  const me = useQuery({ queryKey: ["me"], queryFn: adminApi.me });

  if (me.isPending) {
    return (
      <Centered>
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </Centered>
    );
  }
  if (me.isError) {
    return (
      <Centered>
        <p role="alert" className="text-sm text-foreground">
          Could not reach the server.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => me.refetch()}>
          Try again
        </Button>
      </Centered>
    );
  }
  return me.data ? <Shell user={me.data} /> : <SignIn />;
}

const AdminApp = () => {
  useNoIndex();
  const [queryClient] = useState(() => {
    const onError = (error: unknown) => {
      if (isUnauthorized(error)) client.setQueryData(["me"], null);
    };
    const client: QueryClient = new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: {
        // API errors (401, 404, ...) are answers, not glitches; only retry network failures.
        queries: { retry: (count, error) => !(error instanceof ApiError) && count < 2 },
      },
    });
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider locale="en">
        <Gate />
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default AdminApp;
