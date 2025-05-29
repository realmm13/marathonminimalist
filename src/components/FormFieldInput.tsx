"use client";
import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  autoComplete?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function FormFieldInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  disabled = false,
  className,
  inputClassName,
  required = false,
  autoComplete,
  leftIcon,
  rightIcon,
}: FormFieldInputProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-2', className)}>
          {label && (
            <FormLabel className={cn(
              'body-small font-medium text-foreground',
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              {leftIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  {leftIcon}
                </div>
              )}
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                className={cn(
                  'input-enhanced transition-all duration-200',
                  leftIcon ? 'pl-10' : 'pl-3',
                  rightIcon ? 'pr-10' : 'pr-3',
                  fieldState.error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                  inputClassName
                )}
                {...field}
              />
              {rightIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  {rightIcon}
                </div>
              )}
            </div>
          </FormControl>
          {description && (
            <FormDescription className="body-xs text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage className="body-xs text-destructive" />
        </FormItem>
      )}
    />
  );
}
