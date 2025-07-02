import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for combining and merging CSS class names
 * Combines clsx for conditional classes with tailwind-merge for conflicting Tailwind classes
 *
 * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 *
 * @example
 * cn('px-2 py-1', 'text-red-500', { 'font-bold': isActive })
 * cn('px-2', 'px-4') // Returns 'px-4' (tailwind-merge deduplicates)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
