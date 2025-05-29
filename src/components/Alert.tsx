"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface AlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  children?: React.ReactNode;
}

export const Alert = React.memo(
  ({
    open,
    onOpenChange,
    title = "Alert",
    description,
    variant = "default",
    children,
  }: AlertProps) => {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="card-enhanced backdrop-blur-xl border-border/50 shadow-2xl animate-scale-in">
          <AlertDialogHeader className="animate-fade-in-up">
            <AlertDialogTitle className="heading-4 gradient-text">{title}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="body-small text-muted-foreground/80 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="animate-fade-in-up gap-3" style={{ animationDelay: '0.2s' }}>
            {children}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);

Alert.displayName = "Alert";
