import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import { PageSpinner } from "./components/page-spinner";
import { ApiError } from "./lib/api";
import { installConsoleWarningFilter } from "./lib/console-warning-filter";
import { initErrorCapture } from "./lib/error-capture";
import { installWatchAutoplayIntent } from "./lib/watch-autoplay-intent";
import { routeTree } from "./routeTree.gen";

installConsoleWarningFilter();
initErrorCapture();
installWatchAutoplayIntent();

const router = createRouter({
  routeTree,
  defaultPendingComponent: PageSpinner,
  scrollRestoration: true,
});
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => {
        if (error instanceof ApiError) {
          if (error.status === 429) return count < 2;
          if (error.status >= 400 && error.status < 500) return false;
        }
        return count < 3;
      },
      retryDelay: (attempt) => Math.min(300 * 2 ** attempt, 1500),
    },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
