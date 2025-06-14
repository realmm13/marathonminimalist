"use client";
import * as React from "react";
import { cn, type ReactFC, type Size, processColor } from "@/lib/utils";
import { useLinkableComponent } from "@/hooks/useLinkableComponent";
import { ConditionalTooltip } from "@/components/ConditionalTooltip";
import { Spinner } from "@/components/Spinner";
import { tv } from "tailwind-variants";

type SizeStyle = {
  iconSize?: number;
};

export const sizeStyles: Record<Size, SizeStyle> = {
  xs: {
    iconSize: 14,
  },
  sm: {
    iconSize: 16,
  },
  md: {
    iconSize: 16,
  },
  lg: {
    iconSize: 20,
  },
  xl: {
    iconSize: 24,
  },
};

export const spinnerSizeMap: Record<Size, number> = {
  xs: 14,
  sm: 16,
  md: 16,
  lg: 20,
  xl: 24,
};

export const defaultIconSizes: Record<Size, number> = {
  xs: 14,
  sm: 16,
  md: 16,
  lg: 20,
  xl: 24,
};

export const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 ease-out cursor-pointer focus-ring active-press disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      filled:
        "bg-[var(--button-bg)] text-[var(--button-filled-text)] hover:opacity-90 shadow-sm hover:shadow-md hover:-translate-y-0.5",
      light:
        "bg-[var(--button-bg)]/10 text-[var(--button-bg)] hover:bg-[var(--button-bg)]/20 border border-[var(--button-bg)]/20 hover:border-[var(--button-bg)]/30",
      outline:
        "border border-[var(--button-bg)]/50 text-[var(--button-bg)] bg-transparent hover:bg-[var(--button-bg)]/10 hover:border-[var(--button-bg)]/70 hover:shadow-sm",
      ghost:
        "text-[var(--button-bg)] bg-transparent hover:bg-[var(--button-bg)]/10 hover:shadow-sm",
      link: "text-[var(--button-bg)] underline-offset-4 hover:underline hover:text-[var(--button-bg)]/80",
      gradient: "bg-gradient-to-r from-[var(--button-bg)] to-[var(--button-bg)]/80 text-[var(--button-filled-text)] shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:from-[var(--button-bg)]/90 hover:to-[var(--button-bg)]/70",
    },
    size: {
      xs: "text-xs h-7 px-2.5",
      sm: "text-sm h-9 px-3",
      md: "text-sm h-10 px-4",
      lg: "text-base h-12 px-5",
      xl: "text-lg h-14 px-6",
    },
    shape: {
      default: "rounded-lg",
      circle: "rounded-full!",
      pill: "rounded-full",
    },
    isIconButton: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "light",
      color: "secondary",
      class: "text-muted-foreground!",
    },
    {
      isIconButton: true,
      size: "xs",
      class:
        "min-h-7 min-w-7 h-7 w-7 max-h-7 max-w-7 flex items-center justify-center p-0",
    },
    {
      isIconButton: true,
      size: "sm",
      class:
        "min-h-9 min-w-9 h-9 w-9 max-h-9 max-w-9 flex items-center justify-center p-0",
    },
    {
      isIconButton: true,
      size: "md",
      class:
        "min-h-10 min-w-10 h-10 w-10 max-h-10 max-w-10 flex items-center justify-center p-0",
    },
    {
      isIconButton: true,
      size: "lg",
      class:
        "min-h-12 min-w-12 h-12 w-12 max-h-12 max-w-12 flex items-center justify-center p-0",
    },
    {
      isIconButton: true,
      size: "xl",
      class:
        "min-h-14 min-w-14 h-14 w-14 max-h-14 max-w-14 flex items-center justify-center p-0",
    },
    {
      variant: "filled",
      class: "shadow-[0_1px_3px_hsl(var(--button-bg)/0.3)] hover:shadow-[0_4px_12px_hsl(var(--button-bg)/0.4)]",
    },
    {
      variant: "gradient",
      class: "shadow-[0_2px_8px_hsl(var(--button-bg)/0.4)] hover:shadow-[0_6px_20px_hsl(var(--button-bg)/0.5)]",
    },
  ],
  defaultVariants: {
    variant: "filled",
    size: "md",
    shape: "default",
    isIconButton: false,
  },
});

// Add a custom type for button variants
export type ButtonVariantsProps = React.ComponentProps<
  typeof buttonVariants
> & {
  class?: string;
};

export type CustomButtonVariant =
  | "filled"
  | "light"
  | "outline"
  | "ghost"
  | "link"
  | "gradient";

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  variant?: CustomButtonVariant;
  color?: string;
  circle?: boolean;
  icon?: React.ElementType;
  iconSize?: number;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  leftSide?: React.ReactNode;
  rightSide?: React.ReactNode;
  loading?: boolean;
  href?: string;
  external?: boolean;
  as?: React.ElementType;
  tooltip?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  classNames?: {
    icon?: string;
    tooltip?: string;
  };
}

type ColorValue = {
  bg: string;
  text: string;
};

type ColorMap = {
  destructive: ColorValue;
  primary: ColorValue;
  secondary: ColorValue;
  [key: string]: ColorValue;
};

export const CustomButton: ReactFC<CustomButtonProps> = ({
  className,
  variant = "filled",
  size = "md",
  circle = false,
  color = "secondary",
  style,
  icon: Icon,
  iconSize,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftSide,
  rightSide,
  loading,
  children,
  classNames = {},
  href,
  external,
  disabled = false,
  as = "button",
  tooltip,
  ...props
}) => {
  const {
    Component = as,
    href: linkHref,
    linkProps,
  } = useLinkableComponent({ href, as, external, ...props });

  const finalColor = processColor(color);

  const colorMap: ColorMap = {
    destructive: {
      bg: "var(--color-destructive)",
      text: "var(--color-destructive-foreground)",
    },
    primary: {
      bg: "var(--color-primary)",
      text: "var(--color-primary-foreground)",
    },
    secondary: {
      bg: "var(--color-secondary)",
      text: "var(--color-secondary-foreground)",
    },
  };

  const buttonColors = colorMap[finalColor ?? ""] ?? {
    bg: `var(--color-${finalColor})`,
    text: "var(--color-default-foreground)",
  };

  //if size is not found in sizeStyles, throw an error
  if (!sizeStyles[size]) {
    throw new Error(`Invalid size: ${size}`);
  }

  const foundSizeStyle = sizeStyles[size] || sizeStyles.md;
  const defaultIconSize = foundSizeStyle.iconSize ?? defaultIconSizes[size];
  const finalIconSize = iconSize ?? defaultIconSize;
  const hasIcon = !!Icon || !!LeftIcon || !!RightIcon;
  const isIconOnly = circle || (!children && hasIcon);

  const renderIcon = (
    IconComponent: React.ElementType | undefined,
    className?: string,
  ) =>
    IconComponent && (
      <IconComponent
        size={finalIconSize}
        className={cn(classNames.icon, "shrink-0", className)}
      />
    );

  const buttonContent = loading ? (
    <>
      <Spinner size={size} className="shrink-0 text-current" />
      {!isIconOnly && <span className="truncate">{children}</span>}
    </>
  ) : (
    <>
      {leftSide || renderIcon(LeftIcon)}
      {Icon
        ? renderIcon(Icon)
        : children && <span className="truncate">{children}</span>}
      {rightSide || renderIcon(RightIcon)}
    </>
  );

  // Setup attributes based on the component type
  const buttonAttributes: any = {
    className: buttonVariants({
      variant,
      size,
      shape: circle ? "circle" : "default",
      isIconButton: isIconOnly,
      class: className,
    }),
    style: {
      "--button-bg": buttonColors.bg,
      "--button-text": buttonColors.text,
      "--button-filled-text":
        finalColor && finalColor in colorMap ? buttonColors.text : "white",
      ...style,
    } as React.CSSProperties,
    ...linkProps,
    ...props,
  };

  // Add specific attributes based on component type
  if (Component === "button") {
    buttonAttributes.disabled = disabled || loading;
  } else if (href) {
    buttonAttributes.href = href;
  }

  const button = <Component {...buttonAttributes}>{buttonContent}</Component>;

  return tooltip ? (
    <ConditionalTooltip
      content={typeof tooltip === 'string' ? tooltip : undefined}
      condition={typeof tooltip === 'string'}
      classNames={{ tooltip: classNames.tooltip }}
    >
      {button}
    </ConditionalTooltip>
  ) : (
    button
  );
};

CustomButton.displayName = "CustomButton";
