import { Outlet } from "@tanstack/react-router";
import LogoKreator from "@/assets/LogoKreator";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen ">
      <div className="flex h-[100vh] w-full grow overflow-hidden">
        <div className="w-0 shrink-0 overflow-hidden transition-all duration-300 ease-in-out sm:w-1/3">
          <img
            className="h-full w-full object-cover"
            src="/no_auth_background.png"
            alt="Kreator background"
          />
        </div>
        <div className="flex w-full flex-col items-center justify-center p-8 sm:w-2/3 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-4 flex w-full justify-center">
              <LogoKreator className="h-10 [view-transition-name:logo-kreator]" />
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
