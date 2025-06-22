"use client";

import Link from "next/link";
import { type Link as LinkType } from "@/config/links";
import { motion } from "framer-motion";
import { filterEnabledLinks } from "@/lib/linkUtils";

type HeaderLinksProps = {
  links: (LinkType | null | undefined)[] | undefined;
};

export function HeaderLinks({ links }: HeaderLinksProps) {
  const enabledLinks = filterEnabledLinks(links);

  if (enabledLinks.length === 0) {
    return null; // Don't render anything if no links are enabled
  }

  return (
    <motion.nav
      className="flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <ul className="flex items-center gap-10">
        {enabledLinks.map((link) => {
          const Icon = link.icon;

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex cursor-pointer items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <div className="flex items-center gap-1.5 transition-all duration-200 group-hover:scale-105">
                  {Icon && (
                    <div className="transform text-muted-foreground transition-all duration-200 group-hover:scale-[1.15] group-hover:-rotate-3 group-hover:text-violet-500 dark:group-hover:text-violet-400">
                      <Icon size={18} />
                    </div>
                  )}
                  <span className="opacity-90 transition-all duration-150 group-hover:translate-x-[2px] group-hover:opacity-100">
                    {link.label}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
