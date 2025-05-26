"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { trainingLinks } from "@/config/links";

interface TrainingBreadcrumbProps {
  className?: string;
  customItems?: Array<{
    label: string;
    href?: string;
  }>;
}

export function TrainingBreadcrumb({ 
  className, 
  customItems 
}: TrainingBreadcrumbProps) {
  const pathname = usePathname();

  // Build breadcrumb items
  const items = [];

  // Always start with Dashboard
  items.push({
    label: "Dashboard",
    href: "/app",
    isActive: pathname === "/app"
  });

  // Find current page in training links
  const currentPage = trainingLinks.find(link => {
    if (link.href === "/app") return false;
    return pathname.startsWith(link.href);
  });

  if (currentPage && pathname !== "/app") {
    items.push({
      label: currentPage.label,
      href: currentPage.href,
      isActive: true
    });
  }

  // Add custom items if provided
  if (customItems) {
    items.push(...customItems.map(item => ({
      ...item,
      isActive: !item.href
    })));
  }

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Home size={16} className="text-muted-foreground" />
      
      {items.map((item, index) => (
        <div key={item.href || item.label} className="flex items-center">
          {index > 0 && (
            <ChevronRight size={16} className="mx-2 text-muted-foreground" />
          )}
          
          {item.href && !item.isActive ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              item.isActive 
                ? "text-foreground font-medium" 
                : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
} 