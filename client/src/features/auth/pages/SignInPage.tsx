import SignInForm from "../components/SignInForm";

export function SignInPage() {
  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <h2 className="text-center text-3xl font-bold text-secondary [view-transition-name:login-title]">
        Sign in to your account
      </h2>
      <SignInForm />
    </div>
  );
}
