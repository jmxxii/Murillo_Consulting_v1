import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteLayout from "@/components/layout/SiteLayout";
import LocaleRedirect from "@/components/layout/LocaleRedirect";
import Home from "@/pages/Home";
import CampaignPage from "@/pages/CampaignPage";
import NotFound from "@/pages/NotFound";
import Privacy from "@/pages/Privacy";

const queryClient = new QueryClient();

// Staff-only; a separate chunk so public visitors never download it.
const AdminApp = lazy(() => import("@/admin/AdminApp"));

/**
 * Routing.
 *
 *   /                      English homepage (default language)
 *   /campaigns/:slug       English campaign
 *   /es                    Spanish homepage
 *   /es/campaigns/:slug    Spanish campaign
 *   /privacy, /es/privacy  Privacy policy
 *   /admin/*               Staff inquiry review (English only, lazy-loaded)
 *
 * Each locale branch has its own <SiteLayout>, which supplies the language to
 * the whole subtree. The URL is authoritative: a link to /es always renders in
 * Spanish regardless of any stored preference.
 *
 * The Spanish branch is declared first so `/es` is not swallowed by the
 * English catch-all.
 */
const AppRoutes = () => (
  <Routes>
    <Route
      path="/admin/*"
      element={
        <Suspense fallback={null}>
          <AdminApp />
        </Suspense>
      }
    />

    <Route path="/es" element={<SiteLayout locale="es" />}>
      <Route index element={<Home />} />
      <Route path="campaigns/:slug" element={<CampaignPage />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="*" element={<NotFound />} />
    </Route>

    <Route path="/" element={<SiteLayout locale="en" />}>
      <Route
        index
        element={
          <LocaleRedirect>
            <Home />
          </LocaleRedirect>
        }
      />
      <Route path="campaigns/:slug" element={<CampaignPage />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
