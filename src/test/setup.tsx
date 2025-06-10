import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';
import type { ReactNode } from 'react';
import { KitzeUIProvider } from '@/components/KitzeUIContext';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    nav: 'nav',
    button: 'button',
    span: 'span',
    section: 'section',
    article: 'article',
    header: 'header',
    footer: 'footer',
    main: 'main',
    aside: 'aside',
    ul: 'ul',
    li: 'li',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    a: 'a',
    img: 'img',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    label: 'label',
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: (initial: unknown) => ({ get: () => initial, set: vi.fn() }),
  useTransform: (_value: unknown, _input: unknown, _output: unknown) => _value,
  useSpring: (value: unknown) => value,
}));

// Mock audio
Object.defineProperty(window, 'HTMLAudioElement', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    preload: 'auto',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Create a test wrapper component that provides necessary context
export const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <KitzeUIProvider isMobile={false}>
      {children}
    </KitzeUIProvider>
  );
}; 