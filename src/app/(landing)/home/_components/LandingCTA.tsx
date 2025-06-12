"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Target } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { APP_NAME } from "@/config/config";

export default function LandingCTA() {
  const stats = [
    { icon: Users, value: "10,000+", label: "Active Runners" },
    { icon: Trophy, value: "95%", label: "Success Rate" },
    { icon: Target, value: "15%", label: "Avg. Improvement" },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-enhanced">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 lg:p-16">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <motion.div
              className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/5 blur-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </div>

          <div className="relative z-10 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="heading-2 mb-4">
                Ready to Transform Your Running?
              </h2>
              <p className="body-large mx-auto max-w-2xl opacity-90">
                Join thousands of runners who've achieved their marathon goals with {APP_NAME}. 
                Start your 7-day free trial today and experience the difference personalized training makes.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 flex flex-wrap justify-center gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <stat.icon className="mb-2 h-6 w-6 opacity-80" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="body-small opacity-80">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <CustomButton
                href="/dashboard"
                variant="filled"
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </CustomButton>
              <CustomButton
                href="#pricing"
                variant="outline"
                size="lg"
                className="text-white hover:bg-white/10 px-8"
              >
                View Pricing
              </CustomButton>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex flex-wrap justify-center gap-6 text-sm opacity-80"
            >
              <div className="flex items-center gap-2">
                <span>✓</span> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span> Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span> 7-day free trial
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 