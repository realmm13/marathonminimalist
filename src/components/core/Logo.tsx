import Link from "next/link";
import React from "react";
import { APP_NAME } from "@/config/config";
import { motion } from "framer-motion";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="inline-block">
      <motion.div
        className="flex items-center gap-3 transition-all duration-200 hover:scale-105 hover:rotate-1 active:scale-95 active:rotate-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
      >
        <Image
          src="/favicon-design.svg"
          alt="Marathon Minimalist Logo"
          width={28}
          height={28}
          className="w-7 h-7"
        />
        <h1 className="text-xl font-bold tracking-normal uppercase transition-all duration-200 hover:tracking-widest dark:hover:text-white">
          {APP_NAME}
        </h1>
      </motion.div>
    </Link>
  );
}
