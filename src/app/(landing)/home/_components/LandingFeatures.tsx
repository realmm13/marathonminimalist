"use client";
import {
  Calendar,
  Timer,
  TrendingUp,
  Trophy,
  Target,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { APP_NAME } from "@/config/config";
import { CardWithIcon } from "@/components/CardWithIcon";
import { type GradientType } from "@/components/CardIcon";
import LandingSectionTitle from "./LandingSectionTitle";

export default function LandingFeatures() {
  const features: {
    icon: typeof Calendar;
    title: string;
    description: string;
    gradient: GradientType;
  }[] = [
    {
      icon: Calendar,
      title: "Personalized Training Plans",
      description:
        "Science-backed 16-week marathon training programs tailored to your fitness level and goals.",
      gradient: "blue",
    },
    {
      icon: Timer,
      title: "Smart Pace Guidance",
      description:
        "Real-time pace calculations and race day strategy to help you maintain optimal speed throughout your marathon.",
      gradient: "green",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Comprehensive analytics to monitor your training progress, weekly mileage, and performance improvements.",
      gradient: "amber",
    },
    {
      icon: Trophy,
      title: "Race Day Ready",
      description:
        "Complete race preparation including nutrition planning, gear recommendations, and mental preparation strategies.",
      gradient: "purple",
    },
    {
      icon: Target,
      title: "Goal Achievement",
      description:
        "Set and track specific marathon goals with milestone celebrations and adaptive training adjustments.",
      gradient: "indigo",
    },
    {
      icon: Activity,
      title: "Workout Variety",
      description:
        "Diverse training sessions including easy runs, tempo runs, intervals, and long runs to build endurance and speed.",
      gradient: "orange",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="w-full py-20">
      <div className="container mx-auto px-4">
        <LandingSectionTitle
          id="features-heading"
          title="Everything You Need to Train for a Marathon"
          description="Our comprehensive platform provides all the tools and guidance you need to successfully complete your first marathon or achieve a new personal best."
        />

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          role="list"
          aria-label="Marathon training features"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group-md relative"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              role="listitem"
            >
              <CardWithIcon
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                descriptionClassName="text-sm"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
