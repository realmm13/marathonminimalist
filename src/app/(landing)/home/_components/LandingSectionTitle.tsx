"use client";
import { motion } from "framer-motion";

interface LandingSectionTitleProps {
  title: string;
  description: string;
  className?: string;
  id?: string;
}

export default function LandingSectionTitle({
  title,
  description,
  className = "",
  id,
}: LandingSectionTitleProps) {
  return (
    <motion.div
      className={`mb-16 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 id={id} className="heading-2 mb-4 text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="body-large text-muted-foreground mx-auto max-w-2xl">
        {description}
      </p>
    </motion.div>
  );
}
