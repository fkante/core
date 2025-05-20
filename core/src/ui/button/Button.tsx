import React from "react";

import type { Icon } from "../types";

type ButtonStyle = {
  warning?: boolean;
  gray?: boolean;
  dark?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  rounded?: boolean;
  size: "xs" | "sm" | "md" | "lg" | "xl";
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  dark?: boolean;
  gray?: boolean;
  leadingIcon?: Icon;
  rounded?: boolean;
  secondary?: boolean;
  size: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  trailingIcon?: Icon;
  warning?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Button(props: Props) {
  const {
    children,
    dark = false,
    gray,
    leadingIcon,
    rounded = false,
    secondary = false,
    size,
    text,
    trailingIcon,
    warning,
    disabled,
    className: classNameProp,
    ...rest
  } = props;

  function getBackground({
    warning,
    secondary,
    gray,
    dark,
  }: Partial<ButtonStyle>) {
    if (warning) return "bg-red-600";
    if ((secondary || gray) && dark) return "bg-white/10";
    if (secondary || gray) return "bg-white";
    if (dark) return "bg-primary/10";
    return "bg-primary";
  }

  function getTextColor({ gray, secondary, dark }: Partial<ButtonStyle>) {
    if (gray) return "text-secondary";
    if (secondary) return "text-primary";
    if (dark) return "text-white";
    return "text-white";
  }

  function getHoverBackground({
    gray,
    warning,
    secondary,
    dark,
    disabled,
  }: Partial<ButtonStyle>) {
    if (gray) return "hover:bg-gray/30";
    if (warning) return "hover:bg-red-400";
    if (secondary) return "hover:opacity-70";
    if (dark) return "hover:bg-primary/10";
    if (disabled) return "";
    return "hover:opacity-70";
  }

  function getSize(size: "xs" | "sm" | "md" | "lg" | "xl") {
    switch (size) {
      case "xs":
        return "px-2 py-1 text-xs gap-2 border-1";
      case "sm":
        return "px-2 py-1 text-sm gap-2 border-1";
      case "md":
        return "px-2.5 py-1.5 text-md gap-3 border-2";
      case "lg":
        return "px-3 py-2 text-lg gap-4 border-2";
      case "xl":
        return "px-3.5 py-2.5 text-xl gap-4 border-2";
    }
  }

  function getBorderColor({ gray }: Partial<ButtonStyle>) {
    if (gray) return "!border-secondary/20";
    return "";
  }

  function getButtonStyle({
    size,
    dark,
    secondary,
    gray,
    warning,
    disabled,
    rounded,
  }: ButtonStyle) {
    const background = getBackground({ warning, secondary, gray, dark });
    const borderColor = getBorderColor({ gray });
    const textColor = getTextColor({ gray, secondary, dark });
    const hoverBackground = getHoverBackground({
      gray,
      warning,
      secondary,
      dark,
      disabled,
    });
    const focus =
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60";
    const sizeClass = getSize(size);
    const className = `inline-flex size-full items-center justify-center font-semibold shadow-sm transition duration-150 ${
      !secondary && focus
    } ${background} ${hoverBackground} ${
      rounded ? "rounded-full" : "rounded-md"
    } ${sizeClass} ${textColor} ${borderColor} ${
      disabled ? "cursor-not-allowed opacity-50" : ""
    } ${classNameProp || ""}`;
    return className;
  }

  const buttonStyle = getButtonStyle({
    size,
    dark,
    secondary,
    gray,
    warning,
    disabled,
    rounded,
  });

  return (
    <button className={buttonStyle} disabled={disabled} {...rest}>
      {leadingIcon ? (
        <img
          src={leadingIcon.src}
          alt={leadingIcon.alt}
          className={leadingIcon.class}
        />
      ) : null}
      {text}
      {children}
      {trailingIcon ? (
        <img
          src={trailingIcon.src}
          alt={trailingIcon.alt}
          className={trailingIcon.class}
        />
      ) : null}
    </button>
  );
}
