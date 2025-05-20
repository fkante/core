import {
  FaClipboardList,
  FaHome,
  FaList,
  FaPaintBrush,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import { useEffect, useState } from "react";

import { DesktopLayout } from "./DesktopLayout";
import { MobileMainLayout } from "./MobileMainLayout";

export interface NavLink {
  icon: React.ElementType;
  text: string;
  target: string;
  alt?: Array<string>;
}

export const userLinks: Array<NavLink> = [
  { icon: FaHome, text: "Home", target: "/", alt: ["/"] },
  { icon: FaClipboardList, text: "Briefs", target: "/brief", alt: ["/brief"] },
  {
    icon: FaPaintBrush,
    text: "My projects",
    target: "/project",
    alt: ["/project"],
  },
];

export const adminLinks: Array<NavLink> = [
  {
    icon: FaList,
    text: "Briefs",
    target: "/admin/brief",
    alt: ["/admin/brief"],
  },
  {
    icon: FaPaintBrush,
    text: "Submissions",
    target: "/admin/project",
    alt: ["/admin/project"],
  },
  {
    icon: FaSearch,
    text: "Content Catalogue",
    target: "/admin/content",
    alt: ["/admin/content"],
  },
  {
    icon: FaUsers,
    text: "Kreators",
    target: "/admin/user",
    alt: ["/admin/user"],
  },
];

export const checkIsActive = (
  linkTarget: string,
  linkAlt: Array<string> | undefined,
  currentPathname: string
): boolean => {
  if (currentPathname === linkTarget) return true;
  if (linkAlt?.some((alt) => currentPathname.startsWith(alt) && alt !== "/"))
    return true;
  if (linkTarget === "/" && currentPathname === "/") return true;
  if (linkTarget !== "/" && currentPathname.startsWith(linkTarget)) return true;

  return false;
};

export function MainLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    function isMobileDevice() {
      const userAgent =
        navigator.userAgent || window.navigator.userAgent
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(userAgent);
    }

    function checkScreenOrientation() {
      const isMobileLocal = window.innerWidth < 768 || isMobileDevice();
      setIsMobile(isMobileLocal);

      if (isMobileLocal) {
        setIsLandscape(window.innerWidth > window.innerHeight);
      } else {
        setIsLandscape(false);
      }
    }

    checkScreenOrientation();
    window.addEventListener("resize", checkScreenOrientation);
    return () => window.removeEventListener("resize", checkScreenOrientation);
  }, []);

  const disableForLandscape = isMobile && isLandscape;
  if (disableForLandscape) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50 p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Please rotate your device</h2>
          <p className="text-gray-600">
            This website is designed to be used in portrait mode for the best experience.
          </p>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return <DesktopLayout />;
  }

  return <MobileMainLayout />;
}
