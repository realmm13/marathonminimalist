"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { CustomButton } from "@/components/CustomButton";
import { FormFieldInput } from "@/components/FormFieldInput";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchemaType,
} from "@/schemas/forgot-password-schema";
import { EmailSentAnimation } from "@/app/(landing)/(auth)/signup/success-animation";
import {
  AnimatedFormWrapper,
  AnimatedFormHeader,
  AnimatedFormContent,
  AnimatedFormFields,
  AnimatedSuccessContent,
} from "@/components/auth/AnimatedFormComponents";
import { Mail } from "lucide-react";

interface ForgotPasswordFormProps {
  className?: string;
  onSubmit: (values: ForgotPasswordSchemaType) => Promise<void>;
  isLoading: boolean;
  submitted?: boolean;
}

export function ForgotPasswordForm({
  className,
  onSubmit,
  isLoading,
  submitted = false,
  ...props
}: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <AnimatedFormWrapper className={className} {...props}>
      <AnimatedFormHeader
        title={submitted ? "Check Your Email 📧" : "Reset Your Password"}
        description={
          submitted
            ? "We've sent you a reset link"
            : "Enter your email address and we'll send you a link to reset your password"
        }
      />
      <AnimatedFormContent>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatedSuccessContent isVisible={submitted}>
              <EmailSentAnimation description="If an account exists with the email you provided, you will receive a password reset link shortly. Please check your inbox (and spam folder) and follow the instructions to reset your password." />
            </AnimatedSuccessContent>

            <AnimatedFormFields isVisible={!submitted}>
              <div className="space-y-4">
                <FormFieldInput
                  control={form.control}
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email address"
                  leftIcon={<Mail size={18} />}
                  required
                />

                <CustomButton
                  loading={isLoading}
                  className="w-full"
                  type="submit"
                >
                  Send Reset Link
                </CustomButton>
              </div>
            </AnimatedFormFields>
          </form>
        </FormProvider>
      </AnimatedFormContent>
    </AnimatedFormWrapper>
  );
}
