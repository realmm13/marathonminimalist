"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { trainingLinks, type Link as LinkType } from "@/config/links";

interface TrainingNavigationProps {
  variant?: "horizontal" | "vertical" | "compact";
  className?: string;
}

export function TrainingNavigation({ 
  variant = "horizontal", 
  className 
}: TrainingNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  if (variant === "vertical") {
    return (
      <nav 
        className={cn("flex flex-col space-y-2", className)}
        role="navigation"
        aria-label="Training navigation"
      >
        {trainingLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-current={active ? "page" : undefined}
              aria-label={`${link.label}${active ? " (current page)" : ""}`}
            >
              {Icon && <Icon size={18} aria-hidden="true" />}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  if (variant === "compact") {
    return (
      <nav 
        className={cn("flex items-center space-x-1", className)}
        role="navigation"
        aria-label="Training navigation"
      >
        {trainingLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-center rounded-md p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={link.label}
              aria-current={active ? "page" : undefined}
              aria-label={`${link.label}${active ? " (current page)" : ""}`}
            >
              {Icon && <Icon size={18} aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Default horizontal variant
  return (
    <motion.nav
      className={cn("flex items-center justify-center", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      role="navigation"
      aria-label="Training navigation"
    >
      <ul className="flex items-center gap-6" role="list">
        {trainingLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <li key={link.href} role="listitem">
              <Link
                href={link.href}
                className={cn(
                  "group flex cursor-pointer items-center gap-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
                aria-label={`${link.label}${active ? " (current page)" : ""}`}
              >
                <div className="flex items-center gap-2 transition-all duration-200 group-hover:scale-105">
                  {Icon && (
                    <div className={cn(
                      "transform transition-all duration-200 group-hover:scale-110",
                      active 
                        ? "text-primary" 
                        : "text-muted-foreground group-hover:text-primary"
                    )}>
                      <Icon size={18} aria-hidden="true" />
                    </div>
                  )}
                  <span className={cn(
                    "transition-all duration-150 group-hover:translate-x-[1px]",
                    active && "font-semibold"
                  )}>
                    {link.label}
                  </span>
                </div>
                {active && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    role="presentation"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
} 