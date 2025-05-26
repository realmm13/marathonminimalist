import {
  LucideBookOpen,
  LucideCreditCard,
  type LucideIcon,
  LucideInfo,
  LucideHome,
  LucideFileText,
  LucideMessageSquare,
  LucideActivity,
  LucideBarChart3,
  LucideClock,
  LucideTarget,
} from "lucide-react";
import { clientEnv } from "@/env/client";

export interface Link {
  label: string;
  href: string;
  icon?: LucideIcon;
}

// Conditionally return links based on feature flags
export const blogLink: Link | null = clientEnv.NEXT_PUBLIC_ENABLE_BLOG_PAGE
  ? {
      label: "Blog",
      href: "/blog",
      icon: LucideBookOpen,
    }
  : null;

export const pricingLink: Link | null =
  clientEnv.NEXT_PUBLIC_ENABLE_PRICING_PAGE
    ? {
        label: "Pricing",
        href: "/pricing",
        icon: LucideCreditCard,
      }
    : null;

export const aboutLink: Link | null = clientEnv.NEXT_PUBLIC_ENABLE_ABOUT_PAGE
  ? {
      label: "About",
      href: "/about",
      icon: LucideInfo,
    }
  : null;

export const homeLink: Link = {
  label: "Home",
  href: "/home",
  icon: LucideHome,
};

export const chatLink: Link | null = clientEnv.NEXT_PUBLIC_ENABLE_CHAT_PAGE
  ? {
      label: "Chat",
      href: "/chat",
      icon: LucideMessageSquare,
    }
  : null;

// Training-specific navigation links
export const trainingLinks: Link[] = [
  {
    label: "Dashboard",
    href: "/app",
    icon: LucideHome,
  },
  {
    label: "Workouts",
    href: "/workout-demo",
    icon: LucideActivity,
  },
  {
    label: "Progress",
    href: "/progress-demo",
    icon: LucideBarChart3,
  },
];

export const dashboardLink: Link = {
  label: "Dashboard",
  href: "/app",
  icon: LucideTarget,
};
