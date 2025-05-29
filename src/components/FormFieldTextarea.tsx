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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormFieldTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  textareaClassName?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

export function FormFieldTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled = false,
  className,
  textareaClassName,
  required = false,
  rows = 3,
  maxLength,
  showCharCount = false,
}: FormFieldTextareaProps<TFieldValues, TName>) {
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
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={cn(
                  'input-enhanced resize-none transition-all duration-200',
                  fieldState.error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                  textareaClassName
                )}
                {...field}
              />
              {showCharCount && maxLength && (
                <div className="absolute bottom-2 right-2 body-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
                  {field.value?.length || 0}/{maxLength}
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
