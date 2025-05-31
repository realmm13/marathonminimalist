'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScheduleCalendar } from '@/components/training/ScheduleCalendar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Settings, Save, RotateCcw, AlertTriangle, Copy, Trash2, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  WeekTemplateManager, 
  WeekTemplate, 
  BulkOperation 
} from '@/lib/training/week-template-manager';

export default function SchedulePage() {
  const [selectedWorkoutDays, setSelectedWorkoutDays] = useState<number[]>([1, 3, 6]); // Mon, Wed, Sat
  const [view, setView] = useState<'week' | 'month'>('week');
  const [allowWeekByWeekAdjustments, setAllowWeekByWeekAdjustments] = useState(false);
  const [weeklyOverrides, setWeeklyOverrides] = useState<Record<number, number[]>>({});
  const [currentWeek] = useState(2); // Example current week
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRestDayControls, setShowRestDayControls] = useState(false);
  const [preferredRestDays, setPreferredRestDays] = useState<number[]>([1, 7]); // Monday and Sunday
  const [enforceRestDays, setEnforceRestDays] = useState(false);
  
  // Week management state
  const [showWeekManagement, setShowWeekManagement] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WeekTemplate | null>(null);
  const [bulkTargetWeeks, setBulkTargetWeeks] = useState<number[]>([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  const handleWorkoutDaysChange = (days: number[]) => {
    setSelectedWorkoutDays(days);
    toast.success(`Updated workout days: ${days.map(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d - 1]).join(', ')}`);
  };

  const handleWeeklyOverrideChange = (week: number, days: number[]) => {
    setWeeklyOverrides(prev => ({
      ...prev,
      [week]: days
    }));
    
    if (days.length === 0) {
      // Remove override
      const newOverrides = { ...weeklyOverrides };
      delete newOverrides[week];
      setWeeklyOverrides(newOverrides);
      toast.success(`Reset Week ${week} to default schedule`);
    } else {
      toast.success(`Updated Week ${week}: ${days.map(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d - 1]).join(', ')}`);
    }
  };

  const handleSaveSchedule = () => {
    // In a real app, this would save to the backend
    console.log('Saving schedule:', {
      defaultWorkoutDays: selectedWorkoutDays,
      weeklyOverrides
    });
    toast.success('Schedule saved successfully!');
  };

  const handleResetAll = () => {
    setSelectedWorkoutDays([1, 3, 6]); // Reset to Mon, Wed, Sat
    setWeeklyOverrides({});
    toast.success('Reset to default schedule');
  };

  const getScheduleSummary = () => {
    const overrideCount = Object.keys(weeklyOverrides).length;
    const totalWorkouts = Array.from({ length: 14 }, (_, i) => {
      const week = i + 1;
      const days = weeklyOverrides[week] || selectedWorkoutDays;
      return days.length;
    }).reduce((sum, count) => sum + count, 0);

    return { overrideCount, totalWorkouts };
  };

  const { overrideCount, totalWorkouts } = getScheduleSummary();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Schedule Configuration
          </h1>
          <p className="body-large text-muted-foreground mt-2">
            Configure your workout schedule and make week-by-week adjustments
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleResetAll}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={handleSaveSchedule}>
            <Save className="h-4 w-4 mr-2" />
            Save Schedule
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Default Schedule</p>
              <p className="text-2xl font-bold">
                {selectedWorkoutDays.length} days/week
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custom Weeks</p>
              <p className="text-2xl font-bold">
                {overrideCount} weeks
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Workouts</p>
              <p className="text-2xl font-bold">
                {totalWorkouts} workouts
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="heading-5 mb-2">View Options</h3>
              <SegmentedControl
                value={view}
                onChange={(value: string) => setView(value as 'week' | 'month')}
                options={[
                  { label: 'Week View', value: 'week' },
                  { label: 'Month View', value: 'month' },
                ]}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="week-adjustments"
                checked={allowWeekByWeekAdjustments}
                onCheckedChange={setAllowWeekByWeekAdjustments}
              />
              <Label htmlFor="week-adjustments" className="text-sm font-medium">
                Enable week-by-week adjustments
              </Label>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Current workout days:</p>
            <div className="flex gap-1">
              {selectedWorkoutDays.map(day => (
                <Badge key={day} variant="outline" color="blue" size="sm">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Rest Day Configuration */}
      {showRestDayControls && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Rest Day Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your preferred rest days for optimal recovery
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enforce-rest-days"
                  checked={enforceRestDays}
                  onCheckedChange={setEnforceRestDays}
                />
                <Label htmlFor="enforce-rest-days" className="text-sm">
                  Enforce strictly
                </Label>
              </div>
            </div>

            {/* Rest Day Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preferred Rest Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const dayNumber = index + 1;
                  const isSelected = preferredRestDays.includes(dayNumber);
                  const hasWorkout = selectedWorkoutDays.includes(dayNumber);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (isSelected) {
                          setPreferredRestDays(prev => prev.filter(d => d !== dayNumber));
                        } else {
                          setPreferredRestDays(prev => [...prev, dayNumber]);
                        }
                      }}
                      className={cn(
                        "p-3 text-sm font-medium rounded-lg border transition-all",
                        isSelected && !hasWorkout && "bg-green-100 border-green-300 text-green-800",
                        isSelected && hasWorkout && "bg-orange-100 border-orange-300 text-orange-800",
                        !isSelected && "bg-background border-border hover:border-primary/50"
                      )}
                    >
                      <div className="text-center">
                        <div>{day}</div>
                        {hasWorkout && isSelected && (
                          <div className="text-xs mt-1">⚠️ Conflict</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rest Day Analysis */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Rest Day Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Total rest days per week:</span>
                  <Badge variant="outline" color={7 - selectedWorkoutDays.length >= 2 ? "green" : "orange"}>
                    {7 - selectedWorkoutDays.length} days
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Preferred rest days:</span>
                  <Badge variant="outline" color="blue">
                    {preferredRestDays.length} selected
                  </Badge>
                </div>
                {preferredRestDays.some(day => selectedWorkoutDays.includes(day)) && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Some preferred rest days conflict with workout days</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-rest-day-controls"
                checked={showRestDayControls}
                onCheckedChange={setShowRestDayControls}
              />
              <Label htmlFor="show-rest-day-controls" className="text-sm">
                Rest day customization
              </Label>
            </div>
          </div>
        </Card>
      )}

      {/* Schedule Calendar */}
      <ScheduleCalendar
        selectedWorkoutDays={selectedWorkoutDays}
        onWorkoutDaysChange={handleWorkoutDaysChange}
        currentWeek={currentWeek}
        totalWeeks={14}
        view={view}
        allowWeekByWeekAdjustments={allowWeekByWeekAdjustments}
        weeklyOverrides={weeklyOverrides}
        onWeeklyOverrideChange={handleWeeklyOverrideChange}
        preferredRestDays={preferredRestDays}
        onPreferredRestDaysChange={setPreferredRestDays}
        showRestDayControls={showRestDayControls}
        enforceRestDays={enforceRestDays}
        onEnforceRestDaysChange={setEnforceRestDays}
      />

      {/* Weekly Overrides Summary */}
      {allowWeekByWeekAdjustments && overrideCount > 0 && (
        <Card className="p-6">
          <h3 className="heading-5 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Week Schedules
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(weeklyOverrides).map(([week, days]) => (
              <div key={week} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Week {week}</span>
                  <Badge variant="outline" color="orange" size="sm">
                    Custom
                  </Badge>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {days.map(day => (
                    <Badge key={day} variant="outline" color="blue" size="sm">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1]}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Help Text */}
      <Card className="p-6 bg-muted/50">
        <h3 className="heading-6 mb-3">How to use Schedule Configuration</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Default Schedule:</strong> Set your preferred workout days that will apply to all weeks</p>
          <p>• <strong>Week View:</strong> Navigate through individual weeks to see your schedule</p>
          <p>• <strong>Month View:</strong> Get an overview of your entire monthly schedule</p>
          {allowWeekByWeekAdjustments && (
            <>
              <p>• <strong>Week-by-Week Adjustments:</strong> Click "Customize" to modify specific weeks</p>
              <p>• <strong>Custom Schedules:</strong> Weeks with orange indicators have custom schedules</p>
              <p>• <strong>Reset:</strong> Use "Reset" to remove custom schedules and return to default</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
} 