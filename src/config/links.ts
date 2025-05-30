import {
  LucideBookOpen,
  LucideCreditCard,
  type LucideIcon,
  LucideInfo,
  LucideHome,
  LucideFileText,
  LucideMessageSquare,
  LucideActivity,
  LucideClock,
  LucideTarget,
  LucideUser,
  Home,
  User,
  Calendar,
  Settings,
  LucideCalendar,
  LucideSettings,
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
    href: "/workouts",
    icon: LucideActivity,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: LucideUser,
  },
];

export const dashboardLink: Link = {
  label: "Dashboard",
  href: "/app",
  icon: LucideTarget,
};

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LucideHome,
  },
  {
    href: "/workouts",
    label: "Workouts",
    icon: LucideActivity,
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: LucideCalendar,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: LucideUser,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: LucideSettings,
  },
];

export const workoutsLink: NavLink = {
  href: "/workouts",
  label: "Workouts",
  icon: LucideActivity,
};

export const scheduleLink: NavLink = {
  href: "/schedule",
  label: "Schedule",
  icon: LucideCalendar,
};

export const profileLink: NavLink = {
  href: "/profile",
  label: "Profile",
  icon: LucideUser,
};

export const settingsLink: NavLink = {
  href: "/settings",
  label: "Settings",
  icon: LucideSettings,
};
