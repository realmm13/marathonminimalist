import * as React from "react";
import { tv } from "tailwind-variants";
import { cn, processColor, type ReactFC } from "@/lib/utils";

const badge = tv({
  base: "flex items-center justify-center gap-1.5 rounded-md font-semibold transition-all duration-200 hover:scale-105",
  variants: {
    variant: {
      default:
        "bg-(--badge-color)/20 text-(--badge-color) dark:bg-(--badge-dark-color)/20 dark:text-(--badge-dark-color) shadow-sm hover:shadow-md",
      outline:
        "bg-(--badge-color)/10 border-1 border-(--badge-color)/30 text-(--badge-color) dark:bg-(--badge-dark-color)/10 dark:border-(--badge-dark-color)/30 dark:text-(--badge-dark-color) hover:bg-(--badge-color)/20 dark:hover:bg-(--badge-dark-color)/20",
      ghost:
        "text-(--badge-color) hover:bg-(--badge-color)/10 dark:text-(--badge-dark-color) dark:hover:bg-(--badge-dark-color)/10 hover:shadow-sm",
      enhanced:
        "badge-enhanced bg-(--badge-color)/15 text-(--badge-color) dark:bg-(--badge-dark-color)/15 dark:text-(--badge-dark-color) backdrop-blur-sm border border-(--badge-color)/20 dark:border-(--badge-dark-color)/20",
      success:
        "badge-success bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/20",
      warning:
        "badge-warning bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20",
      info:
        "badge-info bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20",
      error:
        "badge-error bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20",
    },
    size: {
      xs: "px-1.5 py-[2px] text-[9px] caption",
      sm: "px-2 py-0.5 caption",
      md: "px-2.5 py-1 body-xs",
      lg: "px-3 py-1 body-small",
      xl: "px-3.5 py-1.5 body-small",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
});

export type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BadgeClassNames {
  root?: string;
  icon?: string;
}

const iconSizeMap: Record<BadgeSize, number> = {
  xs: 10,
  sm: 12,
  md: 12,
  lg: 14,
  xl: 14,
};

export interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  classNames?: BadgeClassNames;
  color: string;
  darkColor?: string;
  variant?: "default" | "outline" | "ghost" | "enhanced" | "success" | "warning" | "info" | "error";
  size?: BadgeSize;
  icon?: React.ElementType;
  iconSize?: number;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  leftSide?: React.ReactNode;
  rightSide?: React.ReactNode;
}

export const CustomBadge: ReactFC<CustomBadgeProps> = ({
  className,
  variant,
  size = "sm",
  color,
  darkColor = color,
  classNames = {},
  icon: Icon,
  iconSize,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftSide,
  rightSide,
  children,
  ...props
}) => {
  const finalColor = processColor(color);
  const finalDarkColor = processColor(darkColor);
  const defaultIconSize = iconSizeMap[size];
  const finalIconSize = iconSize ?? defaultIconSize;

  const style = {
    "--badge-color": `var(--color-${finalColor})`,
    "--badge-dark-color": `var(--color-${finalDarkColor ?? finalColor})`,
  } as React.CSSProperties;

  const renderIcon = (
    IconComponent: React.ElementType | undefined,
    className?: string,
  ) =>
    IconComponent && (
      <IconComponent
        size={finalIconSize}
        className={cn(classNames.icon, "shrink-0 transition-transform duration-200 group-hover:scale-110", className)}
      />
    );

  return (
    <div
      style={style}
      className={cn(badge({ variant, size }), "group focus-ring", className, classNames.root)}
      {...props}
    >
      {leftSide || renderIcon(LeftIcon)}
      {Icon ? renderIcon(Icon) : children}
      {rightSide || renderIcon(RightIcon)}
    </div>
  );
};
