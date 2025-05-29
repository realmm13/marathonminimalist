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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface FormFieldSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  switchClassName?: string;
  required?: boolean;
}

export function FormFieldSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
  switchClassName,
  required = false,
}: FormFieldSwitchProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-3', className)}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {label && (
                <FormLabel className={cn(
                  'body-small font-medium text-foreground',
                  required && "after:content-['*'] after:ml-0.5 after:text-destructive",
                  disabled && 'opacity-70'
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
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className={cn(
                  'transition-all duration-200 focus-ring',
                  fieldState.error && 'border-destructive',
                  switchClassName
                )}
              />
            </FormControl>
          </div>
          <FormMessage className="body-xs text-destructive" />
        </FormItem>
      )}
    />
  );
}
