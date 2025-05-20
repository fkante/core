import ResetPasswordForm from "../components/ResetPasswordForm";

export function ResetPasswordPage() {
  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <h2 className="text-center text-3xl font-bold text-secondary [view-transition-name:login-title]">
        Reset your password
      </h2>
      <ResetPasswordForm />
    </div>
  );
}
