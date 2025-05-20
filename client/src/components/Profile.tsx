import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from "@kovalee/core/ui/catalyst/dropdown.tsx";
import { FaChevronUp, FaCog, FaLightbulb, FaUser } from "react-icons/fa";

import { Avatar } from "@kovalee/core/ui/catalyst/avatar.tsx";
import { HiMiniArrowRightOnRectangle } from "react-icons/hi2";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import type { User } from "@/providers/authContext";

interface ProfileProps {
  logout: () => Promise<void>;
  user: User;
}

function Menu({ logout }: { logout: () => Promise<void> }) {
  const itemClasses = "gap-2 cursor-pointer hover:backdrop-blur-xl hover:bg-zinc-800/75";
  return (<DropdownMenu className="min-w-64" anchor="top start">
    <DropdownItem href="/my-profile" className={itemClasses}>
      <FaUser />
      <DropdownLabel>My profile</DropdownLabel>
    </DropdownItem>
    <DropdownItem href="/settings" className={itemClasses}>
      <FaCog />
      <DropdownLabel>Settings</DropdownLabel>
    </DropdownItem>
    <DropdownDivider />
    <DropdownItem className={itemClasses} onClick={() => {
      window.open("/terms-and-conditions.pdf", "_blank");
    }}>
      <IoShieldCheckmarkSharp />
      <DropdownLabel>Terms and conditions</DropdownLabel>
    </DropdownItem>
    <DropdownItem href="/share-feedback" className={itemClasses}>
      <FaLightbulb />
      <DropdownLabel>Share feedback</DropdownLabel>
    </DropdownItem>
    <DropdownDivider />
    <DropdownItem href="/login" className={itemClasses} onClick={() => {
      logout();
    }}>
      <HiMiniArrowRightOnRectangle />
      <DropdownLabel>Sign out</DropdownLabel>
    </DropdownItem>
  </DropdownMenu>
  )
}

export default function Profile({ logout, user }: ProfileProps) {
  return (
    <Dropdown>
      <DropdownButton>
        <div className="flex items-center gap-2">
        <span className="flex min-w-0 items-center gap-3">
          <Avatar src="/logo192.png" className="size-10" square alt="" />
          <span className="min-w-0">
            <span className="text-start block truncate text-sm/5 font-medium text-secondary">{user.name || "Test User"}</span>
            <span className="block truncate text-xs/5 font-normal text-zinc-500">
              {user.email}
            </span>
            </span>
          </span>
          <FaChevronUp className="text-secondary" />
        </div>
      </DropdownButton>
      <Menu logout={logout} />
    </Dropdown>
  )
}