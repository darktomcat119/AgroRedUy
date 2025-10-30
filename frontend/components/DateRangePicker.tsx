import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  return (
    <div className={className}>
      <DayPicker
        mode="range"
        selected={value as any}
        onSelect={(range) => onChange((range as any) || {})}
        weekStartsOn={1}
        captionLayout="buttons"
        showOutsideDays
      />
    </div>
  );
}


