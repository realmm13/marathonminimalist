"use client";

import { motion } from "framer-motion";
import NewsletterSignup from "./NewsletterSignup";
import LandingSectionTitle from "./LandingSectionTitle";

export default function LandingNewsletter() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <LandingSectionTitle
            title="Stay in the Loop"
            description="Get the latest training tips, app updates, and marathon insights delivered to your inbox"
            className="mb-0"
          />
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Newsletter Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              What you'll get:
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  title: "Weekly Training Tips",
                  description: "Expert advice to improve your running performance and avoid injuries"
                },
                {
                  title: "App Updates & Features",
                  description: "Be the first to know about new features and improvements"
                },
                {
                  title: "Marathon Insights",
                  description: "Race strategies, nutrition tips, and mental preparation techniques"
                },
                {
                  title: "Community Highlights",
                  description: "Success stories and achievements from fellow runners"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-3"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-8"
            >
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>No spam, ever.</strong> Unsubscribe at any time. We respect your privacy and will never share your email.
              </p>
            </motion.div>
          </motion.div>

          {/* Newsletter Signup Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <NewsletterSignup variant="hero" />
          </motion.div>
        </div>
      </div>
    </section>
  );
} 