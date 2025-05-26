"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trainingLinks } from "@/config/links";
import { Button } from "@/components/ui/button";

interface TrainingMobileNavProps {
  className?: string;
}

export function TrainingMobileNav({ className }: TrainingMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  const toggleNav = () => setIsOpen(!isOpen);
  const closeNav = () => setIsOpen(false);

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleNav}
        className={cn("md:hidden", className)}
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </Button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNav}
          />
        )}
      </AnimatePresence>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed left-0 top-0 z-50 h-full w-64 bg-background border-r shadow-lg md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Marathon Training</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeNav}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4">
              <ul className="space-y-2">
                {trainingLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeNav}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {Icon && <Icon size={20} />}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Marathon Minimalist
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 