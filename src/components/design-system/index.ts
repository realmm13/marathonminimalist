// Design System Component Library
// Centralized exports for all design system components

// Core UI Components
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
export { Button } from '@/components/ui/button';
export { Input } from '@/components/ui/input';
export { Label } from '@/components/ui/label';
export { Textarea } from '@/components/ui/textarea';
export { Switch } from '@/components/ui/switch';
export { Checkbox } from '@/components/ui/checkbox';
export { Badge } from '@/components/ui/badge';
export { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
export { Separator } from '@/components/ui/separator';
export { Skeleton } from '@/components/ui/skeleton';
export { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export { ScrollArea } from '@/components/ui/scroll-area';
export { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Custom Enhanced Components
export { CustomButton } from '@/components/CustomButton';
export { CustomBadge } from '@/components/CustomBadge';
export { Spinner } from '@/components/Spinner';
export { SegmentedControl } from '@/components/SegmentedControl';

// Form Components
export { FormFieldInput } from '@/components/FormFieldInput';
export { FormFieldTextarea } from '@/components/FormFieldTextarea';
export { FormFieldSwitch } from '@/components/FormFieldSwitch';
export { FormFieldCheckbox } from '@/components/FormFieldCheckbox';
export { FormFieldSegmentedControl } from '@/components/FormFieldSegmentedControl';
export { FormFieldAdvancedSelect } from '@/components/FormFieldAdvancedSelect';
export { FormFieldWrapper } from '@/components/FormFieldWrapper';

// Layout Components
export { PageHeader } from '@/components/PageHeader';
export { DashboardContent } from '@/components/DashboardContent';

// Feedback Components
export { Alert as CustomAlert } from '@/components/Alert';
export { ConfirmAlert } from '@/components/ConfirmAlert';
export { ConfirmAlertDelete } from '@/components/ConfirmAlertDelete';
export { FullPageSpinner } from '@/components/FullPageSpinner';

// Navigation Components
export { SearchBar } from '@/components/SearchBar';

// Dialog & Modal Components
export { SimpleDialog } from '@/components/SimpleDialog';
export { DialogManager, useDialog } from '@/components/DialogManager';
export { BottomDrawer } from '@/components/BottomDrawer';

// Utility Components
export { ConditionalTooltip } from '@/components/ConditionalTooltip';
export { ConditionalWrap } from '@/components/ConditionalWrap';
export { Disabled } from '@/components/Disabled';
export { Suspensed } from '@/components/Suspensed';
export { GradientText } from '@/components/GradientText';
export { HoverableIcon } from '@/components/HoverableIcon';
export { SmoothLoadImage } from '@/components/SmoothLoadImage';

// Context Providers - Fixed exports
export { AlertProvider, AlertRenderer, useAlerts, useConfirmAlert, useConfirmAlertDelete } from '@/components/AlertContext';
export { KitzeUIProvider, useKitzeUI } from '@/components/KitzeUIContext';
export { MenuProvider, useMenuContext } from '@/components/MenuContext';
export { DrawerContext } from '@/components/DrawerContext';

// Theme Components
export { ThemeSwitchMinimal } from '@/components/ThemeSwitchMinimal';
export { ThemeSwitchMinimalNextThemes } from '@/components/ThemeSwitchMinimalNextThemes';
export { ThemeColorUpdater } from '@/components/ThemeColorUpdater';

// Development Components
export { FormDebug } from '@/components/FormDebug';

// Type Exports
export type { CustomButtonProps, CustomButtonVariant } from '@/components/CustomButton';
export type { Size } from '@/lib/utils';

// Re-export commonly used types from Radix UI
export type { DialogProps } from '@radix-ui/react-dialog';
export type { TooltipProps } from '@radix-ui/react-tooltip';
export type { PopoverProps } from '@radix-ui/react-popover';
export type { SelectProps } from '@radix-ui/react-select';
export type { SwitchProps } from '@radix-ui/react-switch';
export type { CheckboxProps } from '@radix-ui/react-checkbox';

// Design System Constants
export const DESIGN_TOKENS = {
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '6rem',    // 96px
    '6xl': '8rem',    // 128px
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  borderRadius: {
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 4px)',
  },
  transition: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    outCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
    inOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
} as const;

// Component Size Variants
export const COMPONENT_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

// Color Variants
export const COLOR_VARIANTS = [
  'primary',
  'secondary', 
  'success',
  'warning',
  'destructive',
  'info',
  'muted',
  'accent',
] as const;

// Button Variants
export const BUTTON_VARIANTS = [
  'filled',
  'light', 
  'outline',
  'ghost',
  'link',
  'gradient',
] as const;

// Badge Variants  
export const BADGE_VARIANTS = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'success',
  'warning',
  'info',
] as const; 