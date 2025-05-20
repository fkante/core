import { useState } from "react";
import Button from "@kovalee/core/ui/button/Button.tsx";
import Input from "@kovalee/core/ui/input/Input.tsx";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import AuthNavigationLinks from "../common/AuthNavigationLinks";
import { api } from "@/lib/api";

export default function ForgotPasswordForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        await api.post("/auth/forgot-password", { email: value.email });
        setIsSubmitted(true);
      } catch (err: any) {
        console.error("Password reset request error:", err);
        setApiError(err.message || "Failed to request password reset. Please try again.");
      }
    },
  });

  if (isSubmitted) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div>
              <p className="text-sm font-medium text-green-800">
                If an account with that email exists, we've sent a password reset link.
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => navigate({ to: "/sign-in" })}
          className="w-full"
        >
          Return to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex w-full flex-col items-center gap-4"
    >
      <p className="text-center text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>
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
      {apiError && (
        <p className="text-sm text-red-600" role="alert">
          {apiError}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full"
      >
        Send Reset Link
      </Button>
      <AuthNavigationLinks />
      <Button
        type="button"
        size="sm"
        secondary={true}
        onClick={() => {
          navigate({ to: "/sign-in" });
        }}
        className="w-full !shadow-none"
      >
        Back to Sign In
      </Button>
    </form>
  );
}
