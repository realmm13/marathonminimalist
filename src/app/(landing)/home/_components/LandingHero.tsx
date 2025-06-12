"use client";
import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { motion } from "framer-motion";
import { APP_NAME } from "@/config/config";
import { SmoothLoadImage } from "@/components/SmoothLoadImage";
import { memo, useMemo } from "react";
import { CustomButton } from "@/components/CustomButton";

// Memoized avatar group component for better performance
const AvatarGroup = memo(({ avatars }: { avatars: string[] }) => {
  return (
    <div className="flex -space-x-2" role="img" aria-label="Profile pictures of successful marathon runners">
      {avatars.map((avatar, i) => (
        <motion.div
          key={i}
          className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-background"
          initial={{ opacity: 0, x: -10, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: i * 0.1 + 0.6, duration: 0.3 }}
          whileHover={{ y: -3, zIndex: 10, transition: { duration: 0.2 } }}
        >
          <Image
            src={avatar}
            alt={`Marathon runner ${i + 1}`}
            fill
            className="object-cover"
            sizes="32px"
            loading="lazy"
          />
        </motion.div>
      ))}
    </div>
  );
});

AvatarGroup.displayName = "AvatarGroup";

// Memoized stats component
const StatsDisplay = memo(() => {
  const stats = useMemo(() => [
    { value: "10K+", label: "Active Runners" },
    { value: "95%", label: "Success Rate" },
    { value: "4.9/5", label: "User Rating" },
  ], []);

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-6 md:justify-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      {stats.map((stat, index) => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl font-bold text-primary">
            {stat.value}
          </div>
          <div className="body-small text-muted-foreground">
            {stat.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
});

StatsDisplay.displayName = "StatsDisplay";

export default function LandingHero() {
  // Memoize avatar generation to prevent unnecessary re-renders
  const avatars = useMemo(() => {
    const seeds = ["Felix", "Aneka", "Garland", "Mittie", "Kimberly"];
    return seeds.map(seed => 
      createAvatar(lorelei, { seed }).toDataUri()
    );
  }, []);

  return (
    <section className="w-full pb-0">
      <div className="container-enhanced flex flex-col items-center gap-6 mx-auto pb-0">
        <h1 id="hero-heading" className="text-foreground font-extrabold tracking-tight text-center text-[clamp(2.5rem,6vw,4.5rem)] max-w-5xl mx-auto">
          Train Smarter, Run Faster
        </h1>
        <p className="body-large leading-none text-muted-foreground text-center m-0 p-0 max-w-2xl mx-auto">
          Minimalist marathon training for busy runners. Zero fluff, just results.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <CustomButton
            href="/dashboard"
            variant="filled"
            color="primary"
            size="lg"
            className="px-8"
          >
            Start Free Training
          </CustomButton>
          <CustomButton
            href="#features"
            variant="filled"
            color="primary"
            size="lg"
            className="px-8"
          >
            Learn More
          </CustomButton>
        </div>
      </div>
    </section>
  );
}
