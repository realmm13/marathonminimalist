"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormFieldInput } from "@/components/FormFieldInput";
import { CustomButton } from "@/components/CustomButton";

// Simplified schema for just the name field
const SimpleProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type EditProfileFormValues = z.infer<typeof SimpleProfileSchema>;

type GetUserForEditingProfileOutput = {
  id: string;
  name: string | null;
};

export const EditProfileForm: React.FC<{
  onSubmit: (values: EditProfileFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialValues?: Partial<GetUserForEditingProfileOutput>;
  onCancel?: () => void;
  hideSaveButton?: boolean;
}> = ({ onSubmit, isSubmitting, initialValues = {}, onCancel, hideSaveButton = false }) => {
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(SimpleProfileSchema),
    defaultValues: {
      name: initialValues.name ?? "",
    },
    mode: "all",
    reValidateMode: "onChange",
  });

  return (
    <div className="w-full">
      <Form {...form}>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <FormFieldInput
              control={form.control}
              name="name"
              label="Name"
              placeholder="Enter your name"
              required
            />

            {!hideSaveButton && (
              <div className="flex gap-2">
                {onCancel && (
                  <CustomButton
                    onClick={(e) => {
                      e.preventDefault();
                      form.reset(initialValues as EditProfileFormValues);
                      onCancel();
                    }}
                    disabled={isSubmitting}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </CustomButton>
                )}
                <CustomButton
                  loading={isSubmitting}
                  disabled={
                    !form.formState.isDirty ||
                    !form.formState.isValid ||
                    isSubmitting
                  }
                  type="submit"
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </CustomButton>
              </div>
            )}
          </form>
        </FormProvider>
      </Form>
    </div>
  );
};
