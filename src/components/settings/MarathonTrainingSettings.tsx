"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldSegmentedControl } from "@/components/FormFieldSegmentedControl";
import { FormFieldInput } from "@/components/FormFieldInput";
import { Calendar, Target, MapPin } from "lucide-react";
import { toast } from "sonner";

// Define the form schema with string literals instead of enums
const marathonSettingsSchema = z.object({
  distanceUnit: z.enum(["MILES", "KILOMETERS"]),
  paceFormat: z.enum(["MIN_PER_MILE", "MIN_PER_KM"]),
  goalMarathonTime: z.string().optional(),
  current5KTime: z.string().optional(),
  marathonDate: z.string().optional(),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  workoutDays: z.array(z.number()),
});

type MarathonSettingsFormData = z.infer<typeof marathonSettingsSchema>;

export function MarathonTrainingSettings() {
  const form = useForm<MarathonSettingsFormData>({
    resolver: zodResolver(marathonSettingsSchema),
    defaultValues: {
      distanceUnit: "MILES",
      paceFormat: "MIN_PER_MILE",
      goalMarathonTime: "",
      current5KTime: "",
      marathonDate: "",
      experienceLevel: "BEGINNER",
      workoutDays: [1, 3, 5],
    },
  });

  const onSubmit = async (data: MarathonSettingsFormData) => {
    try {
      console.log("Marathon training settings:", data);
      toast.success("Marathon training settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Distance & Pace Preferences
              </CardTitle>
              <CardDescription>
                Configure how distances and paces are displayed throughout the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldSegmentedControl
                name="distanceUnit"
                label="Distance Unit"
                description="Choose your preferred unit for displaying distances"
                options={[
                  { label: "Miles", value: "MILES" },
                  { label: "Kilometers", value: "KILOMETERS" },
                ]}
              />

              <FormFieldSegmentedControl
                name="paceFormat"
                label="Pace Format"
                description="Choose how pace is displayed"
                options={[
                  { label: "min/mile", value: "MIN_PER_MILE" },
                  { label: "min/km", value: "MIN_PER_KM" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Marathon Goals
              </CardTitle>
              <CardDescription>
                Set your marathon goals and current fitness level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldInput
                name="goalMarathonTime"
                label="Goal Marathon Time"
                description="Your target marathon finish time (e.g., 4:30:00)"
                placeholder="4:30:00"
              />

              <FormFieldInput
                name="current5KTime"
                label="Current 5K Time"
                description="Your recent 5K time to help estimate training paces"
                placeholder="25:00"
              />

              <FormFieldInput
                name="marathonDate"
                label="Marathon Date"
                description="When is your target marathon?"
                type="date"
              />

              <FormFieldSegmentedControl
                name="experienceLevel"
                label="Experience Level"
                description="Your running experience level"
                options={[
                  { label: "Beginner", value: "BEGINNER" },
                  { label: "Intermediate", value: "INTERMEDIATE" },
                  { label: "Advanced", value: "ADVANCED" },
                ]}
              />

              <Button type="submit" className="w-full">
                Save Marathon Settings
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
} 