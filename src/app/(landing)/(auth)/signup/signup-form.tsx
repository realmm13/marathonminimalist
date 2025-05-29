"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { CustomButton } from "@/components/CustomButton";
import { FormFieldInput } from "@/components/FormFieldInput";
import { LoginWithGitHub } from "@/components/auth/LoginWithGitHub";
import { signUpSchema, type SignUpSchemaType } from "@/schemas/signup-schema";
import { EmailSentAnimation } from "./success-animation";
import {
  AnimatedFormWrapper,
  AnimatedFormHeader,
  AnimatedFormContent,
  AnimatedFormFields,
  AnimatedSuccessContent,
} from "@/components/auth/AnimatedFormComponents";
import { showEmailPasswordFields, hasGithubIntegration } from "@/config/config";
import { User, Mail, Lock } from "lucide-react";

interface SignupFormProps {
  className?: string;
  onSubmit: (values: SignUpSchemaType) => Promise<void>;
  isLoading: boolean;
  isSubmitted: boolean;
}

export function SignupForm({
  className,
  onSubmit,
  isLoading,
  isSubmitted,
  ...props
}: SignupFormProps) {
  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <AnimatedFormWrapper className={className} {...props}>
      <AnimatedFormHeader
        title={isSubmitted ? "Welcome Aboard! 🎉" : "Join the Community"}
        description={
          isSubmitted
            ? "Your account has been created successfully"
            : "Start your marathon training journey with us today"
        }
      />
      <AnimatedFormContent>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatedSuccessContent isVisible={isSubmitted}>
              <EmailSentAnimation description="Thank you for signing up! We've sent a verification link to your email address. Please check your inbox and follow the instructions to complete your registration." />
            </AnimatedSuccessContent>

            <AnimatedFormFields isVisible={!isSubmitted}>
              {showEmailPasswordFields && (
                <div className="space-y-4">
                  <FormFieldInput
                    control={form.control}
                    name="name"
                    label="Full Name"
                    type="text"
                    placeholder="Enter your full name"
                    leftIcon={<User size={18} />}
                    required
                  />

                  <FormFieldInput
                    control={form.control}
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    leftIcon={<Mail size={18} />}
                    required
                  />

                  <FormFieldInput
                    control={form.control}
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Create a secure password"
                    leftIcon={<Lock size={18} />}
                    required
                  />

                  <CustomButton className="w-full" loading={isLoading}>
                    Create Account
                  </CustomButton>
                </div>
              )}

              {hasGithubIntegration && (
                <div className="relative">
                  {showEmailPasswordFields && (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted" />
                      </div>
                      <div className="relative flex justify-center body-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                  )}
                  <LoginWithGitHub
                    label="Sign up with Github"
                    className="mt-4 w-full"
                  />
                </div>
              )}

              {showEmailPasswordFields && (
                <div className="text-center body-small">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link 
                    href="/signin" 
                    className="text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline focus-ring rounded font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </AnimatedFormFields>
          </form>
        </FormProvider>
      </AnimatedFormContent>
    </AnimatedFormWrapper>
  );
}
