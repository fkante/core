import LoginForm from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <div className="container mx-auto flex flex-col gap-6 p-4">
      <h2 className="text-center text-3xl font-bold text-secondary [view-transition-name:login-title]">
        Log in to your account
      </h2>
      <LoginForm />
    </div>
  );
}
