"use client";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthFormHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function AuthFormHeader({ title, description, className }: AuthFormHeaderProps) {
  return (
    <CardHeader className={cn("vertical center", className)}>
      <CardTitle className="text-center heading-3 gradient-text">{title}</CardTitle>
      {description && (
        <CardDescription className="text-center body-small text-muted-foreground">{description}</CardDescription>
      )}
    </CardHeader>
  );
}
