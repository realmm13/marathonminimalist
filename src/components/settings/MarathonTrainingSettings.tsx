"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldSegmentedControl } from "@/components/FormFieldSegmentedControl";
import { FormFieldInput } from "@/components/FormFieldInput";
import { FormFieldCheckbox } from "@/components/FormFieldCheckbox";
import { Target, Calendar } from "lucide-react";
import { toast } from "sonner";

// Expanded schema to include workout days
const marathonSettingsSchema = z.object({
  distanceUnit: z.enum(["MILES", "KILOMETERS"]),
  goalMarathonTime: z.string().optional(),
  current5KTime: z.string().optional(),
  marathonDate: z.string().optional(),
  workoutDays: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }).refine((days) => {
    // Ensure exactly 3 days are selected
    const selectedDays = Object.values(days).filter(Boolean).length;
    return selectedDays === 3;
  }, {
    message: "Please select exactly 3 workout days",
  }),
});

type MarathonSettingsFormData = z.infer<typeof marathonSettingsSchema>;

export function MarathonTrainingSettings() {
  const form = useForm<MarathonSettingsFormData>({
    resolver: zodResolver(marathonSettingsSchema),
    defaultValues: {
      distanceUnit: "MILES",
      goalMarathonTime: "",
      current5KTime: "",
      marathonDate: "",
      workoutDays: {
        monday: true,   // Default: Monday, Wednesday, Saturday
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: true,
        sunday: false,
      },
    },
  });

  const onSubmit = async (data: MarathonSettingsFormData) => {
    try {
      // Convert workout days from checkbox format to array format
      const workoutDaysArray: number[] = [];
      if (data.workoutDays.monday) workoutDaysArray.push(1);
      if (data.workoutDays.tuesday) workoutDaysArray.push(2);
      if (data.workoutDays.wednesday) workoutDaysArray.push(3);
      if (data.workoutDays.thursday) workoutDaysArray.push(4);
      if (data.workoutDays.friday) workoutDaysArray.push(5);
      if (data.workoutDays.saturday) workoutDaysArray.push(6);
      if (data.workoutDays.sunday) workoutDaysArray.push(7);
      
      // Automatically set pace format based on distance unit
      const settingsWithPace = {
        ...data,
        paceFormat: data.distanceUnit === "MILES" ? "MIN_PER_MILE" : "MIN_PER_KM",
        workoutDays: workoutDaysArray,
      };
      
      console.log("Marathon training settings:", settingsWithPace);
      toast.success("Marathon training settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
        <div className="space-y-6">
          <div>
            <h4 className="heading-5 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Distance Preferences
            </h4>
            <p className="body-small text-muted-foreground mb-4">
              Choose your preferred unit for distances and paces
            </p>
            <FormFieldSegmentedControl
              name="distanceUnit"
              label="Distance Unit"
              description="Pace format will be automatically set (min/mile or min/km)"
              options={[
                { label: "Miles", value: "MILES" },
                { label: "Kilometers", value: "KILOMETERS" },
              ]}
            />
          </div>

          <div>
            <h4 className="heading-5 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Marathon Goals
            </h4>
            <p className="body-small text-muted-foreground mb-4">
              Set your marathon goals and current fitness level
            </p>
            <div className="space-y-4">
              <FormFieldInput
                name="goalMarathonTime"
                label="Goal Marathon Time"
                description="Your target marathon finish time (e.g., 4:30:00)"
                placeholder="4:30:00"
                control={form.control}
              />

              <FormFieldInput
                name="current5KTime"
                label="Current 5K Time"
                description="Your recent 5K time to help estimate training paces"
                placeholder="25:00"
                control={form.control}
              />

              <FormFieldInput
                name="marathonDate"
                label="Marathon Date"
                description="When is your target marathon?"
                type="date"
                control={form.control}
              />
            </div>
          </div>

          <div>
            <h4 className="heading-5 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Workout Schedule
            </h4>
            <p className="body-small text-muted-foreground mb-4">
              Choose 3 days per week for your workouts. Recommended patterns ensure 2-day rest periods.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormFieldCheckbox
                  name="workoutDays.monday"
                  label="Monday"
                  control={form.control}
                />
                <FormFieldCheckbox
                  name="workoutDays.tuesday"
                  label="Tuesday"
                  control={form.control}
                />
                <FormFieldCheckbox
                  name="workoutDays.wednesday"
                  label="Wednesday"
                  control={form.control}
                />
                <FormFieldCheckbox
                  name="workoutDays.thursday"
                  label="Thursday"
                  control={form.control}
                />
                <FormFieldCheckbox
                  name="workoutDays.friday"
                  label="Friday"
                  control={form.control}
                />
                <FormFieldCheckbox
                  name="workoutDays.saturday"
                  label="Saturday"
                  control={form.control}
                />
                <FormFieldCheckbox
                  name="workoutDays.sunday"
                  label="Sunday"
                  control={form.control}
                />
              </div>
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-1">Recommended patterns:</p>
                <p>• Monday/Wednesday/Friday</p>
                <p>• Monday/Wednesday/Saturday</p>
                <p>• Tuesday/Thursday/Saturday</p>
                <p>• Tuesday/Thursday/Sunday</p>
              </div>
            </div>
          </div>

          <div className="pt-4 pb-4 settings-button-container">
            <Button type="submit" variant="secondary" className="w-full btn-no-transform">
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 