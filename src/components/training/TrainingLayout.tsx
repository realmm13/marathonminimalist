"use client";

import { ReactNode } from "react";
import { useKitzeUI } from "@/components/KitzeUIContext";
import { TrainingNavigation } from "./TrainingNavigation";
import { TrainingMobileNav } from "./TrainingMobileNav";
import { TrainingBreadcrumb } from "./TrainingBreadcrumb";
import { cn } from "@/lib/utils";

interface TrainingLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumb?: boolean;
  showNavigation?: boolean;
  className?: string;
}

export function TrainingLayout({
  children,
  title,
  description,
  showBreadcrumb = true,
  showNavigation = true,
  className
}: TrainingLayoutProps) {
  const { isMobile } = useKitzeUI();

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Navigation */}
      {showNavigation && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4">
            {isMobile ? (
              <div className="flex items-center justify-between py-4">
                <TrainingMobileNav />
              </div>
            ) : (
              <TrainingNavigation className="py-4" />
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {showBreadcrumb && <TrainingBreadcrumb className="mb-6" />}
        
        {/* Page Header */}
        {(title || description) && (
          <div className="mb-8">
            {title && <h1 className="text-3xl font-bold mb-2">{title}</h1>}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
} 