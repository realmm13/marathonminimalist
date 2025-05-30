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
import EnhancedCTAButton from "./EnhancedCTAButton";

// Memoized avatar group component for better performance
const AvatarGroup = memo(({ avatars }: { avatars: string[] }) => {
  return (
    <div className="flex -space-x-2" role="img" aria-label="Profile pictures of successful marathon runners">
      {avatars.map((avatar, i) => (
        <motion.div
          key={i}
          className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white dark:border-gray-950"
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
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stat.value}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
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
    <section 
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      aria-labelledby="hero-heading"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-orange-400/20 to-red-500/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      </div>

      <div className="container relative mx-auto flex min-h-screen items-center px-4 py-12 md:px-6">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 
                id="hero-heading"
                className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white sm:text-5xl xl:text-6xl/none"
              >
                Train Smarter,{" "}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Run Faster
                </span>
              </h1>
              <p className="max-w-[600px] text-gray-600 dark:text-gray-400 md:text-xl">
                Join thousands of runners who've achieved their marathon goals with {APP_NAME}'s 
                personalized training plans, expert guidance, and proven strategies.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-4 min-[400px]:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <EnhancedCTAButton
                href="/dashboard"
                variant="primary"
                requireAuth={true}
                authRedirect="/signup"
                className="px-8"
              >
                Start Free Training
              </EnhancedCTAButton>
              <EnhancedCTAButton
                href="#features"
                variant="secondary"
                className="px-8"
              >
                Learn More
              </EnhancedCTAButton>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <AvatarGroup avatars={avatars} />
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Join 10,000+ successful runners
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Average improvement: 15% faster finish times
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <StatsDisplay />
          </div>

          {/* Right Content - Hero Image */}
          <motion.div
            className="relative flex justify-center md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            role="img"
            aria-label="Marathon training dashboard preview showing workout plans and progress tracking"
          >
            <div className="relative h-auto min-h-[280px] w-[90%] max-w-[450px]">
              <SmoothLoadImage
                src="/hero.png"
                alt="Marathon Training Dashboard Preview showing personalized workout plans, pace guidance, and progress tracking features"
                objectFit="contain"
                priority
                className="h-full w-full"
              />
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -bottom-6 -left-6 h-28 w-28 rounded-lg bg-amber-600 opacity-50 blur-3xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 0.8 }}
              aria-hidden="true"
            />
            <motion.div
              className="absolute -top-6 -right-6 h-28 w-28 rounded-lg bg-orange-600 opacity-50 blur-3xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
