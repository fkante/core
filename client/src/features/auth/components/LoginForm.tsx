import Button from "@kovalee/core/ui/button/Button.tsx";
import { useNavigate } from "@tanstack/react-router";
import AuthNavigationLinks from "../common/AuthNavigationLinks";

export default function LoginForm() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 px-4">
      <div className="flex w-full flex-col items-center gap-4">
        <Button
          size="lg"
          className="[view-transition-name:main-sign-in-button]"
          onClick={() => {
            navigate({ to: "/sign-in" });
          }}
        >
          Sign in with an email
        </Button>
      </div>

      <AuthNavigationLinks />
    </div>
  );
}
