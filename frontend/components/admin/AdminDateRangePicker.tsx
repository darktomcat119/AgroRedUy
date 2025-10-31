"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AdminDateRangePickerProps {
  label?: string;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  onDateChange: (startDate: string, endDate: string) => void;
  className?: string;
}

// Calendar utility functions
const getMonthName = (date: Date) => {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  return { daysInMonth, startingDayOfWeek };
};

const isDateInRange = (date: Date, startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate) return false;
  return date >= startDate && date <= endDate;
};

const isSameDate = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

export const AdminDateRangePicker = ({
  label = "Rango de fechas",
  startDate,
  endDate,
  onDateChange,
  className = ""
}: AdminDateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Convert string dates to Date objects for calendar
  const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
  const endDateObj = endDate ? new Date(endDate + 'T00:00:00') : null;
  
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDateObj);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDateObj);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (target.closest('.calendar-date') || target.closest('.calendar-button') || target.closest('.calendar-nav')) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync temp dates when props change
  useEffect(() => {
    setTempStartDate(startDate ? new Date(startDate + 'T00:00:00') : null);
    setTempEndDate(endDate ? new Date(endDate + 'T00:00:00') : null);
  }, [startDate, endDate]);

  const handleDateClick = (date: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(date);
      setTempEndDate(null);
    } else if (tempStartDate && !tempEndDate) {
      // Complete the range
      if (date < tempStartDate) {
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      } else {
        setTempEndDate(date);
      }
    }
  };

  const handleConfirm = () => {
    if (tempStartDate && tempEndDate) {
      const start = tempStartDate.toISOString().split('T')[0];
      const end = tempEndDate.toISOString().split('T')[0];
      onDateChange(start, end);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onDateChange('', '');
    setIsOpen(false);
  };

  const renderCalendar = (monthOffset: number) => {
    const displayDate = new Date(currentMonth);
    displayDate.setMonth(displayDate.getMonth() + monthOffset);
    
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(displayDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
      const isToday = isSameDate(date, new Date());
      const isInRange = tempStartDate && tempEndDate && isDateInRange(date, tempStartDate, tempEndDate);
      const isStartDate = tempStartDate && isSameDate(date, tempStartDate);
      const isEndDate = tempEndDate && isSameDate(date, tempEndDate);
      const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      days.push(
        <button
          key={day}
          onClick={(e) => { e.stopPropagation(); if (!isPastDate) handleDateClick(date); }}
          disabled={isPastDate}
          className={`
            w-8 h-8 rounded-full text-sm font-medium transition-all duration-150 ease-in-out calendar-date
            ${isPastDate ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 hover:scale-105'}
            ${isStartDate || isEndDate ? 'bg-verdeprimario-100 text-white hover:bg-verdeprimario-100 shadow-md' : ''}
            ${isInRange && !isStartDate && !isEndDate ? 'bg-verdesecundario-100/30 hover:bg-verdesecundario-100/50' : ''}
            ${isToday && !isStartDate && !isEndDate ? 'border-2 border-gray-400 hover:border-gray-500' : ''}
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const getDisplayText = () => {
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const startStr = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        return `${startStr} - ${endStr}`;
      }
    } else if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      if (!isNaN(start.getTime())) {
        return start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      }
    }
    return 'Seleccionar fechas';
  };

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      <Label className="text-negro-100 font-raleway-medium-14pt">{label}</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-3 py-2 
            border border-grisprimario-10 rounded-lg
            bg-white hover:border-verdeprimario-100 
            transition-all duration-200
            ${isOpen ? 'border-verdeprimario-100 ring-2 ring-verdeprimario-100/20' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-grisprimario-200" />
            <span className={`text-sm font-raleway-medium-14pt ${startDate || endDate ? 'text-negro-100' : 'text-grisprimario-200'}`}>
              {getDisplayText()}
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-grisprimario-200 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 w-full max-w-[320px]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-negro-100 font-raleway-bold-16pt">Seleccionar fechas</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  className="w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-150 hover:scale-105 calendar-button"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                  disabled={!tempStartDate || !tempEndDate}
                  className="w-10 h-10 bg-verdeprimario-100 text-white rounded-full hover:bg-verdeprimario-100/90 transition-all duration-150 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed calendar-button"
                >
                  <Check className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              {/* Single Calendar */}
              <div className="w-full max-w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-150 hover:scale-110 calendar-nav"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h4 className="font-semibold capitalize text-negro-100 font-raleway-medium-14pt">{getMonthName(currentMonth)}</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-150 hover:scale-110 calendar-nav"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                    <div key={`day-${index}`} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar(0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

