import { createRoute, redirect } from "@tanstack/react-router";
import { authenticatedRoute } from ".";
import * as authService from "@/services/authService";

// --- Admin Routes ---
const adminRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "admin",
  beforeLoad: async ({ location }) => {
    const user = await authService.getSession();

    const isAdmin = user?.email.includes("kovalee.app") ?? false;

    if (!isAdmin) {
      console.log("Redirecting non-admin from /admin check to /login");
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname + location.search },
        replace: true,
      });
    }
  },
});

// === Specific Page Routes ===

const adminBriefIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/brief",
  component: () => <div>Admin Briefs Page</div>,
});
const adminProjectIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/project",
  component: () => <div>Admin Projects Page</div>,
});
const adminContentIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/content",
  component: () => <div>Admin Content Page</div>,
});
const adminUserIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/user",
  component: () => <div>Admin Users Page</div>,
});

export {
  adminRoute,
  adminBriefIndexRoute,
  adminProjectIndexRoute,
  adminContentIndexRoute,
  adminUserIndexRoute,
};
