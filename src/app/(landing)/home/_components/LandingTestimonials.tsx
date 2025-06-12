"use client";
import Image from "next/image";
import { Star } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { motion } from "framer-motion";
import { APP_NAME } from "@/config/config";
import LandingSectionTitle from "./LandingSectionTitle";

// Animated stars component
const TestimonialStars = ({ count }: { count: number }) => {
  return (
    <div className="flex" role="img" aria-label={`${count} out of 5 stars`}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
          </motion.div>
        ))}
    </div>
  );
};

export default function LandingTestimonials() {
  // Generate avatar data URIs with DiceBear
  const avatars = ["sarah-runner", "mark-marathoner", "jessica-athlete"].map((seed) =>
    createAvatar(lorelei, {
      seed,
      backgroundColor: ["b6e3f4", "c0aede", "d1d4f9"],
    }).toDataUri(),
  );

  const testimonials = [
    {
      avatar: avatars[0] || "",
      name: "Sarah Chen",
      role: "First-time Marathoner",
      content: `This app helped me go from couch to marathon in 16 weeks! The training plan was perfect for my fitness level, and I finished in 4:15. Couldn't have done it without the pace guidance.`,
      stars: 5,
    },
    {
      avatar: avatars[1] || "",
      name: "Mark Rodriguez",
      role: "Boston Qualifier",
      content: `After years of inconsistent training, this app helped me finally qualify for Boston with a 3:05 finish. The structured workouts and progress tracking made all the difference.`,
      stars: 5,
    },
    {
      avatar: avatars[2] || "",
      name: "Jessica Thompson",
      role: "Marathon Coach",
      content:
        "I recommend this app to all my athletes. The science-backed training plans and detailed analytics help runners of all levels achieve their goals safely and effectively.",
      stars: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="w-full section-padding">
      <div className="container-enhanced">
        <LandingSectionTitle
          id="testimonials-heading"
          title="Success Stories from Real Marathoners"
          description="Join thousands of runners who have achieved their marathon dreams with our proven training system."
        />

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          role="list"
          aria-label="Customer testimonials"
        >
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={index}
              variants={itemVariants}
              className="card-enhanced relative flex flex-col p-8"
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                transition: { duration: 0.3 },
              }}
              role="listitem"
            >
              <motion.header
                className="mb-6 flex items-center"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative mr-4 h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.avatar}
                    alt={`${testimonial.name} profile picture`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="body-small text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </motion.header>

              <blockquote className="mb-6 flex-grow body-medium text-muted-foreground italic">
                "{testimonial.content}"
              </blockquote>

              <footer className="flex items-center">
                <TestimonialStars count={testimonial.stars} />
              </footer>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
