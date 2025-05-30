"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_NAME } from "@/config/config";
import LandingSectionTitle from "./LandingSectionTitle";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
  index: number;
}

function FAQItem({
  question,
  answer,
  isOpen,
  toggleOpen,
  index,
}: FAQItemProps) {
  const questionId = `faq-question-${index}`;
  const answerId = `faq-answer-${index}`;

  return (
    <motion.div
      className="border-b border-gray-200 py-5 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={answerId}
        id={questionId}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {question}
        </h3>
        <motion.span
          className="ml-6 flex-shrink-0"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        >
          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mt-3 pr-12"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            id={answerId}
            role="region"
            aria-labelledby={questionId}
          >
            <p className="text-base text-gray-600 dark:text-gray-400">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LandingFAQ() {
  const faqItems = [
    {
      question: "Do I need running experience to start marathon training?",
      answer:
        "Not at all! Our training plans are designed for all fitness levels, from complete beginners to experienced runners. We'll assess your current fitness and create a personalized 16-week plan that gradually builds your endurance safely.",
    },
    {
      question: "How long does it take to train for a marathon?",
      answer:
        "Our comprehensive training program is 16 weeks long, which is the optimal timeframe for most runners to safely build up to marathon distance. However, we also offer 12-week and 20-week plans depending on your experience level.",
    },
    {
      question: "What if I get injured during training?",
      answer:
        "Our training plans include built-in rest days and injury prevention strategies. If you do get injured, our adaptive system can modify your plan to accommodate recovery time while keeping you on track for your marathon goal.",
    },
    {
      question: "Can I use this app for other race distances?",
      answer:
        "While our primary focus is marathon training, our plans also prepare you for 5K, 10K, and half-marathon distances as stepping stones to your marathon goal. You'll be race-ready for multiple distances throughout your training.",
    },
    {
      question: "Do you provide nutrition and gear guidance?",
      answer:
        "Yes! Premium subscribers get access to detailed nutrition planning, hydration strategies, and gear recommendations. We'll help you fuel your training and prepare everything you need for race day success.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(index === openIndex ? -1 : index);
  };

  return (
    <div className="w-full py-24">
      <div className="container mx-auto px-4">
        <LandingSectionTitle
          id="faq-heading"
          title="Marathon Training Questions"
          description="Get answers to common questions about marathon training, our plans, and how to achieve your running goals."
        />

        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          role="list"
          aria-label="Frequently asked questions"
        >
          {faqItems.map((item, index) => (
            <div key={index} role="listitem">
              <FAQItem
                index={index}
                question={item.question}
                answer={item.answer}
                isOpen={index === openIndex}
                toggleOpen={() => toggleFAQ(index)}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
