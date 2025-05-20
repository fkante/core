import SignUpForm from "../components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <h2 className="text-center text-3xl font-bold text-secondary [view-transition-name:login-title]">
        Sign up to your account
      </h2>
      <SignUpForm />
    </div>
  );
}
