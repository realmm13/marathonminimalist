# Marathon Minimalist Design System

A comprehensive design system for the Marathon Minimalist training application, built with Tailwind CSS v4, React, and TypeScript.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations](#animations)
7. [Accessibility](#accessibility)
8. [Usage Guidelines](#usage-guidelines)

## Design Principles

### 1. **Minimalist & Focused**
- Clean, uncluttered interfaces that prioritize content
- Purposeful use of whitespace
- Clear visual hierarchy

### 2. **Performance-Oriented**
- Lightweight components with minimal overhead
- Optimized animations and transitions
- Efficient CSS using Tailwind's utility-first approach

### 3. **Accessible by Default**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios

### 4. **Consistent & Predictable**
- Standardized spacing, colors, and typography
- Reusable component patterns
- Consistent interaction behaviors

## Color System

### Primary Colors
Our color system uses OKLCH color space for better perceptual uniformity and supports both light and dark modes.

```css
/* Primary - Marathon Orange */
--primary: oklch(0.65 0.2 25);           /* Main brand color */
--primary-foreground: oklch(0.98 0.01 25); /* Text on primary */
--primary-hover: oklch(0.7 0.22 25);     /* Hover state */
--primary-active: oklch(0.6 0.18 25);    /* Active state */

/* Secondary - Neutral Gray */
--secondary: oklch(0.9 0.005 240);       /* Light mode */
--secondary-foreground: oklch(0.1 0.01 240);
--secondary-hover: oklch(0.85 0.005 240);
--secondary-active: oklch(0.8 0.005 240);
```

### Semantic Colors
```css
/* Success - Green */
--success: oklch(0.6 0.15 145);
--success-foreground: oklch(0.98 0.01 145);

/* Warning - Yellow */
--warning: oklch(0.75 0.15 65);
--warning-foreground: oklch(0.08 0.01 65);

/* Destructive - Red */
--destructive: oklch(0.65 0.2 15);
--destructive-foreground: oklch(0.98 0.01 15);

/* Info - Blue */
--info: oklch(0.65 0.15 240);
--info-foreground: oklch(0.98 0.01 240);
```

### Usage Examples
```tsx
// Using semantic color classes
<div className="bg-success text-success-foreground">Success message</div>
<div className="bg-warning text-warning-foreground">Warning message</div>
<div className="bg-destructive text-destructive-foreground">Error message</div>

// Using custom color utilities
<div className="badge-success">Completed</div>
<div className="badge-warning">In Progress</div>
<div className="badge-error">Failed</div>
```

## Typography

### Font Scale
We use a harmonious type scale based on a 1.125 ratio for better readability.

```css
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-size-2xl: 1.5rem;     /* 24px */
--font-size-3xl: 1.875rem;   /* 30px */
--font-size-4xl: 2.25rem;    /* 36px */
--font-size-5xl: 3rem;       /* 48px */
```

### Font Weights
```css
--font-weight-normal: 400;    /* Regular text */
--font-weight-medium: 500;    /* Emphasized text */
--font-weight-semibold: 600;  /* Subheadings */
--font-weight-bold: 700;      /* Headings */
```

### Typography Classes
```css
.heading-1 { font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); }
.heading-2 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); }
.heading-3 { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); }
.heading-4 { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); }
.heading-5 { font-size: var(--font-size-lg); font-weight: var(--font-weight-medium); }
.heading-6 { font-size: var(--font-size-base); font-weight: var(--font-weight-medium); }

.body-large { font-size: var(--font-size-lg); font-weight: var(--font-weight-normal); }
.body-normal { font-size: var(--font-size-base); font-weight: var(--font-weight-normal); }
.body-small { font-size: var(--font-size-sm); font-weight: var(--font-weight-normal); }
.caption { font-size: var(--font-size-xs); font-weight: var(--font-weight-normal); }
```

### Usage Examples
```tsx
<h1 className="heading-1">Marathon Training Plan</h1>
<h2 className="heading-2">Week 1 Overview</h2>
<p className="body-normal">Your training schedule for this week...</p>
<span className="caption">Last updated 2 hours ago</span>
```

## Spacing & Layout

### Spacing Scale
Consistent spacing using a 4px base unit with exponential growth.

```css
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 0.75rem;    /* 12px */
--spacing-lg: 1rem;       /* 16px */
--spacing-xl: 1.5rem;     /* 24px */
--spacing-2xl: 2rem;      /* 32px */
--spacing-3xl: 3rem;      /* 48px */
--spacing-4xl: 4rem;      /* 64px */
--spacing-5xl: 6rem;      /* 96px */
--spacing-6xl: 8rem;      /* 128px */
```

### Layout Utilities
```css
.container-enhanced {
  margin-inline: auto;
  padding-inline: var(--spacing-lg);
  max-width: var(--container-max-width);
}

.section-padding { padding: var(--spacing-4xl) 0; }
.content-spacing { gap: var(--spacing-xl); }

/* Flexbox utilities */
.vertical { display: flex; flex-direction: column; }
.horizontal { display: flex; flex-direction: row; }
.vertical.center { align-items: center; justify-content: center; }
.horizontal.center { align-items: center; justify-content: center; }
```

### Grid Systems
```css
.grid-auto-fit { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
  gap: var(--spacing-lg);
}

.grid-auto-fill { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
  gap: var(--spacing-lg);
}
```

## Components

### Buttons

#### Variants
- **Filled**: Primary action buttons with solid background
- **Light**: Secondary actions with tinted background
- **Outline**: Tertiary actions with border only
- **Ghost**: Minimal actions with hover background
- **Link**: Text-only actions with underline
- **Gradient**: Special emphasis with gradient background

#### Sizes
- **xs**: 28px height, compact spacing
- **sm**: 36px height, small spacing
- **md**: 40px height, default spacing
- **lg**: 48px height, large spacing
- **xl**: 56px height, extra large spacing

#### Usage
```tsx
import { CustomButton } from '@/components/CustomButton';

// Primary action
<CustomButton variant="filled" color="primary">
  Start Training
</CustomButton>

// Secondary action
<CustomButton variant="outline" color="secondary">
  View Details
</CustomButton>

// With icons
<CustomButton 
  variant="filled" 
  leftIcon={PlayIcon}
  rightIcon={ArrowRightIcon}
>
  Begin Workout
</CustomButton>

// Loading state
<CustomButton loading variant="filled">
  Saving...
</CustomButton>
```

### Cards

#### Basic Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card className="card-enhanced">
  <CardHeader>
    <CardTitle>Workout Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Today's training session details...</p>
  </CardContent>
</Card>
```

#### Interactive Card
```tsx
<Card className="card-interactive hover-lift">
  <CardContent>
    <p>Click to view workout details</p>
  </CardContent>
</Card>
```

### Form Components

#### Input Fields
```tsx
import { FormFieldInput } from '@/components/FormFieldInput';

<FormFieldInput
  name="distance"
  label="Distance (miles)"
  placeholder="Enter distance"
  type="number"
  required
/>
```

#### Switches and Checkboxes
```tsx
import { FormFieldSwitch } from '@/components/FormFieldSwitch';
import { FormFieldCheckbox } from '@/components/FormFieldCheckbox';

<FormFieldSwitch
  name="notifications"
  label="Enable notifications"
  description="Receive workout reminders"
/>

<FormFieldCheckbox
  name="terms"
  label="I agree to the terms and conditions"
  required
/>
```

### Navigation

#### Segmented Control
```tsx
import { SegmentedControl } from '@/components/SegmentedControl';

<SegmentedControl
  options={[
    { value: 'list', label: 'List' },
    { value: 'compact', label: 'Compact' }
  ]}
  value={view}
  onChange={setView}
  className="bg-muted"
  activeTabClassName="bg-background shadow-sm"
/>
```

### Feedback Components

#### Badges
```tsx
// Semantic badges
<span className="badge-success">Completed</span>
<span className="badge-warning">In Progress</span>
<span className="badge-error">Failed</span>
<span className="badge-info">Scheduled</span>

// Custom badge
<CustomBadge variant="success" size="sm">
  Week 1
</CustomBadge>
```

#### Progress Indicators
```tsx
// Progress bar
<div className="progress-bar">
  <div className="progress-fill" style={{ width: '75%' }} />
</div>

// Status dots
<span className="status-dot status-success" />
<span className="status-dot status-warning" />
<span className="status-dot status-error" />
```

#### Loading States
```tsx
import { Spinner } from '@/components/Spinner';

// Inline spinner
<Spinner size="sm" />

// Full page loading
<div className="vertical center min-h-screen">
  <Spinner size="lg" />
  <p className="body-normal text-muted-foreground mt-4">Loading...</p>
</div>

// Skeleton loading
<div className="skeleton skeleton-text" />
<div className="skeleton skeleton-title" />
<div className="skeleton skeleton-avatar" />
```

## Animations

### Transition System
```css
/* Standard easing curves */
--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);

/* Transition durations */
--transition-fast: 150ms;
--transition-normal: 200ms;
--transition-slow: 300ms;
```

### Animation Classes
```css
/* Hover effects */
.hover-lift:hover { transform: translateY(-2px); }
.hover-scale:hover { transform: scale(1.02); }

/* Active states */
.active-press:active { transform: scale(0.98); }

/* Entrance animations */
.animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
.animate-scale-in { animation: scale-in 0.2s ease-out; }
.animate-slide-down { animation: slide-down 0.3s ease-out; }

/* Continuous animations */
.animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-shimmer { animation: shimmer 2s linear infinite; }
```

### Usage Examples
```tsx
// Hover effects
<Card className="hover-lift transition-all duration-200">
  Content with lift effect
</Card>

// Entrance animations
<div className="animate-fade-in-up">
  Content that fades in from bottom
</div>

// Loading animations
<div className="animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted">
  Loading placeholder
</div>
```

## Accessibility

### Focus Management
```css
.focus-ring:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.focus-ring-inset:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: -2px;
}
```

### Screen Reader Support
```tsx
// Proper labeling
<button aria-label="Start workout session">
  <PlayIcon />
</button>

// Status announcements
<div aria-live="polite" aria-atomic="true">
  Workout completed successfully
</div>

// Loading states
<button disabled aria-busy="true">
  <Spinner size="sm" />
  <span className="sr-only">Loading...</span>
  Save Changes
</button>
```

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Escape key closes modals and dropdowns
- Arrow keys navigate within components

## Usage Guidelines

### Do's ✅

1. **Use semantic HTML elements**
   ```tsx
   <main>
     <section>
       <h1>Page Title</h1>
       <article>Content</article>
     </section>
   </main>
   ```

2. **Follow the spacing scale**
   ```tsx
   <div className="space-lg"> {/* Use spacing utilities */}
     <div>Item 1</div>
     <div>Item 2</div>
   </div>
   ```

3. **Use consistent color patterns**
   ```tsx
   <CustomButton variant="filled" color="primary">Primary Action</CustomButton>
   <CustomButton variant="outline" color="secondary">Secondary Action</CustomButton>
   ```

4. **Provide loading states**
   ```tsx
   <CustomButton loading={isSubmitting}>
     {isSubmitting ? 'Saving...' : 'Save Changes'}
   </CustomButton>
   ```

### Don'ts ❌

1. **Don't use arbitrary values without justification**
   ```tsx
   {/* Avoid */}
   <div className="mt-[13px] p-[7px]">

   {/* Use */}
   <div className="mt-3 p-2">
   ```

2. **Don't skip semantic markup**
   ```tsx
   {/* Avoid */}
   <div onClick={handleClick}>Button</div>

   {/* Use */}
   <button onClick={handleClick}>Button</button>
   ```

3. **Don't forget accessibility attributes**
   ```tsx
   {/* Avoid */}
   <img src="chart.png" />

   {/* Use */}
   <img src="chart.png" alt="Weekly training progress chart" />
   ```

4. **Don't mix design patterns**
   ```tsx
   {/* Avoid mixing button styles */}
   <div className="flex gap-2">
     <button className="bg-blue-500 px-4 py-2">Custom</button>
     <CustomButton variant="filled">Standard</CustomButton>
   </div>
   ```

### Component Composition

#### Building Complex Components
```tsx
// Compose existing components for consistency
const WorkoutCard = ({ workout, onComplete }) => (
  <Card className="card-interactive hover-lift">
    <CardHeader>
      <CardTitle className="heading-4">{workout.title}</CardTitle>
      <CustomBadge variant={workout.completed ? 'success' : 'warning'}>
        {workout.completed ? 'Completed' : 'Pending'}
      </CustomBadge>
    </CardHeader>
    <CardContent className="space-md">
      <p className="body-normal text-muted-foreground">
        {workout.description}
      </p>
      <div className="horizontal gap-2">
        <CustomButton 
          variant="filled" 
          size="sm"
          onClick={onComplete}
          disabled={workout.completed}
        >
          Mark Complete
        </CustomButton>
        <CustomButton variant="outline" size="sm">
          View Details
        </CustomButton>
      </div>
    </CardContent>
  </Card>
);
```

### Responsive Design

#### Mobile-First Approach
```tsx
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
">
  {/* Content adapts to screen size */}
</div>
```

#### Responsive Utilities
```css
@media (max-width: 640px) {
  .mobile-stack { flex-direction: column; }
  .mobile-full { width: 100%; }
}

@media (min-width: 768px) {
  .tablet-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .desktop-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
}
```

---

## Contributing

When adding new components or patterns:

1. Follow existing naming conventions
2. Add proper TypeScript types
3. Include accessibility attributes
4. Test with keyboard navigation
5. Verify color contrast ratios
6. Document usage examples
7. Add to Storybook (if available)

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OKLCH Color Space](https://oklch.com/) 