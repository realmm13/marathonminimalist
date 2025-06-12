"use client";
import { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, Timer, Play, Pause, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load heavy components
const LazyMotionDiv = dynamic(() => import("framer-motion").then(mod => ({ default: mod.motion.div })), {
  ssr: false,
});

interface TabProps {
  id: string;
  label: string;
  icon: typeof Calculator;
}

const tabs: TabProps[] = [
  { id: "pace", label: "Pace Calculator", icon: Calculator },
  { id: "progress", label: "Progress Tracker", icon: TrendingUp },
  { id: "timer", label: "Workout Timer", icon: Timer },
];

// Memoized Pace Calculator Component
const PaceCalculatorDemo = memo(() => {
  const [distance, setDistance] = useState(26.2);
  const [targetTime, setTargetTime] = useState("4:00:00");
  
  const calculatePace = useCallback(() => {
    const timeParts = targetTime.split(":").map(Number);
    const [hours = 0, minutes = 0, seconds = 0] = timeParts;
    
    // Validate that we have valid numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return "0:00";
    }
    
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    const paceMinutes = totalMinutes / distance;
    const paceMin = Math.floor(paceMinutes);
    const paceSec = Math.round((paceMinutes - paceMin) * 60);
    return `${paceMin}:${paceSec.toString().padStart(2, "0")}`;
  }, [distance, targetTime]);

  const pace = useMemo(() => calculatePace(), [calculatePace]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block body-small font-medium text-foreground mb-2">
            Distance (miles)
          </label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm bg-background text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            step="0.1"
            min="0"
          />
        </div>
        <div>
          <label className="block body-small font-medium text-foreground mb-2">
            Target Time
          </label>
          <input
            type="text"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            placeholder="4:00:00"
            className="w-full rounded-md border border-border px-3 py-2 text-sm bg-background text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="rounded-lg bg-muted p-4 text-center">
        <p className="body-small text-muted-foreground">Required Pace</p>
        <p className="text-2xl font-bold text-primary">{pace} /mile</p>
      </div>
    </div>
  );
});

PaceCalculatorDemo.displayName = "PaceCalculatorDemo";

// Memoized Progress Tracker Component
const ProgressTrackerDemo = memo(() => {
  const [currentWeek, setCurrentWeek] = useState(8);
  const totalWeeks = 16;
  
  const progressPercentage = useMemo(() => (currentWeek / totalWeeks) * 100, [currentWeek, totalWeeks]);

  const weeklyData = useMemo(() => [
    { week: 6, miles: 25 },
    { week: 7, miles: 30 },
    { week: 8, miles: 35 },
    { week: 9, miles: 40 },
    { week: 10, miles: 45 },
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="body-small font-medium text-foreground">Training Progress</span>
        <span className="body-small text-muted-foreground">
          Week {currentWeek} of {totalWeeks}
        </span>
      </div>
      
      <div className="relative h-2 rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
          className="rounded-md bg-muted px-3 py-1 body-small hover:bg-muted/80 text-foreground transition-colors"
          disabled={currentWeek <= 1}
        >
          Previous Week
        </button>
        <button
          onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
          className="rounded-md bg-muted px-3 py-1 body-small hover:bg-muted/80 text-foreground transition-colors"
          disabled={currentWeek >= totalWeeks}
        >
          Next Week
        </button>
      </div>
      
      <div className="mt-4 grid grid-cols-5 gap-2">
        {weeklyData.map((data) => (
          <div
            key={data.week}
            className={`rounded-lg p-2 text-center body-small ${
              data.week === currentWeek
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <div className="font-medium">W{data.week}</div>
            <div>{data.miles}mi</div>
          </div>
        ))}
      </div>
    </div>
  );
});

ProgressTrackerDemo.displayName = "ProgressTrackerDemo";

// Memoized Workout Timer Component
const WorkoutTimerDemo = memo(() => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    
    // Store interval ID for cleanup
    (window as any).timerInterval = interval;
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    if ((window as any).timerInterval) {
      clearInterval((window as any).timerInterval);
    }
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    if ((window as any).timerInterval) {
      clearInterval((window as any).timerInterval);
    }
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="rounded-lg bg-muted p-6">
        <div className="text-4xl font-mono font-bold text-foreground">
          {formatTime(time)}
        </div>
        <div className="mt-2 body-small text-muted-foreground">
          Workout Duration
        </div>
      </div>
      
      <div className="flex justify-center space-x-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play size={16} />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center space-x-2 rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Pause size={16} />
            <span>Pause</span>
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 rounded-md bg-muted px-4 py-2 text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
});

WorkoutTimerDemo.displayName = "WorkoutTimerDemo";

// Main component with performance optimizations
export default function InteractiveFeatureDemo() {
  const [activeTab, setActiveTab] = useState("pace");

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case "pace":
        return <PaceCalculatorDemo />;
      case "progress":
        return <ProgressTrackerDemo />;
      case "timer":
        return <WorkoutTimerDemo />;
      default:
        return <PaceCalculatorDemo />;
    }
  }, [activeTab]);

  return (
    <section className="w-full section-padding" id="interactive-demo">
      <div className="container-enhanced">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="heading-2 mb-4">
              Try Our Training Tools
            </h2>
            <p className="body-large text-muted-foreground">
              Experience the power of our marathon training features with these interactive demos
            </p>
          </motion.div>

          <motion.div
            className="card-enhanced p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Tab Navigation */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 body-small font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 