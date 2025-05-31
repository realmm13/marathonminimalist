'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedControlOption[];
  className?: string;
}

export function SegmentedControl({
  value,
  onChange,
  options,
  className
}: SegmentedControlProps) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-lg bg-muted p-1",
      className
    )}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
            "hover:bg-background/80",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
} 