import { cn } from '@/lib/utils';

const PAGE_WIDTHS = {
  narrow: 'max-w-2xl',
  default: 'max-w-3xl',
  wide: 'max-w-5xl',
} as const;

export type PageWidth = keyof typeof PAGE_WIDTHS;

/** Content column matching PageHeader, so edges line up down the page. */
export const pageColumn = (width: PageWidth = 'wide') => cn('mx-auto w-full px-4 sm:px-6', PAGE_WIDTHS[width]);

/** Screens that show the floating tab bar. Every other screen is a detail screen without it. */
export const TAB_BAR_ROUTES = ['/home', '/advisory', '/diagnose', '/shop', '/mitra', '/weather'];
