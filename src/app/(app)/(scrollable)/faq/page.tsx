"use client";

import React, { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import { 
  ChevronDown, 
  Calendar, 
  Target, 
  Clock, 
  Activity, 
  User, 
  MapPin, 
  HelpCircle,
  BookOpen,
  Zap,
  Shield,
  Timer,
  TrendingUp,
  Search,
  X,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";

interface FAQItem {
  id: string;
  question: string;
  answer: string | React.JSX.Element;
  category: string;
}

interface FeatureGuide {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  path: string;
}

const featureGuides: FeatureGuide[] = [
  {
    icon: Target,
    title: "Dashboard",
    description: "Your training overview with calendar view, upcoming workouts, and progress tracking. Start here to see your complete training schedule.",
    path: "/app"
  },
  {
    icon: Activity,
    title: "Workouts",
    description: "Browse and log your workouts. View detailed instructions for tempo runs, 800m repeats, and long runs with automatic pace calculations.",
    path: "/workouts"
  },
  {
    icon: User,
    title: "Profile Settings",
    description: "Set your marathon goal time, race date, and preferences. Your 5K pace for intervals is automatically calculated from your marathon goal.",
    path: "/profile"
  }
];

const faqData: FAQItem[] = [
  // Training Philosophy
  {
    id: "why-3-workouts",
    category: "Training Philosophy",
    question: "Why only 3 workouts per week?",
    answer: (
      <div className="space-y-3">
        <p>Our minimalist approach focuses on quality over quantity. Running 3x per week provides:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Better recovery:</strong> No back-to-back training days means your body can fully recover</li>
          <li><strong>Injury prevention:</strong> Reduced training load minimizes overuse injuries</li>
          <li><strong>More flexibility:</strong> Time for other fitness activities like yoga, weightlifting, or walking</li>
          <li><strong>Sustainable training:</strong> A plan you can stick to without burnout</li>
        </ul>
      </div>
    )
  },
  {
    id: "workout-types",
    category: "Training Philosophy", 
    question: "What are the three workout types?",
    answer: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">1. Tempo Runs at Marathon Pace</h4>
          <p className="text-muted-foreground">Build endurance and get comfortable with your goal race pace. We recommend training 10-12 seconds faster than your actual marathon pace to build in a cushion.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">2. 800m Repeats at 5K Pace</h4>
          <p className="text-muted-foreground">High-intensity intervals that make your marathon pace feel easy. Your 5K pace is automatically calculated from your marathon goal using our formula.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">3. Long Slow Runs + Marathon Pace Miles</h4>
          <p className="text-muted-foreground">Build your aerobic base with easy-paced long runs, finishing with miles at marathon pace to practice race conditions.</p>
        </div>
      </div>
    )
  },
  {
    id: "5k-pace-calculation",
    category: "Training Philosophy",
    question: "How is my 5K pace calculated for 800m repeats?",
    answer: (
      <div className="space-y-3">
        <p>We use a simple formula based on your marathon goal time:</p>
        <div className="bg-muted p-4 rounded-lg">
          <p className="font-mono text-sm">
            <strong>Marathon hours → Minutes</strong><br/>
            <strong>Marathon minutes → Seconds</strong>
          </p>
        </div>
        <p><strong>Example:</strong> If your marathon goal is 3:15:00 (3 hours, 15 minutes), your 5K pace becomes 3:15 per 800m interval.</p>
        <p>This pace is faster than your marathon pace, making your race pace feel comfortable by comparison.</p>
      </div>
    )
  },
  {
    id: "progression",
    category: "Training Philosophy",
    question: "How does the plan progress over time?",
    answer: (
      <div className="space-y-2">
        <p>The plan builds gradually to prepare you for race day:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Distance increases:</strong> Long runs gradually increase each week</li>
          <li><strong>Tempo progression:</strong> Marathon pace runs get longer as you build endurance</li>
          <li><strong>Interval consistency:</strong> 800m repeats maintain the same pace but increase in number</li>
          <li><strong>Recovery built-in:</strong> Regular cutback weeks prevent overtraining</li>
        </ul>
      </div>
    )
  },

  // Site Navigation
  {
    id: "getting-started",
    category: "Site Navigation",
    question: "How do I get started with my training plan?",
    answer: (
      <div className="space-y-3">
        <p>Follow these steps to set up your training:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Set your profile:</strong> Go to Profile and enter your marathon goal time and race date</li>
          <li><strong>Choose workout days:</strong> Select which 3 days of the week you want to train</li>
          <li><strong>Review your plan:</strong> Check the Dashboard to see your personalized schedule</li>
          <li><strong>Start training:</strong> Begin with your first scheduled workout</li>
        </ol>
      </div>
    )
  },
  {
    id: "dashboard-features",
    category: "Site Navigation", 
    question: "What can I do on the Dashboard?",
    answer: (
      <div className="space-y-2">
        <p>The Dashboard is your training command center:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Calendar view:</strong> See all your workouts laid out by date</li>
          <li><strong>Today's workout:</strong> Quick access to what you should do today</li>
          <li><strong>Progress tracking:</strong> View completed vs. planned workouts</li>
          <li><strong>Upcoming schedule:</strong> Preview your next few training sessions</li>
        </ul>
      </div>
    )
  },
  {
    id: "logging-workouts",
    category: "Site Navigation",
    question: "How do I log my completed workouts?",
    answer: (
      <div className="space-y-2">
        <p>Track your training progress by logging workouts:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>From Dashboard:</strong> Click on any workout to mark it complete</li>
          <li><strong>From Workouts page:</strong> Browse all workouts and log completion</li>
          <li><strong>Add notes:</strong> Record how the workout felt or any observations</li>
          <li><strong>Track actual vs. planned:</strong> Note your actual pace, distance, or time</li>
        </ul>
      </div>
    )
  },

  // Common Questions
  {
    id: "first-marathon",
    category: "Common Questions",
    question: "Is this plan suitable for first-time marathoners?",
    answer: (
      <div className="space-y-2">
        <p>Absolutely! This plan is especially good for beginners because:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Lower injury risk:</strong> 3 runs per week reduces overuse injuries common in high-volume plans</li>
          <li><strong>Manageable commitment:</strong> Easier to fit into busy schedules</li>
          <li><strong>Quality focus:</strong> Each workout has a specific purpose</li>
          <li><strong>Built-in recovery:</strong> Plenty of time for your body to adapt</li>
        </ul>
        <p>Just make sure to set a realistic marathon goal time for your first race.</p>
      </div>
    )
  },
  {
    id: "goal-time",
    category: "Common Questions",
    question: "How do I choose a realistic marathon goal time?",
    answer: (
      <div className="space-y-3">
        <p>Setting a realistic goal is crucial for effective training:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>First marathon:</strong> Add 30-60 minutes to your predicted time for safety</li>
          <li><strong>Use recent races:</strong> A half marathon time can predict your marathon potential</li>
          <li><strong>Consider experience:</strong> Factor in your running background and training consistency</li>
          <li><strong>Account for conditions:</strong> Hot weather, hills, or wind can affect your time</li>
        </ul>
        <p>Remember: it's better to start conservative and surprise yourself than to set an unrealistic goal and struggle.</p>
      </div>
    )
  },
  {
    id: "missed-workouts",
    category: "Common Questions",
    question: "What if I miss a workout?",
    answer: (
      <div className="space-y-2">
        <p>Life happens! Here's how to handle missed sessions:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Don't double up:</strong> Never do back-to-back workouts to "catch up"</li>
          <li><strong>Skip and continue:</strong> Missing one workout won't hurt your training</li>
          <li><strong>Prioritize long runs:</strong> If you must miss something, prioritize the long run</li>
          <li><strong>Listen to your body:</strong> Sometimes rest is better than forcing a workout</li>
        </ul>
      </div>
    )
  },
  {
    id: "other-activities",
    category: "Common Questions",
    question: "Can I do other activities on rest days?",
    answer: (
      <div className="space-y-2">
        <p>Yes! Our 3-day plan leaves room for other fitness activities:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Low-impact cardio:</strong> Walking, swimming, cycling, elliptical</li>
          <li><strong>Strength training:</strong> Focus on core, glutes, and injury prevention</li>
          <li><strong>Flexibility:</strong> Yoga, stretching, foam rolling</li>
          <li><strong>Active recovery:</strong> Easy movement that promotes blood flow</li>
        </ul>
        <p>Just avoid high-impact activities that might interfere with your running recovery.</p>
      </div>
    )
  },
  {
    id: "race-day-prep",
    category: "Common Questions",
    question: "How does this plan prepare me for race day?",
    answer: (
      <div className="space-y-2">
        <p>The plan systematically prepares you for marathon success:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Pace familiarity:</strong> Regular marathon pace runs make race pace feel comfortable</li>
          <li><strong>Speed reserve:</strong> 800m intervals make marathon pace feel "easy"</li>
          <li><strong>Endurance base:</strong> Long runs build the aerobic capacity for 26.2 miles</li>
          <li><strong>Mental preparation:</strong> Consistent training builds confidence</li>
        </ul>
      </div>
    )
  }
];

// Add search utility function
const highlightSearchTerm = (text: string, searchTerm: string): React.JSX.Element => {
  if (!searchTerm.trim()) {
    return <span>{text}</span>;
  }
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/40 rounded px-1">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

// Search function
const searchFAQs = (faqs: FAQItem[], searchTerm: string): FAQItem[] => {
  if (!searchTerm.trim()) return faqs;
  
  const term = searchTerm.toLowerCase();
  return faqs.filter(item => 
    item.question.toLowerCase().includes(term) ||
    item.category.toLowerCase().includes(term) ||
    (typeof item.answer === 'string' && item.answer.toLowerCase().includes(term)) ||
    (typeof item.answer !== 'string' && 
     // Extract text from JSX elements for searching
     JSON.stringify(item.answer).toLowerCase().includes(term)
    )
  );
};

// Generate FAQ Schema Markup for SEO
const generateFAQSchema = (faqItems: FAQItem[]) => {
  const extractTextFromJSX = (element: React.JSX.Element | string): string => {
    if (typeof element === 'string') return element;
    
    // For JSX elements, we'll provide simplified text versions
    // This is a mapping of our specific FAQ answers to clean text
    const textMappings: Record<string, string> = {
      "why-3-workouts": "Our minimalist approach focuses on quality over quantity. Running 3x per week provides better recovery with no back-to-back training days, injury prevention through reduced training load, more flexibility for other activities, and sustainable training without burnout.",
      "workout-types": "1. Tempo Runs at Marathon Pace: Build endurance and get comfortable with your goal race pace, training 10-12 seconds faster than actual marathon pace. 2. 800m Repeats at 5K Pace: High-intensity intervals that make your marathon pace feel easy, with 5K pace automatically calculated from your marathon goal. 3. Long Slow Runs + Marathon Pace Miles: Build aerobic base with easy-paced long runs, finishing with miles at marathon pace to practice race conditions.",
      "5k-pace-calculation": "We use a simple formula based on your marathon goal time: Marathon hours become minutes, marathon minutes become seconds. Example: If your marathon goal is 3:15:00 (3 hours, 15 minutes), your 5K pace becomes 3:15 per 800m interval. This pace is faster than your marathon pace, making your race pace feel comfortable by comparison.",
      "progression": "The plan builds gradually: Distance increases with long runs gradually increasing each week, tempo progression with marathon pace runs getting longer, interval consistency with 800m repeats maintaining the same pace but increasing in number, and recovery built-in with regular cutback weeks to prevent overtraining.",
      "getting-started": "Follow these steps: 1. Set your profile by going to Profile and entering your marathon goal time and race date. 2. Choose workout days by selecting which 3 days of the week you want to train. 3. Review your plan by checking the Dashboard to see your personalized schedule. 4. Start training with your first scheduled workout.",
      "dashboard-features": "The Dashboard is your training command center with calendar view to see all workouts by date, today's workout for quick access, progress tracking to view completed vs. planned workouts, and upcoming schedule to preview your next few training sessions.",
      "logging-workouts": "Track your training progress: From Dashboard by clicking on any workout to mark it complete, from Workouts page to browse all workouts and log completion, add notes to record how the workout felt, and track actual vs. planned pace, distance, or time.",
      "first-marathon": "Absolutely! This plan is especially good for beginners because of lower injury risk with 3 runs per week, manageable commitment that's easier to fit into busy schedules, quality focus with each workout having a specific purpose, and built-in recovery with plenty of time for your body to adapt. Just make sure to set a realistic marathon goal time for your first race.",
      "goal-time": "Setting a realistic goal is crucial: For first marathon, add 30-60 minutes to your predicted time for safety. Use recent races as a half marathon time can predict your marathon potential. Consider experience by factoring in your running background and training consistency. Account for conditions as hot weather, hills, or wind can affect your time. Remember: it's better to start conservative and surprise yourself than to set an unrealistic goal and struggle.",
      "missed-workouts": "Life happens! Don't double up by never doing back-to-back workouts to catch up. Skip and continue as missing one workout won't hurt your training. Prioritize long runs if you must miss something. Listen to your body as sometimes rest is better than forcing a workout.",
      "other-activities": "Yes! Our 3-day plan leaves room for low-impact cardio like walking, swimming, cycling, elliptical. Strength training focusing on core, glutes, and injury prevention. Flexibility through yoga, stretching, foam rolling. Active recovery with easy movement that promotes blood flow. Just avoid high-impact activities that might interfere with your running recovery.",
      "race-day-prep": "The plan systematically prepares you: Pace familiarity through regular marathon pace runs makes race pace feel comfortable. Speed reserve through 800m intervals makes marathon pace feel easy. Endurance base through long runs builds the aerobic capacity for 26.2 miles. Mental preparation through consistent training builds confidence."
    };

    // Try to find a mapping for this FAQ item
    const faqItem = faqItems.find(item => item.answer === element);
    if (faqItem) {
      const mappedText = textMappings[faqItem.id];
      if (mappedText) {
        return mappedText;
      }
    }

    // Fallback: convert to string and clean up
    return String(element)
      .replace(/[{}[\]"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Marathon Training FAQ - Minimalist 3-Workout Approach",
    "description": "Comprehensive FAQ about our minimalist marathon training approach, site navigation, and common questions about the 3-workout weekly training plan.",
    "url": "https://marathonminimalist.com/faq",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": extractTextFromJSX(item.answer)
      }
    }))
  };

  return JSON.stringify(schema);
};

// Memoized FAQ Section Component with Accessibility
const FAQSection = React.memo(function FAQSection({ 
  item, 
  isOpen, 
  onToggle, 
  searchTerm 
}: { 
  item: FAQItem; 
  isOpen: boolean; 
  onToggle: () => void; 
  searchTerm: string;
}) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }, [onToggle]);

  return (
    <motion.article
      className="border border-border rounded-lg bg-background overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
        id={`faq-question-${item.id}`}
      >
        <h3 className="font-medium text-foreground pr-4">
          {searchTerm ? highlightSearchTerm(item.question, searchTerm) : item.question}
        </h3>
        <ChevronDown 
          size={20} 
          className={cn(
            "text-muted-foreground transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      
      <div
        id={`faq-answer-${item.id}`}
        role="region"
        aria-labelledby={`faq-question-${item.id}`}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 border-t border-border">
          <div className="text-muted-foreground">
            {typeof item.answer === 'string' 
              ? (searchTerm ? highlightSearchTerm(item.answer, searchTerm) : item.answer)
              : item.answer
            }
          </div>
        </div>
      </div>
    </motion.article>
  );
});

const FeatureGuideCard = React.memo(function FeatureGuideCard({ feature }: { feature: FeatureGuide }) {
  const Icon = feature.icon;
  
  return (
    <motion.div
      className="group p-6 border border-border rounded-lg bg-background hover:bg-muted/50 transition-all duration-200 hover:shadow-md"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {feature.description}
          </p>
          <div className="mt-3">
            <a 
              href={feature.path}
              className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200"
            >
              Go to {feature.title}
              <ChevronDown className="h-3 w-3 -rotate-90" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const categories = useMemo(() => 
    ["all", ...Array.from(new Set(faqData.map(item => item.category)))], 
    []
  );

  // Memoized debounced search function
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // Memoized filtered FAQs
  const filteredFAQs = useMemo(() => {
    let filtered = faqData;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = searchFAQs(filtered, searchTerm);
    }
    
    return filtered;
  }, [selectedCategory, searchTerm]);

  // Optimized event handlers with useCallback
  const toggleItem = useCallback((id: string) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const toggleExpandAll = useCallback(() => {
    setExpandAll(prev => {
      const newExpandAll = !prev;
      if (newExpandAll) {
        setExpandedItems(new Set(filteredFAQs.map(item => item.id)));
      } else {
        setExpandedItems(new Set());
      }
      return newExpandAll;
    });
  }, [filteredFAQs]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    const input = document.getElementById('faq-search') as HTMLInputElement;
    if (input) input.value = "";
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(id);
    }
  }, [toggleItem]);

  // Memoized schema markup
  const schemaMarkup = useMemo(() => generateFAQSchema(faqData), []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaMarkup
        }}
      />

      {/* Header */}
      <motion.header
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">FAQ & Guide</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about our minimalist marathon training approach. 
          Find answers to common questions and learn how to make the most of your training.
        </p>
      </motion.header>

      {/* Search and Filters */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        aria-label="Search and filter options"
      >
        {/* Search Input */}
        <div className="relative">
          <label htmlFor="faq-search" className="sr-only">
            Search frequently asked questions
          </label>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
            <Search size={20} />
          </div>
          <input
            id="faq-search"
            type="text"
            placeholder="Search FAQs..."
            className="w-full pl-10 pr-10 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            onChange={(e) => debouncedSearch(e.target.value)}
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            Search through questions and answers to find specific information
          </div>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Category Filter and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                aria-pressed={selectedCategory === category}
              >
                {category === "all" ? "All Categories" : category.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
          
          <button
            onClick={toggleExpandAll}
            className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
            aria-label={expandAll ? "Collapse all questions" : "Expand all questions"}
          >
            {expandAll ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {filteredFAQs.length === 0 
              ? `No results found for "${searchTerm}"`
              : `Found ${filteredFAQs.length} result${filteredFAQs.length === 1 ? '' : 's'} for "${searchTerm}"`
            }
          </div>
        )}
      </motion.section>

      {/* Feature Guides */}
      {!searchTerm && (
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-foreground">Site Navigation Guide</h2>
          <p className="text-muted-foreground">
            Get familiar with the main features and learn how to navigate the training platform.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featureGuides.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              >
                <FeatureGuideCard feature={feature} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Training Philosophy Summary */}
      {!searchTerm && (
        <motion.section
          className="p-6 border border-border rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Training Philosophy</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Quality Over Quantity
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                We focus on three specific workout types that target different energy systems. 
                This minimalist approach reduces injury risk while maximizing training adaptation.
              </p>
              
              <h3 className="font-semibold text-foreground mb-3">
                Smart Recovery
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                No back-to-back training days means your body has time to repair and adapt. 
                This leads to better performance and lower injury rates.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Progressive Training
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Each workout builds on the previous ones. The plan gradually increases in 
                difficulty while maintaining the same sustainable 3-day structure.
              </p>
              
              <h3 className="font-semibold text-foreground mb-3">
                Automatic Pacing
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your 5K pace for intervals is calculated automatically from your marathon goal. 
                No guesswork - just enter your target time and start training.
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* FAQ Items */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        aria-label="Frequently asked questions"
      >
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12" role="status">
            <div className="p-4 rounded-lg bg-muted/20 text-muted-foreground">
              <p className="text-lg font-medium mb-2">No questions found</p>
              <p>Try adjusting your search terms or category filter.</p>
            </div>
          </div>
        ) : (
          filteredFAQs.map((item, index) => (
            <FAQSection
              key={item.id}
              item={item}
              isOpen={expandedItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
              searchTerm={searchTerm}
            />
          ))
        )}
      </motion.section>

      {/* Contact & Support */}
      <motion.section
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-foreground">Still Need Help?</h2>
        <div className="flex justify-center">
          <div className="p-6 border border-border rounded-lg bg-background max-w-md w-full">
            <h3 className="font-semibold text-foreground mb-3">Training Questions</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Need personalized advice about your training plan or have specific running questions?
            </p>
            <a 
              href="mailto:coach@marathonminimalist.com"
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              coach@marathonminimalist.com
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
} 