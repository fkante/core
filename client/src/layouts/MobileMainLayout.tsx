import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { FaUser } from "react-icons/fa"
import { adminLinks, checkIsActive, userLinks } from "./MainLayout";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/authContext";

export function MobileMainLayout() {
  const { user, isLoading, logout } = useAuth();
  const { location } = useRouterState();
  const navigate = useNavigate();
  const currentPathname = location.pathname;

  const isAdmin =
    !isLoading && !!user && (user.email.includes("kovalee.app") || false);
  const links = isAdmin ? adminLinks : userLinks;

  if (isLoading) {
    return <div>Loading user information...</div>;
  }
  return (
    <div className="flex h-screen w-full flex-col bg-slate-100">
      <div className="flex w-full flex-1 flex-col bg-background text-normal">
        {/* No header for mobile */}
        {/* Main content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 pb-16">
          <main className="size-full px-4 py-4">
            <Outlet />
          </main>
        </div>

        {/* Bottom navigation bar */}
        <div className="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around shadow rounded-full m-2">
          {links.map((link) => {
            const isActive = checkIsActive(link.target, link.alt, currentPathname);
            const IconComponent = link.icon;
            return (
              <Link
                key={link.target}
                to={link.target}
                className="flex flex-col items-center"
                activeProps={{ className: "text-primary" }}
                preload="intent"
              >
                <IconComponent
                  size={22}
                  className={cn(
                    isActive
                      ? "text-primary"
                      : "text-gray-400"
                  )}
                />
                <span className={cn(
                  "text-xs mt-1",
                  isActive ? "text-primary font-semibold" : "text-gray-500"
                )}>
                  {link.text}
                </span>
              </Link>
            );
          })}

          {/* User profile button on mobile */}
          {user && (
            <div
              className="flex flex-col items-center"
              onClick={() => {
                if (window.confirm('Do you want to logout?')) {
                  logout().then(() => navigate({ to: "/login", replace: true }));
                }
              }}
            >
              <FaUser size={22} className="text-gray-400" />
              <span className="text-xs mt-1 text-gray-500">Profile</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
