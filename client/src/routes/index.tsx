
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

import { AuthLayout } from "@/layouts/AuthLayout";
import Header from "@/components/Header";
import { MainLayout } from "@/layouts/MainLayout";
import * as authService from "@/services/authService";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

// === Authentication Layout Route ===
export const authenticatedRoute = createRoute({
  id: "_authenticated",
  getParentRoute: () => rootRoute,
  component: MainLayout,
  beforeLoad: async ({ location }) => {
    const user = await authService.getSession();
    if (!user) {
      console.log(
        "Redirecting to /login from _authenticated check as no user session found."
      );
      throw redirect({
        to: "/login",
        search: {
          redirect: location.pathname + location.search,
        },
        replace: true,
      });
    }
  },
});

// === Unauthenticated Layout Route ===
export const authRoute = createRoute({
  id: "_auth",
  getParentRoute: () => rootRoute,
  component: AuthLayout,
  beforeLoad: async ({ location }) => {
    const user = await authService.getSession();
    if (user) {
      console.log("Redirecting authenticated user from _auth check to /");
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get("redirect") || "/";
      throw redirect({
        to: redirectUrl,
        replace: true,
      });
    }
  },
});
