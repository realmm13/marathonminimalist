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
        className={cn("flex flex-col space-y-2 animate-fade-in-up", className)}
        role="navigation"
        aria-label="Training navigation"
      >
        {trainingLinks.map((link, index) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <div key={link.href} className="animate-slide-down" style={{ animationDelay: `${index * 50}ms` }}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 body-small font-medium transition-all duration-200",
                  "focus-ring hover-lift group",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                aria-current={active ? "page" : undefined}
                aria-label={`${link.label}${active ? " (current page)" : ""}`}
              >
                {Icon && (
                  <div className={cn(
                    "transition-all duration-200 group-hover:scale-110",
                    active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                  )}>
                    <Icon size={18} aria-hidden="true" />
                  </div>
                )}
                <span className="transition-all duration-150 group-hover:translate-x-[1px]">{link.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    );
  }

  if (variant === "compact") {
    return (
      <nav 
        className={cn("flex items-center space-x-2 animate-fade-in-up", className)}
        role="navigation"
        aria-label="Training navigation"
      >
        {trainingLinks.map((link, index) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <div key={link.href} className="animate-slide-down" style={{ animationDelay: `${index * 50}ms` }}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center justify-center rounded-lg p-3 transition-all duration-200",
                  "focus-ring hover-lift group",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={link.label}
                aria-current={active ? "page" : undefined}
                aria-label={`${link.label}${active ? " (current page)" : ""}`}
              >
                {Icon && (
                  <div className="transition-all duration-200 group-hover:scale-110">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                )}
              </Link>
            </div>
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
      <ul className="flex items-center gap-8" role="list">
        {trainingLinks.map((link, index) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <li key={link.href} role="listitem">
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "group relative flex cursor-pointer items-center gap-3 body-small font-medium transition-all duration-200",
                    "focus-ring rounded-lg px-3 py-2 hover-scale",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${link.label}${active ? " (current page)" : ""}`}
                >
                  <div className="flex items-center gap-3 transition-all duration-200">
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
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      role="presentation"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
} 