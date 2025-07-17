import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from './utils';

interface LoadingOverlayProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({ className, children }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    </div>
  );
} 