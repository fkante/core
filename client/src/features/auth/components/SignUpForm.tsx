import { useState } from "react";

import Button from "@kovalee/core/ui/button/Button.tsx";
import Input from "@kovalee/core/ui/input/Input.tsx";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";

import AuthNavigationLinks from "../common/AuthNavigationLinks";
import { useAuth } from "@/providers/authContext";

export default function SignUpForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      if (value.password !== value.passwordConfirmation) {
        setApiError("Passwords do not match.");
        return;
      }
      try {
        await signup(value.email, value.password);
        setUserEmail(value.email);
        setVerificationEmailSent(true);
      } catch (err: any) {
        console.error("Sign-up error:", err);
        setApiError(err.message || "Sign up failed. Please try again.");
      }
    },
  });

  if (verificationEmailSent) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Email Verification Required</h1>
          <p className="text-gray-600 mt-4">
            We've sent a verification email to <strong>{userEmail}</strong>.
          </p>
          <p className="text-gray-600 mt-2">
            Please check your inbox and click the verification link to activate
            your account.
          </p>
          <p className="text-gray-500 mt-6 text-sm">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => navigate({ to: "/login" })}
        >
          Go to Login
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
                {field.state.meta.errors.join(", ")}
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
                {field.state.meta.errors.join(", ")}
              </em>
            ) : null}
          </div>
        )}
      />
      <form.Field
        name="passwordConfirmation"
        children={(field) => (
          <div className="w-full">
            <Input
              type="password"
              label="Confirm Password"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Confirm your password"
            />
            {field.state.meta.isTouched && field.state.meta.errors.length ? (
              <em className="text-xs text-red-600">
                {field.state.meta.errors.join(", ")}
              </em>
            ) : null}
            {form.state.values.password !== field.state.value &&
            form.state.values.passwordConfirmation &&
            field.state.meta.isTouched ? (
              <em className="text-xs text-red-600">Passwords do not match.</em>
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
        className="w-full [view-transition-name:main-sign-up-button]"
        disabled={
          isLoading ||
          form.state.values.password !== form.state.values.passwordConfirmation
        }
      >
        {isLoading ? "Signing up..." : "Sign up"}
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
