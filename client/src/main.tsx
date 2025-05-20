import "./styles.css";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";

import { RouterProvider, createRouter } from "@tanstack/react-router";

import { AuthProvider } from "./providers/authContext";
import RootProvider from "./providers/index.tsx";
import { getContext } from "./providers/query.tsx";
import routeTree from "./routes/route.tree.ts";

// --- Centralized Loading Component ---
function GlobalPendingIndicator() {
  return (
    <div className="fixed left-0 top-0 z-[9999] h-1 w-full animate-pulse bg-blue-500"></div>
  );
}


interface RouterContext {
  queryClient: ReturnType<typeof getContext>["queryClient"];
  auth: { userId?: string; isAuthenticated: boolean } | null;
}


const router = createRouter({
  routeTree,
  context: {
    ...getContext(),
    auth: null,
  } as RouterContext,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: GlobalPendingIndicator,
  defaultPendingMs: 300,
  defaultPendingMinMs: 500,
  defaultViewTransition: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
    context: RouterContext;
  }
}

// Render the app
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
        <RootProvider>
          {/* Contains QueryClientProvider, TRPCProvider */}
          <RouterProvider router={router} />
        </RootProvider>
      </AuthProvider>
    </StrictMode>
  );
}
