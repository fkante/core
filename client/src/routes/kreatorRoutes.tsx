import { createRoute } from "@tanstack/react-router";
import { authRoute, authenticatedRoute } from ".";

import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import HomePage from "@/features/core/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { SignInPage } from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/auth/pages/SignUpPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";

// --- Other Authenticated Routes (Examples) ---
const homeRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/",
  component: HomePage,
});

const briefIndexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/brief",
  component: () => <div>Briefs Page (Authenticated)</div>,
});
const projectIndexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/project",
  component: () => <div>Projects Page (Authenticated)</div>,
});

// --- Unauthenticated Routes ---
const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/login",
  component: LoginPage,
});

const signInRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/sign-in",
  component: SignInPage,
});

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/sign-up",
  component: SignUpPage,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/verify-email",
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string,
    email: search.email as string,
  }),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/reset-password",
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string,
    email: search.email as string,
  }),
});

export {
  homeRoute,
  briefIndexRoute,
  projectIndexRoute,
  loginRoute,
  signInRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  verifyEmailRoute,
};
