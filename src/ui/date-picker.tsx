import { CalendarIcon } from 'lucide-react';

import { Button } from './button';
import { cn } from './utils';

export type DateRange = {
  from: Date;
  to: Date;
};

interface DatePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  className?: string;
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Button
        variant="outline"
        className={cn(
          'w-[240px] justify-start text-left font-normal',
          !date && 'text-muted-foreground'
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date?.from ? (
          date.to ? (
            <>
              {date.from.toLocaleDateString()} - {date.to.toLocaleDateString()}
            </>
          ) : (
            date.from.toLocaleDateString()
          )
        ) : (
          <span>Pick a date range</span>
        )}
      </Button>
    </div>
  );
} 