"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Home, Star, DollarSign, MessageSquare, Zap } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
}

const navigationItems: NavItem[] = [
  { id: "hero", label: "Home", icon: Home },
  { id: "features", label: "Features", icon: Zap },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "testimonials", label: "Reviews", icon: Star },
  { id: "faq", label: "FAQ", icon: MessageSquare },
];

export default function LandingSmoothNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300);

      // Find the active section based on scroll position
      const sections = navigationItems.map(item => {
        const element = document.getElementById(item.id === "hero" ? "hero-heading" : `${item.id}-heading`);
        if (element) {
          const rect = element.getBoundingClientRect();
          return {
            id: item.id,
            top: rect.top + scrollY,
            bottom: rect.bottom + scrollY,
          };
        }
        return null;
      }).filter(Boolean);

      const currentSection = sections.find(section => {
        if (!section) return false;
        return scrollY >= section.top - 200 && scrollY < section.bottom + 200;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const targetId = sectionId === "hero" ? "hero-heading" : `${sectionId}-heading`;
    const element = document.getElementById(targetId);
    
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed right-6 top-1/2 z-40 -translate-y-1/2"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          <nav
            className="flex flex-col items-center space-y-2 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-md dark:bg-gray-900/80"
            role="navigation"
            aria-label="Page sections navigation"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Navigate to ${item.label} section`}
                  title={item.label}
                >
                  <Icon size={16} />
                  
                  {/* Tooltip */}
                  <motion.div
                    className="absolute right-full mr-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 dark:bg-white dark:text-gray-900"
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.div>
                </motion.button>
              );
            })}

            {/* Scroll to top button */}
            <motion.div
              className="mt-4 border-t border-gray-200 pt-2 dark:border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={scrollToTop}
                className="group flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Scroll to top"
                title="Back to top"
              >
                <ChevronUp size={16} />
              </motion.button>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 