import React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type GradientType =
  | "blue"
  | "purple"
  | "teal"
  | "orange"
  | "green"
  | "pink"
  | "red"
  | "amber"
  | "indigo"
  | "cyan"
  | "emerald"
  | "neutral"
  | "primary"
  | "secondary"
  | "muted";

interface CardIconProps {
  icon: LucideIcon;
  className?: string;
  gradient: GradientType;
}

const gradients = {
  blue: "bg-gradient-to-br from-blue-500/80 to-blue-600/80 group-md:hover:from-blue-400/90 group-md:hover:to-blue-700/90",
  purple:
    "bg-gradient-to-br from-purple-500/80 to-purple-600/80 group-md:hover:from-purple-400/90 group-md:hover:to-purple-700/90",
  teal: "bg-gradient-to-br from-teal-500/80 to-teal-600/80 group-md:hover:from-teal-400/90 group-md:hover:to-teal-700/90",
  orange:
    "bg-gradient-to-br from-orange-500/80 to-orange-600/80 group-md:hover:from-orange-400/90 group-md:hover:to-orange-700/90",
  green:
    "bg-gradient-to-br from-green-500/80 to-green-600/80 group-md:hover:from-green-400/90 group-md:hover:to-green-700/90",
  pink: "bg-gradient-to-br from-pink-500/80 to-pink-600/80 group-md:hover:from-pink-400/90 group-md:hover:to-pink-700/90",
  red: "bg-gradient-to-br from-red-500/80 to-red-600/80 group-md:hover:from-red-400/90 group-md:hover:to-red-700/90",
  amber:
    "bg-gradient-to-br from-amber-500/80 to-amber-600/80 group-md:hover:from-amber-400/90 group-md:hover:to-amber-700/90",
  indigo:
    "bg-gradient-to-br from-indigo-500/80 to-indigo-600/80 group-md:hover:from-indigo-400/90 group-md:hover:to-indigo-700/90",
  cyan: "bg-gradient-to-br from-cyan-500/80 to-cyan-600/80 group-md:hover:from-cyan-400/90 group-md:hover:to-cyan-700/90",
  emerald:
    "bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 group-md:hover:from-emerald-400/90 group-md:hover:to-emerald-700/90",
  neutral:
    "bg-gradient-to-br from-gray-500/80 to-gray-600/80 group-md:hover:from-gray-400/90 group-md:hover:to-gray-700/90",
  primary:
    "bg-gradient-to-br from-primary/80 to-primary/90 group-md:hover:from-primary/90 group-md:hover:to-primary",
  secondary:
    "bg-gradient-to-br from-secondary/80 to-secondary/90 group-md:hover:from-secondary/90 group-md:hover:to-secondary",
  muted:
    "bg-gradient-to-br from-muted-foreground/60 to-muted-foreground/80 group-md:hover:from-muted-foreground/70 group-md:hover:to-muted-foreground/90",
};

export const CardIcon = ({
  icon: Icon,
  className,
  gradient,
}: CardIconProps) => {
  return (
    <div
      className={cn(
        "group-md:hover:rotate-6 group-md:hover:scale-110 flex h-14 w-14 transform items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-500",
        "border border-white/20 backdrop-blur-sm",
        gradients[gradient],
        className,
      )}
    >
      <Icon className="h-7 w-7" />
    </div>
  );
};
