"use client";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

function startOfMonth(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), 1); }
function addMonths(date: Date, delta: number): Date { return new Date(date.getFullYear(), date.getMonth() + delta, 1); }
function formatDDMMYYYY(date: Date | null): string {
  if (!date) return "";
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function buildMonthGrid(currentMonth: Date) {
  // Monday-first grid with 6 weeks (42 cells)
  const first = startOfMonth(currentMonth);
  const firstWeekday = (first.getDay() + 6) % 7; // convert Sunday=0 to Monday=0
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const cells: { date: Date; isCurrentMonth: boolean }[] = [];
  // Prev month fillers
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -i), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d), isCurrentMonth: true });
  }
  // Next month fillers to 42
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ date: next, isCurrentMonth: false });
  }
  return cells;
}

interface CalendarSectionProps {
  availableDates?: string[];
  onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
}

export const CalendarSection = ({ availableDates, onDateRangeChange }: CalendarSectionProps): JSX.Element => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(today));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const availableSet = useMemo(() => new Set((availableDates || []).map(d => new Date(d).toDateString())), [availableDates]);
  const cells = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

  const inRange = (d: Date) => {
    if (!startDate || !endDate) return false;
    const a = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const b = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return x >= a && x <= b;
  };

  const isAvailable = (d: Date) => availableSet.size === 0 || availableSet.has(d.toDateString());

  const onDayClick = (d: Date) => {
    if (!isAvailable(d)) return;
    let newStartDate: Date | null = startDate;
    let newEndDate: Date | null = endDate;
    
    if (!startDate || (startDate && endDate)) {
      newStartDate = d;
      newEndDate = null;
    } else if (startDate && !endDate) {
      if (d < startDate) {
        newEndDate = startDate;
        newStartDate = d;
      } else {
        newEndDate = d;
      }
    }
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    // Notify parent component of date range change
    if (onDateRangeChange) {
      onDateRangeChange(newStartDate, newEndDate);
    }
  };

  return (
    <Card className="w-full max-w-[315px] bg-white rounded-[30px] shadow-[4px_4px_4px_#00000040]">
      <CardContent className="flex flex-col items-center justify-center gap-[31px] p-8">
        <div className="flex w-full max-w-[251px] gap-0">
          <div className="flex flex-col w-[126px] h-[55px] items-center justify-center gap-[3px] rounded-[10px_0px_0px_10px] border border-solid border-[#c8c8c8]">
            <div className="w-[106px] font-[number:var(--raleway-medium-14pt-font-weight)] font-raleway-medium-14pt text-negro-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]">Desde:</div>
            <div className="flex w-[106px] items-center gap-2">
              <div className="font-raleway-medium-14pt text-grissecundario-100">{formatDDMMYYYY(startDate) || '\u00A0'}</div>
              <CalendarIcon className="w-5 h-5 text-grissecundario-100" />
            </div>
          </div>
          <div className="flex flex-col w-[126px] h-[55px] items-center justify-center gap-[3px] rounded-[0px_10px_10px_0px] border border-solid border-[#c8c8c8]">
            <div className="w-[106px] font-raleway-medium-14pt text-negro-100">Hasta:</div>
            <div className="flex w-[106px] items-center gap-2">
              <div className="font-raleway-medium-14pt text-grissecundario-100">{formatDDMMYYYY(endDate) || '\u00A0'}</div>
              <CalendarIcon className="w-5 h-5 text-grissecundario-100" />
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[216px] items-center justify-between gap-2">
          <Button variant="ghost" size="icon" className="w-[25px] h-[25px] p-0 hover:bg-transparent" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
            <ChevronLeftIcon className="w-[25px] h-[25px]" />
          </Button>
          <div className="font-barlow-medium-20pt text-black capitalize">{getMonthName(currentMonth)}</div>
          <Button variant="ghost" size="icon" className="w-[25px] h-[25px] p-0 hover:bg-transparent" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRightIcon className="w-[25px] h-[25px]" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-x-[15px] gap-y-[8px] w-full max-w-[270px]">
          {weekDays.map((day, index) => (
            <div key={`weekday-${index}`} className="w-[25px] h-[25px] flex items-center justify-center">
              <div className="text-grissecundario-100 font-raleway-medium-16pt text-center">{day}</div>
            </div>
          ))}
          {cells.map((cell, idx) => {
            const selected = (startDate && cell.date.toDateString() === startDate.toDateString()) || (endDate && cell.date.toDateString() === endDate.toDateString()) || inRange(cell.date);
            const disabled = !isAvailable(cell.date);
            return (
            <Button
                key={`day-${idx}`}
              variant="ghost"
                disabled={disabled}
                onClick={() => onDayClick(cell.date)}
                className={`w-[30px] h-[30px] p-0 flex items-center justify-center hover:bg-naranja-100/10 ${selected ? 'bg-naranja-100 rounded-[5px] hover:bg-naranja-100' : ''} ${!cell.isCurrentMonth ? 'w-[25px] h-[25px]' : ''}`}
              >
                <div className={`font-raleway-medium-16pt text-center ${selected ? 'text-blanco-100' : cell.isCurrentMonth ? 'text-negro-100' : 'text-grissecundario-100'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {cell.date.getDate()}
              </div>
            </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
