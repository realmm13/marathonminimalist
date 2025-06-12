"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { APP_NAME } from "@/config/config";
import LandingSectionTitle from "./LandingSectionTitle";

function DiscountBadge() {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-muted px-4 py-1 text-sm font-medium text-muted-foreground">
      <span className="mr-1 text-xs">🏃‍♂️</span> Start your marathon journey today
    </div>
  );
}

function GetStartedButton({
  variant = "filled",
  className = "",
}: {
  variant?: "filled" | "outline" | "gradient";
  className?: string;
}) {
  const isPrimary = variant === "gradient";

  return (
    <CustomButton
      className={className}
      variant={variant}
      size="lg"
    >
      Start Training
      <ArrowRight className="ml-2 h-4 w-4" />
    </CustomButton>
  );
}

export default function LandingPricing() {
  const planVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="w-full section-padding">
      <div className="container-enhanced mx-auto">
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
            className="card-enhanced rounded-2xl p-8 bg-white"
            variants={planVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            role="listitem"
          >
            <header>
              <h3 className="heading-5 text-foreground">
                Basic Training
              </h3>
              <p className="body-medium text-muted-foreground mt-2">
                Perfect for first-time marathoners and casual runners
              </p>
            </header>
            <div className="mt-8">
              <span className="text-4xl font-bold text-foreground">
                $12
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <GetStartedButton variant="outline" className="mt-8 w-full" />
            <ul className="mt-6 space-y-2 body-small text-muted-foreground" role="list">
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> 16-week training plan
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> Basic pace calculator
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> Progress tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> Mobile app access
              </li>
            </ul>
          </motion.article>

          <motion.article
            className="relative card-enhanced rounded-2xl border-2 border-primary p-8 bg-white"
            variants={planVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            role="listitem"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
              Most Popular
            </div>
            <header>
              <h3 className="heading-5 text-foreground">
                Premium Training
              </h3>
              <p className="body-medium text-muted-foreground mt-2">
                For serious runners aiming for personal bests
              </p>
            </header>
            <div className="mt-8">
              <span className="text-4xl font-bold text-foreground">
                $19
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="mt-4 rounded-lg bg-muted p-3 body-small text-muted-foreground">
              <span className="font-medium">Everything in Basic</span> plus advanced features for optimal performance
            </div>
            <GetStartedButton variant="filled" className="mt-8 w-full" />
            <ul className="mt-6 space-y-2 body-small text-muted-foreground" role="list">
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> Advanced pace strategies
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> Nutrition planning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> Race day preparation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> Personal coach support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary" aria-hidden="true">✓</span> Detailed analytics
              </li>
            </ul>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
