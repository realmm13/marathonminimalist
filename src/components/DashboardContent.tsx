"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Settings,
  Search,
  Activity,
  Target,
  Calendar,
  User,
  MapPin,
  BarChart3,
  Play,
} from "lucide-react";
import { TrainingBreadcrumb } from '@/components/training/TrainingBreadcrumb';
import { ProgressDashboard } from '@/components/training/ProgressDashboard';
import { useSettingsDialog } from '@/hooks/useSettingsDialog';

export function DashboardContent() {
  const { openSettings } = useSettingsDialog();

  return (
    <div className="container mx-auto px-4 py-8">
      <TrainingBreadcrumb className="mb-6" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marathon Training Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and stay on top of your marathon training plan.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border py-2 pl-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Search workouts, progress, or training plans..."
          type="search"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Progress Dashboard - Takes up most of the space */}
        <div className="lg:col-span-3">
          <ProgressDashboard />
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="mb-6 text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-4">
              
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openSettings("marathon")}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Setup Profile</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your marathon goals, pace targets, and training preferences
                </p>
                <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); openSettings("marathon"); }}>
                  <Settings className="h-4 w-4 mr-2" />
                  Open Settings
                </Button>
              </Card>

              <Link href="/training-plan" className="block">
                <Button
                  className="w-full h-auto flex-col items-start justify-start p-4"
                  variant="outline"
                >
                  <div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full">
                    <Calendar className="text-primary h-5 w-5" />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-sm leading-none font-medium">Training Plan</p>
                    <p className="text-muted-foreground text-xs">
                      View your personalized plan
                    </p>
                  </div>
                </Button>
              </Link>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <Link href="/workout-demo" className="block">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold">Today's Workout</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and start your scheduled training session
                  </p>
                  <Button size="sm" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Workout
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <Link href="/progress-demo" className="block">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Detailed Analytics</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive progress tracking and insights
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </Card>

              <Button
                className="w-full h-auto flex-col items-start justify-start p-4"
                variant="outline"
              >
                <div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full">
                  <MapPin className="text-primary h-5 w-5" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-sm leading-none font-medium">Find Routes</p>
                  <p className="text-muted-foreground text-xs">
                    Discover running routes
                  </p>
                </div>
              </Button>

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 