import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { AlertsPage } from "@/pages/AlertsPage";
import { AnalysisPage } from "@/pages/AnalysisPage";
import { HomePage } from "@/pages/HomePage";
import { WatchlistPage } from "@/pages/WatchlistPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.19 0.02 240)",
            border: "1px solid oklch(0.28 0.025 240)",
            color: "oklch(0.93 0.015 240)",
          },
        }}
      />
    </div>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analysis/$exchange/$symbol",
  component: AnalysisPage,
});

const watchlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/watchlist",
  component: WatchlistPage,
});

const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/alerts",
  component: AlertsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  analysisRoute,
  watchlistRoute,
  alertsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
