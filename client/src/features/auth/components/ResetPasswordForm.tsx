import { useNavigate, useSearch } from "@tanstack/react-router";

import Button from "@kovalee/core/ui/button/Button.tsx";
import Input from "@kovalee/core/ui/input/Input.tsx";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ResetPasswordForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { token, email } = useSearch({ from: "/_auth/reset-password" });

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      setApiError(null);

      if (!token || !email) {
        setApiError("Invalid reset link. Please request a new password reset.");
        return;
      }

      if (value.password !== value.confirmPassword) {
        setApiError("Passwords do not match");
        return;
      }

      try {
        await api.post("/auth/reset-password", {
          token,
          email,
          password: value.password,
        });
        setIsSubmitted(true);
      } catch (err: any) {
        console.error("Password reset error:", err);
        setApiError(err.message || "Failed to reset password. Please try again.");
      }
    },
  });

  if (!token || !email) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div>
              <p className="text-sm font-medium text-red-800">
                Invalid reset link. Please request a new password reset.
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => navigate({ to: "/forgot-password" })}
          className="w-full"
        >
          Go to Forgot Password
        </Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div>
              <p className="text-sm font-medium text-green-800">
                Your password has been reset successfully.
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
          Sign in with your new password
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
        Create a new password for your account.
      </p>
      <form.Field
        name="password"
        children={(field) => (
          <div className="w-full">
            <Input
              type="password"
              label="New Password"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter your new password"
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
        name="confirmPassword"
        children={(field) => (
          <div className="w-full">
            <Input
              type="password"
              label="Confirm Password"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Confirm your new password"
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
        Reset Password
      </Button>
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
