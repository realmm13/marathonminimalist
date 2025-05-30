"use client";

import { Card } from "@/components/ui/card";
import { Search, Target } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Calendar,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';

export function DashboardContent() {
  return (
    <div className="container-enhanced py-0">
      
      {/* Enhanced header section */}
      <div className="mb-3 animate-slide-down">
        <h1 className="heading-1 mb-4 text-gradient">
          Marathon Training Dashboard
        </h1>
        <p className="body-large text-muted-foreground max-w-2xl">
          Track your progress and stay on top of your marathon training plan with comprehensive analytics and personalized insights.
        </p>
      </div>

      {/* Enhanced search section */}
      <div className="relative mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors duration-200" />
        <input
          className="input-enhanced w-full pl-12 pr-4 py-3 text-base placeholder:text-muted-foreground/70 hover-lift focus:shadow-lg"
          placeholder="Search workouts, progress, or training plans..."
          type="search"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <kbd className="px-2 py-1 text-xs bg-muted rounded border text-muted-foreground">⌘K</kbd>
        </div>
      </div>

      {/* Training Overview */}
      <div className="animate-fade-in-up mb-8" style={{ animationDelay: '0.2s' }}>
        <Card className="card-enhanced p-6">
          <h3 className="heading-5 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Training Overview
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">16</div>
              <div className="body-small text-muted-foreground">Weeks to Marathon</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">65%</div>
              <div className="body-small text-muted-foreground">Training Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">42</div>
              <div className="body-small text-muted-foreground">Peak Weekly Miles</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Quick Stats Card - moved to bottom */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <Card className="card-enhanced p-6">
          <h3 className="heading-5 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            This Week Summary
          </h3>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">24.5 mi</div>
              <div className="body-small text-muted-foreground">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">4 of 5</div>
              <div className="body-small text-muted-foreground">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">7:42/mi</div>
              <div className="body-small text-muted-foreground">Avg Pace</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">82%</div>
              <div className="body-small text-muted-foreground">Goal Progress</div>
              <div className="progress-bar mt-2" style={{ '--progress': '82%' } as React.CSSProperties}></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 