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
      className="border-b border-border py-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <button
        className="flex w-full items-center justify-between text-left hover:opacity-80 transition-opacity"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={answerId}
        id={questionId}
      >
        <h3 className="heading-5 text-zinc-900 dark:text-zinc-50">
          {question}
        </h3>
        <motion.span
          className="ml-6 flex-shrink-0"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
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
            <p className="body-medium text-muted-foreground">
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
    <section className="w-full section-padding">
      <div className="container-enhanced">
        <LandingSectionTitle
          id="faq-heading"
          title="Frequently Asked Questions"
          description="Answers to common questions about our marathon training platform."
        />
        <div className="mt-8">
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              index={index}
              question={item.question}
              answer={item.answer}
              isOpen={index === openIndex}
              toggleOpen={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
