import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FormFieldCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  checkboxClassName?: string;
  required?: boolean;
}

export function FormFieldCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
  checkboxClassName,
  required = false,
}: FormFieldCheckboxProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-3', className)}>
          <div className="flex items-start space-x-3">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className={cn(
                  'mt-0.5 transition-all duration-200 focus-ring',
                  fieldState.error && 'border-destructive data-[state=checked]:bg-destructive',
                  checkboxClassName
                )}
              />
            </FormControl>
            <div className="grid gap-1.5 leading-none">
              {label && (
                <FormLabel className={cn(
                  'body-small font-medium text-foreground cursor-pointer',
                  required && "after:content-['*'] after:ml-0.5 after:text-destructive",
                  disabled && 'cursor-not-allowed opacity-70'
                )}>
                  {label}
                </FormLabel>
              )}
              {description && (
                <FormDescription className="body-xs text-muted-foreground">
                  {description}
                </FormDescription>
              )}
            </div>
          </div>
          <FormMessage className="body-xs text-destructive" />
        </FormItem>
      )}
    />
  );
}
