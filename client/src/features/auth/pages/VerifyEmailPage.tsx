import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import Button from "@kovalee/core/ui/button/Button";
import { env } from "@/env";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/verify-email" });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = search.token;
        const email = search.email;

        if (!token || !email) {
          setStatus("error");
          setMessage("Invalid verification link. Missing token or email.");
          return;
        }

        const response = await fetch(
          `${env.VITE_SERVER_URL}/auth/verify-email?token=${token}&email=${email}`
        );
        const data = await response.json();
        if (response.status !== 200) {
          throw new Error(data.message || "Failed to verify email. Please try again.");
        }
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to verify email. Please try again."
        );
      }
    };

    verifyEmail();
  }, [search]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-secondary">
          Email Verification
        </h2>
        {status === "loading" && (
          <div className="text-gray-600 mt-4">
            <p>Verifying your email...</p>
            <div className="mt-4 flex justify-center">
              <div className="border-gray-900 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
            </div>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-center">{message}</p>
            <Button
              size="md"
              onClick={() => navigate({ to: "/login" })}
            >
              Go to Login
            </Button>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4 text-red-600">
            <p className="text-center">{message}</p>
            <Button
              size="lg"
              onClick={() => navigate({ to: "/sign-up" })}
              warning={true}
            >
              Back to Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
