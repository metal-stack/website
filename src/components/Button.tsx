import React from "react";
import { twMerge } from "tailwind-merge";

export type ButtonStyle = "primary" | "neutral" | "black";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  as?: "button" | "a";
  href?: string;
  variant?: ButtonStyle;
  size?: ButtonSize;
  disabled?: boolean;
  invisibleDisabledState?: boolean;
  id?: string;
  name?: string;
  value?: string;
  type?: string;
  target?: React.HTMLAttributeAnchorTarget;
  className?: string;
  children?: React.ReactNode;
}

const baseStyles = `rounded-lg font-bold cursor-pointer whitespace-nowrap relative inline-block transition-all`;

const sizeStyles: Record<ButtonSize, string> = {
  md: "px-3 py-2",
  lg: "px-5 py-3",
};

const variantStyles: Record<ButtonStyle, string> = {
  primary:
    "bg-amber-500 hover:bg-amber-600 text-black hover:text-black disabled:bg-amber-50 disabled:border-amber-500/5",
  neutral:
    "bg-neutral-950 dark:bg-neutral-200 hover:dark:bg-white hover:bg-neutral-800 text-white dark:text-black disabled:bg-neutral-300 disabled:border-neutral-300/50 hover:disabled:bg-neutral-200 disabled:text-black/25",
  black: "bg-neutral-900 hover:bg-black text-white",
};

const disabledStyles =
  "disabled:cursor-not-allowed disabled:border-2 disabled:border-black/20 disabled:hover:text-opacity-50";

export const Button: React.FC<ButtonProps> = ({
  as = "button",
  href,
  variant = "primary",
  size = "md",
  disabled = false,
  invisibleDisabledState = false,
  id,
  name,
  value,
  type,
  target,
  className = "",
  children,
  ...rest
}) => {
  const Element = href ? "a" : as;

  const mergedClassName = twMerge(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    disabledStyles,
    className
  );

  const commonProps = {
    id,
    name,
    value,
    className: mergedClassName,
    ...(href ? { href, target } : {}),
    ...(Element === "button" ? { type: type || "button" } : {}),
    ...(invisibleDisabledState ? {} : { disabled }),
    ...rest,
  };

  return React.createElement(Element, commonProps, children);
};
