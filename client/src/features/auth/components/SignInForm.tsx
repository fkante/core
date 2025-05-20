import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import Button from "@kovalee/core/ui/button/Button.tsx";
import Input from "@kovalee/core/ui/input/Input.tsx";
import { useForm } from "@tanstack/react-form";
import AuthNavigationLinks from "../common/AuthNavigationLinks";
import { useAuth } from "@/providers/authContext";

export default function SignInForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        await login(value.email, value.password);
        await navigate({ to: "/", replace: true });
      } catch (err: any) {
        console.error("Sign-in error:", err);
        setApiError(err.message || "Sign in failed. Please try again.");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex w-full flex-col items-center gap-4"
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="w-full">
            <Input
              type="email"
              label="Email"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="you@example.com"
            />
            {field.state.meta.isTouched && field.state.meta.errors.length ? (
              <em className="text-xs text-red-600">
                {field.state.meta.errors[0]}
              </em>
            ) : null}
          </div>
        )}
      />
      <form.Field
        name="password"
        children={(field) => (
          <div className="w-full">
            <Input
              type="password"
              label="Password"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter your password"
            />
            {field.state.meta.isTouched && field.state.meta.errors.length ? (
              <em className="text-xs text-red-600">
                {field.state.meta.errors[0]}
              </em>
            ) : null}
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-secondary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        )}
      />
      {apiError && (
        <p className="text-sm text-red-600" role="alert">
          {apiError}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full [view-transition-name:main-sign-in-button]"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      <AuthNavigationLinks />
      <Button
        type="button"
        size="sm"
        secondary={true}
        onClick={() => {
          navigate({ to: "/login" });
        }}
        className="w-full !shadow-none"
      >
        Back to login options
      </Button>
    </form>
  );
}
