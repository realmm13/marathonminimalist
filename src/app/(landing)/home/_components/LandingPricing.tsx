"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/config";
import LandingSectionTitle from "./LandingSectionTitle";

function DiscountBadge() {
  return (
    <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
      <span className="mr-1 text-xs">🏃‍♂️</span> Start your marathon journey today
    </div>
  );
}

function GetStartedButton({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "muted" | "annual";
  className?: string;
}) {
  const isPrimary = variant === "annual";

  return (
    <Button
      className={`${className} group flex items-center justify-center gap-2 ${
        isPrimary
          ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          : ""
      }`}
      variant={variant === "muted" ? "outline" : "default"}
    >
      Start Training
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}

export default function LandingPricing() {
  const planVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="w-full py-24">
      <div className="container mx-auto px-4">
        <LandingSectionTitle
          id="pricing-heading"
          title="Choose Your Marathon Training Plan"
          description="Start your marathon journey with a 7-day free trial. No commitment required."
        />
        <div className="mt-4 flex justify-center">
          <DiscountBadge />
        </div>

        <motion.div
          className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          role="list"
          aria-label="Marathon training pricing plans"
        >
          <motion.article
            className="rounded-2xl border border-gray-200 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900/50"
            variants={planVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            role="listitem"
          >
            <header>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Training
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Perfect for first-time marathoners and casual runners
              </p>
            </header>
            <div className="mt-8">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                $12
              </span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <GetStartedButton variant="muted" className="mt-8 w-full" />
            <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400" role="list">
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> 16-week training plan
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> Basic pace calculator
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> Progress tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> Mobile app access
              </li>
            </ul>
          </motion.article>

          <motion.article
            className="relative rounded-2xl border-2 border-amber-500 bg-amber-50/50 p-8 shadow-lg dark:border-amber-700 dark:bg-amber-900/10"
            variants={planVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            role="listitem"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-sm font-medium text-white">
              Most Popular
            </div>
            <header>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Premium Training
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                For serious runners aiming for personal bests
              </p>
            </header>
            <div className="mt-8">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                $19
              </span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <div className="mt-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
              <span className="font-medium">Everything in Basic</span> plus advanced features for optimal performance
            </div>
            <GetStartedButton variant="annual" className="mt-8 w-full" />
            <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400" role="list">
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> Advanced pace strategies
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> Nutrition planning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> Race day preparation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> Personal coach support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500" aria-hidden="true">✓</span> Detailed analytics
              </li>
            </ul>
          </motion.article>
        </motion.div>
      </div>
    </div>
  );
}
