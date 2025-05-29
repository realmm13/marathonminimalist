"use client";

import { ReactNode } from "react";
import { useKitzeUI } from "@/components/KitzeUIContext";
import { TrainingNavigation } from "./TrainingNavigation";
import { TrainingMobileNav } from "./TrainingMobileNav";
import { cn } from "@/lib/utils";

interface TrainingLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showNavigation?: boolean;
  className?: string;
}

export function TrainingLayout({
  children,
  title,
  description,
  showNavigation = true,
  className
}: TrainingLayoutProps) {
  const { isMobile } = useKitzeUI();

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Navigation */}
      {showNavigation && (
        <div className="border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="container mx-auto px-4">
            {isMobile ? (
              <div className="flex items-center justify-between py-4 animate-fade-in-up">
                <TrainingMobileNav />
              </div>
            ) : (
              <TrainingNavigation className="py-4 animate-fade-in-up" />
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Page Header */}
        {(title || description) && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {title && <h1 className="heading-1 gradient-text mb-2">{title}</h1>}
            {description && (
              <p className="body-large text-muted-foreground/80">{description}</p>
            )}
          </div>
        )}

        {/* Page Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {children}
        </div>
      </main>
    </div>
  );
} 