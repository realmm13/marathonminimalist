"use client";

import React from "react";
import { cn, type SelectOption } from "@/lib/utils";
import { tv, type VariantProps } from "tailwind-variants";
import { useKitzeUI } from "@/components/KitzeUIContext";
import { SimpleSelect, type SelectMobileViewType } from "@/components/SimpleSelect";
import { type LucideIcon } from "lucide-react";

export type SegmentedControlMobileViewType = "keep" | SelectMobileViewType;

export type SegmentedControlOption = {
  value: string;
  label: string;
  leftIcon?: LucideIcon; // Assuming Lucide icons
  rightIcon?: LucideIcon; // Assuming Lucide icons
  leftSide?: React.ComponentType<any>;
  rightSide?: React.ComponentType<any>;
  disabled?: boolean;
};

const segmentedControl = tv({
  base: "inline-flex items-center justify-start rounded-lg bg-muted/80 backdrop-blur-sm p-1 shadow-sm border border-border/50",
  variants: {
    size: {
      sm: "h-8",
      md: "h-10",
      lg: "h-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const segmentedItem = tv({
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-all duration-200 focus-ring cursor-pointer hover-lift disabled:pointer-events-none disabled:opacity-50 font-medium",
  variants: {
    size: {
      sm: "px-3 py-1.5 body-xs",
      md: "px-4 py-2 body-small",
      lg: "px-5 py-2.5 body-base",
    },
    active: {
      true: "bg-background text-foreground shadow-md border border-border/30 hover:bg-background",
      false: "text-muted-foreground hover:text-foreground hover:bg-background/50",
    },
  },
  defaultVariants: {
    size: "md",
    active: false,
  },
});

const iconSize = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export interface SegmentedControlProps
  extends VariantProps<typeof segmentedControl> {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  // Mobile specific props
  mobileView?: SegmentedControlMobileViewType;
  drawerTitle?: string;
  placeholder?: string;
}

export const SegmentedControl = ({
  options,
  value,
  onChange,
  className,
  tabClassName,
  activeTabClassName,
  size = "md",
  mobileView = "keep", // Default to keeping the segmented control on mobile
  drawerTitle = "Select an option",
  placeholder = "Select an option",
}: SegmentedControlProps) => {
  const { isMobile } = useKitzeUI();

  // Conditionally render SimpleSelect on mobile if mobileView is not 'keep'
  if (isMobile && mobileView !== "keep") {
    const selectOptions: SelectOption[] = options.map((option) => ({
      value: option.value,
      label: option.label,
      icon: option.leftIcon, // Use leftIcon for the select
      disabled: option.disabled,
    }));

    return (
      <SimpleSelect
        options={selectOptions}
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        className={className} // Apply main className to the select wrapper
        mobileView={mobileView} // Pass down 'native' or 'bottom-drawer'
        drawerTitle={drawerTitle}
        // Note: size, tabClassName, activeTabClassName are not directly applicable here
      />
    );
  }

  // Default rendering for desktop or when mobileView is 'keep'
  return (
    <div
      className={segmentedControl({ size, className })}
      role="tablist"
      aria-orientation="horizontal"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const LeftIcon = option.leftIcon;
        const RightIcon = option.rightIcon;
        const LeftSide = option.leftSide;
        const RightSide = option.rightSide;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            onClick={() => !option.disabled && onChange(option.value)}
            className={cn(
              segmentedItem({ size, active: isActive }),
              tabClassName,
              isActive && activeTabClassName,
            )}
            aria-selected={isActive}
            disabled={option.disabled}
          >
            {LeftSide && <LeftSide />}
            {LeftIcon && (
              <LeftIcon className={cn("mr-2", iconSize[size || "md"])} />
            )}
            {option.label}
            {RightIcon && (
              <RightIcon className={cn("ml-2", iconSize[size || "md"])} />
            )}
            {RightSide && <RightSide />}
          </button>
        );
      })}
    </div>
  );
};
