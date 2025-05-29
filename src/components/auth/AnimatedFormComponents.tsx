"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedFormWrapperProps {
  className?: string;
  children: ReactNode;
}

export function AnimatedFormWrapper({
  className,
  children,
}: AnimatedFormWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          layout: { duration: 0.6, type: "spring", bounce: 0.2 },
          initial: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
        }}
        className="hover-lift"
      >
        <Card className="card-enhanced overflow-hidden shadow-lg">{children}</Card>
      </motion.div>
    </div>
  );
}

interface AnimatedFormHeaderProps {
  title: string;
  description: string;
}

export function AnimatedFormHeader({
  title,
  description,
}: AnimatedFormHeaderProps) {
  return (
    <motion.div
      layout
      transition={{
        layout: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
      }}
    >
      <AuthFormHeader 
        title={title} 
        description={description}
        className="bg-gradient-to-br from-background to-muted/30"
      />
    </motion.div>
  );
}

interface AnimatedFormContentProps {
  children: ReactNode;
}

export function AnimatedFormContent({ children }: AnimatedFormContentProps) {
  return (
    <motion.div
      layout
      transition={{
        layout: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
      }}
    >
      <CardContent className="section-padding">{children}</CardContent>
    </motion.div>
  );
}

interface AnimatedFormFieldsProps {
  children: ReactNode;
  isVisible: boolean;
}

export function AnimatedFormFields({
  children,
  isVisible,
}: AnimatedFormFieldsProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="form-fields"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.4,
            ease: [0.33, 1, 0.68, 1]
          }}
        >
          <div className="space-y-6">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AnimatedSuccessContentProps {
  children: ReactNode;
  isVisible: boolean;
}

export function AnimatedSuccessContent({
  children,
  isVisible,
}: AnimatedSuccessContentProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="success-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ 
            duration: 0.5,
            ease: [0.33, 1, 0.68, 1]
          }}
        >
          <div className="text-center space-y-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
