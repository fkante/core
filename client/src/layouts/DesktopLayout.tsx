import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { adminLinks, checkIsActive, userLinks } from "./MainLayout";

import LogoKreator from "@/assets/LogoKreator";
import Profile from "@/components/Profile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/authContext";

export function DesktopLayout() {
  const { user, isLoading, logout } = useAuth();
  const { location } = useRouterState();
  const currentPathname = location.pathname;

  const isAdmin =
    !isLoading && !!user && (user.email.includes("kovalee.app") || false);
  const links = isAdmin ? adminLinks : userLinks;

  if (isLoading) {
    return <div>Loading user information...</div>;
  }
  return (
    <div className="flex h-screen w-full justify-center bg-slate-100">
      <div className="flex w-full flex-col bg-background text-normal">
        <div className="grid h-full w-full grid-cols-[14rem_1fr] gap-0">
          <div className="flex h-full w-56 flex-col justify-between border-r border-zinc-200 bg-white">
            <div className="justify-top flex size-full flex-col gap-1 pt-6">
              <div className="mb-6 flex items-center justify-center px-4">
                <LogoKreator className="h-8" />
              </div>
              {links.map((link) => {
                const isActive = checkIsActive(
                  link.target,
                  link.alt,
                  currentPathname
                );
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.target}
                    to={link.target}
                    className={cn(
                      "group flex h-10 items-center gap-4 font-medium transition-colors duration-150 ease-in-out",
                      isActive
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-800"
                    )}
                    activeProps={{ className: "!text-primary font-semibold" }}
                    preload="intent"
                  >
                    <div
                      className={cn(
                        "h-full w-1.5 rounded-r-lg transition-colors duration-150 ease-in-out [view-transition-name:sidebar-item]",
                        isActive ? "bg-primary" : "bg-transparent"
                      )}
                    />
                    <IconComponent
                      size={20}
                      className={cn(
                        isActive
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                    <span
                      className={cn(
                        "text-secondary group-hover:text-gray-900",
                        isActive ? "font-semibold" : ""
                      )}
                    >
                      {link.text}
                    </span>
                  </Link>
                );
              })}
            </div>
            {user && (
              <div className="flex flex-col gap-4 p-2">
                <div className="h-px w-full bg-zinc-200" />
                <Profile logout={logout} user={user} />
              </div>
            )}
          </div>
          <div className="flex h-full w-full flex-col overflow-y-auto bg-slate-50">
            <main className="size-full px-6 py-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
