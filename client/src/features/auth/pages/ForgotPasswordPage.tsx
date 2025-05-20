import ForgotPasswordForm from "../components/ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <h2 className="text-center text-3xl font-bold text-secondary [view-transition-name:login-title]">
        Forgot your password
      </h2>
      <ForgotPasswordForm />
    </div>
  );
}
