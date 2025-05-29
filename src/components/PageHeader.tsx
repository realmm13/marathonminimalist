"use client";
import { type ReactNode, useState } from "react";
import { LucideMenu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { type ReactFC } from "@/lib/utils";
import { CustomButton } from "@/components/CustomButton";
import { BottomDrawer } from "@/components/BottomDrawer";

export interface PageHeaderClassNames {
  root?: string;
  container?: string;
  leftSide?: string;
  middle?: string;
  rightSide?: string;
  menuButton?: string;
  pastScrolled?: string;
}

export interface PageHeaderProps {
  leftSide?: ReactNode;
  middle?: ReactNode;
  classNames?: PageHeaderClassNames;
  height?: number;
  fixedOnScroll?: boolean;
  renderRightSide?: (props: {
    menuButton: ReactNode;
    bottomDrawer: (children: ReactNode) => ReactNode;
  }) => ReactNode;
}

export const PageHeader: ReactFC<PageHeaderProps> = ({
  leftSide,
  middle,
  classNames,
  renderRightSide,
  height = 80,
  fixedOnScroll = false,
}) => {
  const isScrolled = useScrolledPast(height);
  const [isOpen, setIsOpen] = useState(false);

  const menuButton = (
    <CustomButton
      variant="ghost"
      leftIcon={LucideMenu}
      className={cn("hover-lift focus-ring", classNames?.menuButton)}
      aria-label="Menu"
      iconSize={20}
    />
  );

  const bottomDrawer = (children: ReactNode) => (
    <BottomDrawer open={isOpen} onOpenChange={setIsOpen} trigger={menuButton}>
      {children}
    </BottomDrawer>
  );

  const applyFixed = fixedOnScroll ? isScrolled : false;

  return (
    <div
      style={{
        height: height,
      }}
      className={cn(
        "z-30 flex w-full items-center justify-center",
        "backdrop-blur-xl transition-all duration-300",
        "text-foreground/80",
        {
          "r-0 dark:bg-background/80 fixed top-0 left-0 shadow-lg border-b border-border/50": applyFixed,
        },
        classNames?.root,
      )}
      data-scrolled={isScrolled ? "true" : "false"}
    >
      <div
        className={cn(
          "flex w-full max-w-[1200px] items-center justify-between px-4 py-3 transition-all duration-200",
          {
            "px-6": applyFixed,
          },
          classNames?.container,
        )}
      >
        <div className={cn("flex-1 animate-fade-in-up", classNames?.leftSide)}>{leftSide}</div>

        {middle && (
          <div className={cn("flex-1 text-center animate-fade-in-up", classNames?.middle)} style={{ animationDelay: '0.1s' }}>
            {middle}
          </div>
        )}

        <div className={cn("flex flex-1 justify-end animate-fade-in-up", classNames?.rightSide)} style={{ animationDelay: '0.2s' }}>
          {renderRightSide?.({ menuButton, bottomDrawer })}
        </div>
      </div>
    </div>
  );
};
