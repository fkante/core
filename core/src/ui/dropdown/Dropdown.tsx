import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  menuButton: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  label?: React.ReactNode;
  elements: React.ReactNode[];
  anchor?:
    | "bottom"
    | "top"
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left";
}

export default function Dropdown(props: DropdownProps) {
  const { menuButton, label, elements, anchor = "top" } = props;
  function getSize() {
    switch (props.size) {
      case "xs":
        return "w-32";
      case "sm":
        return "w-40";
      case "md":
        return "w-56";
      case "lg":
        return "w-64";
      case "xl":
        return "w-72";
      default:
        return "w-56";
    }
  }
  const size = getSize();
  // Function to get positioning classes based on orientation
  function getPositionClasses(anchor: string) {
    switch (anchor) {
      case "bottom-left":
        return {
          position: "left-0 bottom-full mb-2",
          origin: "origin-bottom-left",
        };
      case "top-left":
        return {
          position: "left-0 mt-2",
          origin: "origin-top-left",
        };
      case "top":
      case "top-right":
        return {
          position: "right-0 mt-2",
          origin: "origin-top-right",
        };
      case "bottom":
      case "bottom-right":
        return {
          position: "right-0 bottom-full mb-2",
          origin: "origin-bottom-right",
        };
      default:
        return {
          position: "right-0 mt-2",
          origin: "origin-top-right",
        };
    }
  }

  const { position, origin } = getPositionClasses(anchor);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton>{menuButton}</MenuButton>
      </div>
      <MenuItems
        transition
        className={`absolute z-10 ${size} rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none ${position} ${origin} data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in`}
      >
        {label}
        {elements.map((child, index) => {
          if (child) {
            return <MenuItem key={index}>{child}</MenuItem>;
          }
        })}
      </MenuItems>
    </Menu>
  );
}
