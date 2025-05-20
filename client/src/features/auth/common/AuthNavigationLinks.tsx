import { Link, useLocation } from "@tanstack/react-router";

export default function AuthNavigationLinks() {
  const location = useLocation();
  const isSignUp = location.pathname === "/sign-up";

  return (
    <div className="flex flex-col items-center justify-start gap-3">
      {!isSignUp && (
        <div className="flex justify-center gap-2 text-title text-gray [view-transition-name:sign-up-link]">
          <p className="text-secondary">Don't have an account yet?</p>
          <Link
            to="/sign-up"
            className="cursor-pointer font-semibold hover:underline"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
