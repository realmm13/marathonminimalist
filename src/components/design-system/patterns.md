# Component Patterns & Usage Guide

This document provides practical examples and patterns for using the Prep My Run design system components effectively.

## Table of Contents

1. [Layout Patterns](#layout-patterns)
2. [Form Patterns](#form-patterns)
3. [Card Patterns](#card-patterns)
4. [Button Patterns](#button-patterns)
5. [Navigation Patterns](#navigation-patterns)
6. [Feedback Patterns](#feedback-patterns)
7. [Data Display Patterns](#data-display-patterns)
8. [Animation Patterns](#animation-patterns)

## Layout Patterns

### Page Layout Structure

```tsx
import { PageHeader, DashboardContent } from '@/components/design-system';

export default function MyPage() {
  return (
    <DashboardContent>
      <PageHeader 
        title="Page Title"
        description="Optional description"
        actions={<CustomButton>Action</CustomButton>}
      />
      
      <div className="content-spacing">
        {/* Page content */}
      </div>
    </DashboardContent>
  );
}
```

### Grid Layouts

```tsx
// Auto-fit grid (responsive columns)
<div className="grid-auto-fit space-lg">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

// Responsive grid with breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-lg">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

### Flex Layouts

```tsx
// Using utility classes
<div className="vertical space-md">
  <div className="horizontal center-v space-sm">
    <Icon />
    <span>Content</span>
  </div>
</div>

// Responsive stacking
<div className="horizontal mobile-stack space-lg">
  <div className="flex-1">Main content</div>
  <div className="w-64 mobile-full">Sidebar</div>
</div>
```

## Form Patterns

### Basic Form Structure

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FormFieldInput, 
  FormFieldTextarea, 
  FormFieldSwitch,
  CustomButton 
} from '@/components/design-system';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  bio: z.string().optional(),
  notifications: z.boolean(),
});

export function MyForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      notifications: true,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="vertical space-lg">
      <FormFieldInput
        form={form}
        name="name"
        label="Full Name"
        placeholder="Enter your name"
        required
      />
      
      <FormFieldInput
        form={form}
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        required
      />
      
      <FormFieldTextarea
        form={form}
        name="bio"
        label="Bio"
        placeholder="Tell us about yourself"
        rows={4}
      />
      
      <FormFieldSwitch
        form={form}
        name="notifications"
        label="Email Notifications"
        description="Receive updates via email"
      />
      
      <div className="horizontal space-sm">
        <CustomButton type="submit" loading={form.formState.isSubmitting}>
          Save Changes
        </CustomButton>
        <CustomButton variant="outline" type="button">
          Cancel
        </CustomButton>
      </div>
    </form>
  );
}
```

### Advanced Form with Segmented Control

```tsx
import { FormFieldSegmentedControl } from '@/components/design-system';

<FormFieldSegmentedControl
  form={form}
  name="viewMode"
  label="View Mode"
  options={[
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
    { value: 'compact', label: 'Compact' },
  ]}
/>
```

## Card Patterns

### Basic Information Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system';

<Card className="card-enhanced">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>
```

### Interactive Card with Actions

```tsx
<Card className="card-interactive hover-lift">
  <CardHeader>
    <div className="horizontal center-v space-sm">
      <Avatar>
        <AvatarImage src="/avatar.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="vertical">
        <CardTitle>John Doe</CardTitle>
        <p className="body-small text-muted-foreground">Software Engineer</p>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <p className="body-normal">Card description...</p>
  </CardContent>
  <CardFooter>
    <div className="horizontal space-sm">
      <CustomButton size="sm">View Profile</CustomButton>
      <CustomButton variant="outline" size="sm">Message</CustomButton>
    </div>
  </CardFooter>
</Card>
```

### Stats Card

```tsx
<Card className="card-enhanced">
  <CardContent className="vertical center space-sm">
    <div className="heading-2 text-primary">1,234</div>
    <div className="body-small text-muted-foreground">Total Workouts</div>
    <div className="horizontal center-v space-xs">
      <TrendingUp className="w-4 h-4 text-success" />
      <span className="caption text-success">+12% from last month</span>
    </div>
  </CardContent>
</Card>
```

## Button Patterns

### Primary Actions

```tsx
// Main call-to-action
<CustomButton variant="filled" size="lg">
  Get Started
</CustomButton>

// Secondary action
<CustomButton variant="outline">
  Learn More
</CustomButton>

// Destructive action
<CustomButton variant="filled" className="bg-destructive hover:bg-destructive/90">
  Delete Account
</CustomButton>
```

### Button Groups

```tsx
<div className="horizontal space-sm">
  <CustomButton variant="filled">Save</CustomButton>
  <CustomButton variant="outline">Cancel</CustomButton>
</div>

// Segmented button group
<div className="horizontal border rounded-lg overflow-hidden">
  <CustomButton variant="ghost" className="rounded-none border-r">
    Option 1
  </CustomButton>
  <CustomButton variant="ghost" className="rounded-none border-r">
    Option 2
  </CustomButton>
  <CustomButton variant="ghost" className="rounded-none">
    Option 3
  </CustomButton>
</div>
```

### Icon Buttons

```tsx
import { Plus, Settings, Search } from 'lucide-react';

// With icon and text
<CustomButton leftIcon={Plus}>
  Add Item
</CustomButton>

// Icon only
<CustomButton variant="ghost" size="sm" className="w-10 h-10 p-0">
  <Settings className="w-4 h-4" />
</CustomButton>

// Loading state
<CustomButton loading leftIcon={Search}>
  Searching...
</CustomButton>
```

## Navigation Patterns

### Breadcrumb Navigation

```tsx
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from '@/components/design-system';

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/workouts">Workouts</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Week 1</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Tab Navigation

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/design-system';

<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview" className="content-spacing">
    Overview content
  </TabsContent>
  <TabsContent value="analytics" className="content-spacing">
    Analytics content
  </TabsContent>
  <TabsContent value="settings" className="content-spacing">
    Settings content
  </TabsContent>
</Tabs>
```

## Feedback Patterns

### Alert Messages

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/design-system';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

// Success alert
<Alert className="border-success bg-success/10">
  <CheckCircle className="h-4 w-4 text-success" />
  <AlertTitle className="text-success">Success!</AlertTitle>
  <AlertDescription>
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>

// Warning alert
<Alert className="border-warning bg-warning/10">
  <AlertTriangle className="h-4 w-4 text-warning" />
  <AlertTitle className="text-warning">Warning</AlertTitle>
  <AlertDescription>
    This action cannot be undone.
  </AlertDescription>
</Alert>
```

### Confirmation Dialogs

```tsx
import { useConfirmAlert, useConfirmAlertDelete } from '@/components/design-system';

function MyComponent() {
  const confirmAlert = useConfirmAlert();
  const confirmDelete = useConfirmAlertDelete();

  const handleSave = () => {
    confirmAlert({
      title: 'Save Changes?',
      description: 'Are you sure you want to save these changes?',
      confirmText: 'Save',
      onConfirm: () => {
        // Save logic
      },
    });
  };

  const handleDelete = () => {
    confirmDelete({
      title: 'Delete Item',
      description: 'This action cannot be undone.',
      itemName: 'workout plan',
      onConfirm: () => {
        // Delete logic
      },
    });
  };

  return (
    <div className="horizontal space-sm">
      <CustomButton onClick={handleSave}>Save</CustomButton>
      <CustomButton variant="outline" onClick={handleDelete}>
        Delete
      </CustomButton>
    </div>
  );
}
```

### Loading States

```tsx
import { Spinner, Skeleton } from '@/components/design-system';

// Full page loading
<FullPageSpinner />

// Inline loading
<div className="horizontal center-v space-sm">
  <Spinner size="sm" />
  <span>Loading...</span>
</div>

// Skeleton loading
<div className="vertical space-md">
  <Skeleton className="skeleton-title" />
  <Skeleton className="skeleton-text" />
  <Skeleton className="skeleton-text w-3/4" />
</div>
```

## Data Display Patterns

### Table with Actions

```tsx
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/design-system';
import { MoreHorizontal } from 'lucide-react';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Date</TableHead>
      <TableHead className="w-[100px]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>
          <Badge variant={item.status === 'active' ? 'success' : 'secondary'}>
            {item.status}
          </Badge>
        </TableCell>
        <TableCell>{item.date}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CustomButton variant="ghost" size="sm" className="w-8 h-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </CustomButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Badge Patterns

```tsx
import { Badge, CustomBadge } from '@/components/design-system';

// Status badges
<Badge variant="success">Completed</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="secondary">Pending</Badge>

// Custom badges with icons
<CustomBadge variant="success" leftIcon={CheckCircle}>
  Verified
</CustomBadge>

// Count badges
<div className="relative">
  <Bell className="w-6 h-6" />
  <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5">
    3
  </Badge>
</div>
```

## Animation Patterns

### Entrance Animations

```tsx
// Staggered list animation
<div className="vertical space-md">
  {items.map((item, index) => (
    <div 
      key={item.id}
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card>{item.content}</Card>
    </div>
  ))}
</div>

// Scale in animation
<Dialog>
  <DialogContent className="animate-scale-in">
    Dialog content
  </DialogContent>
</Dialog>
```

### Hover Animations

```tsx
// Lift effect
<Card className="hover-lift transition-all duration-200">
  Card content
</Card>

// Scale effect
<CustomButton className="hover-scale transition-transform duration-200">
  Hover me
</CustomButton>

// Glow effect
<div className="animate-glow">
  Special content
</div>
```

### Loading Animations

```tsx
// Shimmer effect
<div className="animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/20 to-muted">
  Loading content
</div>

// Pulse effect
<div className="animate-pulse-subtle">
  Subtle pulsing content
</div>

// Float effect
<div className="animate-float">
  Floating element
</div>
```

## Best Practices

### Component Composition

```tsx
// ✅ Good: Compose components for flexibility
<Card className="card-enhanced">
  <CardHeader>
    <div className="horizontal center-v space-sm">
      <Avatar>
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
      <div className="vertical">
        <CardTitle>{user.name}</CardTitle>
        <p className="body-small text-muted-foreground">{user.role}</p>
      </div>
    </div>
  </CardHeader>
</Card>

// ❌ Avoid: Overly complex single components
<UserCard 
  avatar={user.avatar}
  name={user.name}
  role={user.role}
  showActions={true}
  actionType="dropdown"
  // ... many more props
/>
```

### Responsive Design

```tsx
// ✅ Good: Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-lg">
  <Card className="mobile-full">Content</Card>
</div>

// ✅ Good: Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</div>
```

### Accessibility

```tsx
// ✅ Good: Proper ARIA labels and keyboard navigation
<CustomButton
  aria-label="Delete workout"
  onClick={handleDelete}
>
  <Trash2 className="w-4 h-4" />
</CustomButton>

// ✅ Good: Focus management
<Dialog>
  <DialogTrigger asChild>
    <CustomButton>Open Dialog</CustomButton>
  </DialogTrigger>
  <DialogContent className="focus-enhanced">
    <DialogTitle>Dialog Title</DialogTitle>
    {/* Content */}
  </DialogContent>
</Dialog>
```

This pattern guide provides practical examples for building consistent, accessible, and performant UI components using the Prep My Run design system. 