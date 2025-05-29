"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SegmentedControl } from "@/components/SegmentedControl";
import { FormFieldInput } from "@/components/FormFieldInput";
import { toast } from "sonner";
import { EditProfileFormWithData } from '@/components/forms/EditProfileForm/EditProfileFormWithData';
import { api } from "@/trpc/react";
import { useEffect } from "react";

// Simplified schema with automatic pace format based on distance unit
const marathonSettingsSchema = z.object({
  distanceUnit: z.enum(["MILES", "KILOMETERS"]),
  goalMarathonTime: z.string().optional(),
  current5KTime: z.string().optional(),
  marathonDate: z.string().optional(),
});

type MarathonSettingsFormData = z.infer<typeof marathonSettingsSchema>;

// Function to format time input to HH:MM:SS format
const formatMarathonTime = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  
  // Handle different input lengths
  if (digits.length <= 2) {
    // Just hours: "3" -> "3:00:00"
    return `${digits}:00:00`;
  } else if (digits.length <= 4) {
    // Hours and minutes: "330" -> "3:30:00"
    const hours = digits.slice(0, -2);
    const minutes = digits.slice(-2);
    return `${hours}:${minutes}:00`;
  } else {
    // Hours, minutes, and seconds: "33015" -> "3:30:15"
    const hours = digits.slice(0, -4);
    const minutes = digits.slice(-4, -2);
    const seconds = digits.slice(-2);
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
};

// Function to validate marathon time format
const validateMarathonTime = (value: string): boolean => {
  if (!value) return true; // Optional field
  const timeRegex = /^\d{1,2}:\d{2}:\d{2}$/;
  return timeRegex.test(value);
};

export default function ProfilePage() {
  const form = useForm<MarathonSettingsFormData>({
    resolver: zodResolver(marathonSettingsSchema),
    defaultValues: {
      distanceUnit: "MILES",
      goalMarathonTime: "",
      current5KTime: "",
      marathonDate: "",
    },
  });

  // Load existing marathon settings
  const { data: marathonSettings, isLoading } = api.user.getMarathonSettings.useQuery();
  const updateMarathonSettings = api.user.updateMarathonSettings.useMutation({
    onSuccess: () => {
      toast.success("Marathon training settings saved!");
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (marathonSettings) {
      form.reset({
        distanceUnit: marathonSettings.distanceUnit as "MILES" | "KILOMETERS",
        goalMarathonTime: marathonSettings.goalMarathonTime,
        current5KTime: marathonSettings.current5KTime,
        marathonDate: marathonSettings.marathonDate,
      });
    }
  }, [marathonSettings, form]);

  const onSubmit = async (data: MarathonSettingsFormData) => {
    try {
      await updateMarathonSettings.mutateAsync(data);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="container-enhanced py-2">
        <div className="mb-3 animate-slide-down">
          <h1 className="heading-1 mb-4 text-gradient">
            Profile Settings
          </h1>
          <p className="body-large text-muted-foreground max-w-2xl">
            Manage marathon training preferences to personalize your experience.
          </p>
        </div>
        <div className="card-enhanced p-8 animate-fade-in-up max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-enhanced py-2">
      {/* Enhanced header section */}
      <div className="mb-3 animate-slide-down">
        <h1 className="heading-1 mb-4 text-gradient">
          Profile Settings
        </h1>
        <p className="body-large text-muted-foreground max-w-2xl">
          Manage marathon training preferences to personalize your experience.
        </p>
      </div>

      {/* Single combined card */}
      <div className="card-enhanced p-8 animate-fade-in-up max-w-4xl mx-auto">
        {/* Personal Information Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="heading-3 mb-2">Personal Information</h2>
            <p className="body-small text-muted-foreground">Update your profile details</p>
          </div>
          <EditProfileFormWithData hideSaveButton={true} />
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 my-8"></div>

        {/* Marathon Training Settings Section */}
        <div>
          <div className="mb-6">
            <h2 className="heading-3 mb-2">Marathon Training Settings</h2>
            <p className="body-small text-muted-foreground">Configure your marathon goals and training preferences</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h4 className="heading-5 mb-2">Distance Preferences</h4>
                  <p className="body-small text-muted-foreground mb-4">
                    Choose your preferred unit for distances and paces
                  </p>
                  <div className="space-y-2">
                    <Controller
                      name="distanceUnit"
                      control={form.control}
                      render={({ field }) => (
                        <SegmentedControl
                          options={[
                            { label: "Miles", value: "MILES" },
                            { label: "Kilometers", value: "KILOMETERS" },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          size="md"
                          className="w-full bg-muted border-0 shadow-none"
                          activeTabClassName="bg-primary text-primary-foreground shadow-sm border-0"
                        />
                      )}
                    />
                    <p className="body-small text-muted-foreground">
                      Pace format will be automatically set (min/mile or min/km)
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="heading-5 mb-2">Marathon Goals</h4>
                  <p className="body-small text-muted-foreground mb-4">
                    Set your marathon goals and current fitness level
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Goal Marathon Time</label>
                      <Controller
                        name="goalMarathonTime"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <input
                              {...field}
                              type="text"
                              placeholder="3:00:00"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              onChange={(e) => {
                                const formatted = formatMarathonTime(e.target.value);
                                field.onChange(formatted);
                              }}
                              onBlur={(e) => {
                                const formatted = formatMarathonTime(e.target.value);
                                field.onChange(formatted);
                                field.onBlur();
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              Your target marathon finish time (e.g., 4:30:00)
                            </p>
                            {fieldState.error && (
                              <p className="text-xs text-destructive">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>

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

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateMarathonSettings.isPending}
                >
                  {updateMarathonSettings.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
} 