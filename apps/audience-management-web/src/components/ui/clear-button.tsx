import React from 'react';
import { Button, ButtonProps } from './button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClearButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="default"
      size="icon"
      className={cn(
        'h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-destructive rounded-full hover:bg-destructive/80',
        className
      )}
      {...props}
    >
      <X className="h-3 w-3" />
    </Button>
  );
} 