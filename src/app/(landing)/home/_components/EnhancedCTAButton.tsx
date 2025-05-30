"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EnhancedCTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  showSuccessState?: boolean;
  requireAuth?: boolean;
  authRedirect?: string;
}

export default function EnhancedCTAButton({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
  showSuccessState = false,
  requireAuth = false,
  authRedirect = "/signup",
}: EnhancedCTAButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuthenticated(false);
      }
    };

    if (requireAuth) {
      checkAuth();
    }
  }, [requireAuth]);

  const handleClick = async () => {
    // If authentication is required and user is not authenticated, redirect to auth
    if (requireAuth && isAuthenticated === false) {
      router.push(authRedirect);
      return;
    }

    if (onClick) {
      setIsLoading(true);
      try {
        await onClick();
        if (showSuccessState) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      } catch (error) {
        console.error("CTA action failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const baseClasses = `
    group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md px-6 font-medium 
    transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    primary: `
      bg-amber-600 text-white hover:bg-amber-700 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]
      focus:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-500
    `,
    secondary: `
      border border-gray-200 bg-white text-gray-900 hover:border-amber-200 hover:bg-gray-50 
      hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] focus:ring-amber-500
      dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-amber-800 dark:hover:bg-gray-900
    `,
  };

  // Show loading state while checking authentication
  if (requireAuth && isAuthenticated === null) {
    return (
      <motion.button
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        disabled={true}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </motion.button>
    );
  }

  // Determine the actual href and button text based on auth status
  const actualHref = requireAuth && isAuthenticated === false ? authRedirect : href;
  const buttonText = requireAuth && isAuthenticated === false ? "Sign Up to Continue" : children;

  const buttonContent = (
    <motion.div
      className="flex items-center justify-center"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </motion.div>
        ) : showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span>Success!</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            {requireAuth && isAuthenticated === false && (
              <User className="h-4 w-4" />
            )}
            <span>{buttonText}</span>
            {variant === "secondary" && (
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover effect overlay */}
      {variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-20"></span>
      )}
    </motion.div>
  );

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (onClick || (requireAuth && isAuthenticated === false)) {
    return (
      <motion.button
        className={combinedClasses}
        onClick={handleClick}
        disabled={isLoading}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={actualHref} className={combinedClasses}>
        {buttonContent}
      </Link>
    </motion.div>
  );
} 