import React from 'react';
import { Button } from './ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function EmptyState({
  title,
  description,
  buttonText,
  onButtonClick,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {buttonText && onButtonClick && (
        <div className="mt-6">
          <Button onClick={onButtonClick}>{buttonText}</Button>
        </div>
      )}
    </div>
  );
} 