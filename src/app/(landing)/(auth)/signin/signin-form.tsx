"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { CustomButton } from "@/components/CustomButton";
import { FormFieldInput } from "@/components/FormFieldInput";
import { LoginWithGitHub } from "@/components/auth/LoginWithGitHub";
import { AuthFormHeader } from "@/components/auth/AuthFormHeader";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { signInSchema, type SignInSchemaType } from "@/schemas/login-schema";
import { showEmailPasswordFields, hasGithubIntegration } from "@/config/config";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";

interface SigninFormProps {
  className?: string;
  onSubmit: (values: SignInSchemaType) => Promise<void>;
  isLoading: boolean;
}

export function SigninForm({
  className,
  onSubmit,
  isLoading,
  ...props
}: SigninFormProps) {
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <motion.div 
      className={cn("flex flex-col gap-6", className)} 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      {...props}
    >
      <Card className="card-enhanced hover-lift shadow-lg">
        <AuthFormHeader 
          title="Welcome Back" 
          description="Sign in to your account to continue your training journey"
          className="bg-gradient-to-br from-background to-muted/30"
        />
        <CardContent className="section-padding">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {showEmailPasswordFields && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <FormFieldInput
                    control={form.control}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    leftIcon={<Mail size={18} />}
                    required
                  />

                  <div>
                    <FormFieldInput
                      control={form.control}
                      name="password"
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      leftIcon={<Lock size={18} />}
                      required
                    />
                    <motion.div 
                      className="mt-2 flex"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <Link
                        href="/forgot-password"
                        className="ml-auto inline-block body-xs text-muted-foreground hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline focus-ring rounded"
                      >
                        Forgot your password?
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              <motion.div 
                className="vertical gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {showEmailPasswordFields && (
                  <CustomButton
                    loading={isLoading}
                    className="w-full"
                    type="submit"
                  >
                    Sign in with Email
                  </CustomButton>
                )}
                {hasGithubIntegration && <LoginWithGitHub />}
              </motion.div>
              
              {showEmailPasswordFields && (
                <motion.div 
                  className="mt-6 text-center body-small"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link 
                    href="/signup" 
                    className="text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline focus-ring rounded font-medium"
                  >
                    Sign up
                  </Link>
                </motion.div>
              )}
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
}
