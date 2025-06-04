# Design System Testing Guide

This guide provides comprehensive testing strategies and examples for the Prep My Run design system components.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [Visual Testing](#visual-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [Performance Testing](#performance-testing)
7. [Testing Utilities](#testing-utilities)

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **User-Centric Testing**: Test from the user's perspective using accessible queries
3. **Confidence Over Coverage**: Aim for tests that give confidence in the component's reliability
4. **Maintainable Tests**: Write tests that are easy to understand and maintain

### Testing Pyramid

```
    E2E Tests (Few)
   ┌─────────────────┐
   │  User Journeys  │
   └─────────────────┘
  
  Integration Tests (Some)
 ┌─────────────────────┐
 │  Component Groups   │
 └─────────────────────┘

Unit Tests (Many)
┌─────────────────────────┐
│  Individual Components  │
└─────────────────────────┘
```

## Unit Testing

### Basic Component Testing

```tsx
// CustomButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomButton } from '@/components/design-system';
import { Plus } from 'lucide-react';

describe('CustomButton', () => {
  it('renders with text content', () => {
    render(<CustomButton>Click me</CustomButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<CustomButton onClick={handleClick}>Click me</CustomButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<CustomButton loading>Loading</CustomButton>);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with left icon', () => {
    render(
      <CustomButton leftIcon={Plus}>
        Add Item
      </CustomButton>
    );
    
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<CustomButton variant="filled">Button</CustomButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<CustomButton variant="outline">Button</CustomButton>);
    expect(screen.getByRole('button')).toHaveClass('border-input');
  });
});
```

### Form Component Testing

```tsx
// FormFieldInput.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormFieldInput } from '@/components/design-system';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

function TestForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(() => {})}>
      <FormFieldInput
        form={form}
        name="email"
        label="Email"
        placeholder="Enter email"
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('FormFieldInput', () => {
  it('renders label and input', () => {
    render(<TestForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid input', async () => {
    render(<TestForm />);
    
    const input = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('accepts valid input', async () => {
    render(<TestForm />);
    
    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
    });
  });
});
```

### Dialog Component Testing

```tsx
// SimpleDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SimpleDialog, CustomButton } from '@/components/design-system';

describe('SimpleDialog', () => {
  it('opens and closes dialog', () => {
    render(
      <SimpleDialog
        trigger={<CustomButton>Open Dialog</CustomButton>}
        title="Test Dialog"
        description="This is a test dialog"
      >
        <p>Dialog content</p>
      </SimpleDialog>
    );

    // Dialog should be closed initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /open dialog/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();

    // Close dialog with escape key
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('focuses first focusable element when opened', () => {
    render(
      <SimpleDialog
        trigger={<CustomButton>Open Dialog</CustomButton>}
        title="Test Dialog"
      >
        <CustomButton>First Button</CustomButton>
        <CustomButton>Second Button</CustomButton>
      </SimpleDialog>
    );

    fireEvent.click(screen.getByRole('button', { name: /open dialog/i }));
    
    expect(screen.getByRole('button', { name: /first button/i })).toHaveFocus();
  });
});
```

## Integration Testing

### Form Integration Testing

```tsx
// ProfileForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileForm } from '@/components/forms/ProfileForm';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('ProfileForm Integration', () => {
  it('submits form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    renderWithProviders(<ProfileForm onSubmit={mockOnSubmit} />);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const mockOnSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderWithProviders(<ProfileForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

### Component Composition Testing

```tsx
// WorkoutCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutCard } from '@/components/training/WorkoutCard';

const mockWorkout = {
  id: '1-1',
  title: 'Easy Run',
  description: 'Comfortable pace run',
  duration: 30,
  distance: 3,
  type: 'run' as const,
  completed: false,
};

describe('WorkoutCard', () => {
  it('displays workout information correctly', () => {
    render(<WorkoutCard workout={mockWorkout} />);

    expect(screen.getByText('Easy Run')).toBeInTheDocument();
    expect(screen.getByText('Comfortable pace run')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('3.0 mi')).toBeInTheDocument();
  });

  it('shows completion button for incomplete workouts', () => {
    render(<WorkoutCard workout={mockWorkout} />);
    
    expect(screen.getByRole('button', { name: /mark complete/i })).toBeInTheDocument();
  });

  it('shows completed state for completed workouts', () => {
    render(<WorkoutCard workout={{ ...mockWorkout, completed: true }} />);
    
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark complete/i })).not.toBeInTheDocument();
  });

  it('calls onComplete when completion button is clicked', () => {
    const mockOnComplete = jest.fn();
    render(<WorkoutCard workout={mockWorkout} onComplete={mockOnComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));
    expect(mockOnComplete).toHaveBeenCalledWith('1-1');
  });
});
```

## Visual Testing

### Storybook Stories

```tsx
// CustomButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CustomButton } from '@/components/design-system';
import { Plus, Download, Trash2 } from 'lucide-react';

const meta: Meta<typeof CustomButton> = {
  title: 'Design System/CustomButton',
  component: CustomButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['filled', 'light', 'outline', 'ghost', 'link', 'gradient'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="horizontal space-sm">
      <CustomButton variant="filled">Filled</CustomButton>
      <CustomButton variant="light">Light</CustomButton>
      <CustomButton variant="outline">Outline</CustomButton>
      <CustomButton variant="ghost">Ghost</CustomButton>
      <CustomButton variant="link">Link</CustomButton>
      <CustomButton variant="gradient">Gradient</CustomButton>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="vertical space-sm">
      <CustomButton leftIcon={Plus}>Add Item</CustomButton>
      <CustomButton rightIcon={Download}>Download</CustomButton>
      <CustomButton leftIcon={Trash2} variant="outline">
        Delete
      </CustomButton>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="horizontal space-sm">
      <CustomButton loading>Loading</CustomButton>
      <CustomButton loading variant="outline">
        Processing
      </CustomButton>
      <CustomButton loading leftIcon={Plus}>
        Adding
      </CustomButton>
    </div>
  ),
};
```

### Visual Regression Testing

```tsx
// visual.test.tsx
import { render } from '@testing-library/react';
import { CustomButton, Card, Badge } from '@/components/design-system';

describe('Visual Regression Tests', () => {
  it('renders button variants consistently', () => {
    const { container } = render(
      <div className="p-4 space-y-4">
        <CustomButton variant="filled">Filled Button</CustomButton>
        <CustomButton variant="outline">Outline Button</CustomButton>
        <CustomButton variant="ghost">Ghost Button</CustomButton>
      </div>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders card layouts consistently', () => {
    const { container } = render(
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content with some text.</p>
          <Badge variant="success">Active</Badge>
        </CardContent>
      </Card>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
```

## Accessibility Testing

### Automated Accessibility Testing

```tsx
// accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CustomButton, FormFieldInput } from '@/components/design-system';
import { useForm } from 'react-hook-form';

expect.extend(toHaveNoViolations);

function TestForm() {
  const form = useForm({ defaultValues: { email: '' } });
  return (
    <form>
      <FormFieldInput
        form={form}
        name="email"
        label="Email Address"
        placeholder="Enter your email"
        required
      />
      <CustomButton type="submit">Submit</CustomButton>
    </form>
  );
}

describe('Accessibility Tests', () => {
  it('CustomButton should not have accessibility violations', async () => {
    const { container } = render(<CustomButton>Accessible Button</CustomButton>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Form should not have accessibility violations', async () => {
    const { container } = render(<TestForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    render(<CustomButton>Keyboard Button</CustomButton>);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    // Test that Enter key triggers click
  });
});
```

### Screen Reader Testing

```tsx
// screen-reader.test.tsx
import { render, screen } from '@testing-library/react';
import { CustomButton, Badge } from '@/components/design-system';
import { Trash2 } from 'lucide-react';

describe('Screen Reader Tests', () => {
  it('provides proper aria labels for icon buttons', () => {
    render(
      <CustomButton aria-label="Delete item">
        <Trash2 className="w-4 h-4" />
      </CustomButton>
    );

    expect(screen.getByRole('button', { name: /delete item/i })).toBeInTheDocument();
  });

  it('provides proper status information', () => {
    render(<Badge variant="success">Completed</Badge>);
    
    const badge = screen.getByText('Completed');
    expect(badge).toHaveAttribute('role', 'status');
  });

  it('announces loading states', () => {
    render(<CustomButton loading aria-label="Saving changes">Save</CustomButton>);
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
```

## Performance Testing

### Component Performance

```tsx
// performance.test.tsx
import { render, screen } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { WorkoutGrid } from '@/components/training/WorkoutGrid';

const generateMockWorkouts = (count: number) => 
  Array.from({ length: count }, (_, i) => ({
    id: `${i}-1`,
    title: `Workout ${i}`,
    description: 'Test workout',
    duration: 30,
    distance: 3,
    type: 'run' as const,
    completed: false,
  }));

describe('Performance Tests', () => {
  it('renders large lists efficiently', () => {
    const workouts = generateMockWorkouts(100);
    
    const startTime = performance.now();
    render(<WorkoutGrid workouts={workouts} />);
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(100); // Should render in under 100ms
  });

  it('handles rapid re-renders without memory leaks', () => {
    const workouts = generateMockWorkouts(50);
    const { rerender } = render(<WorkoutGrid workouts={workouts} />);
    
    // Simulate rapid updates
    for (let i = 0; i < 10; i++) {
      const updatedWorkouts = workouts.map(w => ({ ...w, completed: i % 2 === 0 }));
      rerender(<WorkoutGrid workouts={updatedWorkouts} />);
    }
    
    // Component should still be responsive
    expect(screen.getAllByText(/workout/i)).toHaveLength(50);
  });
});
```

## Testing Utilities

### Custom Render Function

```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertProvider, KitzeUIProvider } from '@/components/design-system';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <KitzeUIProvider isMobile={false}>
        <AlertProvider>
          {children}
        </AlertProvider>
      </KitzeUIProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Mock Factories

```tsx
// mocks/factories.ts
export const createMockWorkout = (overrides = {}) => ({
  id: '1-1',
  title: 'Test Workout',
  description: 'Test description',
  duration: 30,
  distance: 3,
  type: 'run' as const,
  completed: false,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  preferences: {
    distanceUnit: 'MILES' as const,
    goalTime: '4:00:00',
    experienceLevel: 'INTERMEDIATE' as const,
  },
  ...overrides,
});
```

### Test Setup

```tsx
// setup-tests.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Best Practices

### Testing Checklist

- [ ] **Functionality**: Does the component work as expected?
- [ ] **Accessibility**: Can users with disabilities use it?
- [ ] **Performance**: Does it render efficiently?
- [ ] **Error Handling**: Does it handle edge cases gracefully?
- [ ] **Responsive**: Does it work on different screen sizes?
- [ ] **Browser Compatibility**: Does it work across browsers?

### Common Patterns

```tsx
// ✅ Good: Test user interactions
fireEvent.click(screen.getByRole('button', { name: /submit/i }));

// ✅ Good: Use accessible queries
screen.getByLabelText(/email/i);
screen.getByRole('button', { name: /save/i });

// ✅ Good: Test error states
expect(screen.getByText(/error message/i)).toBeInTheDocument();

// ❌ Avoid: Testing implementation details
expect(component.state.isLoading).toBe(true);

// ❌ Avoid: Using non-accessible queries
screen.getByClassName('button-primary');
```

This testing guide ensures that the Prep My Run design system components are reliable, accessible, and performant across all use cases. 