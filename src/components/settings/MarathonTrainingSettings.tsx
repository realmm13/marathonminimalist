"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldSegmentedControl } from "@/components/FormFieldSegmentedControl";
import { FormFieldInput } from "@/components/FormFieldInput";
import { Target } from "lucide-react";
import { toast } from "sonner";

// Simplified schema with automatic pace format based on distance unit
const marathonSettingsSchema = z.object({
  distanceUnit: z.enum(["MILES", "KILOMETERS"]),
  goalMarathonTime: z.string().optional(),
  current5KTime: z.string().optional(),
  marathonDate: z.string().optional(),
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
    },
  });

  const onSubmit = async (data: MarathonSettingsFormData) => {
    try {
      // Automatically set pace format based on distance unit
      const settingsWithPace = {
        ...data,
        paceFormat: data.distanceUnit === "MILES" ? "MIN_PER_MILE" : "MIN_PER_KM",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <Button type="submit" className="w-full">
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
} 