"use client";

import { SearchIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, Check, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Service options data
const serviceOptions = [
  { id: 1, name: "Cosecha", description: "Servicios de cosecha agrícola", icon: "🌾" },
  { id: 2, name: "Siembra", description: "Servicios de siembra y plantación", icon: "🌱" },
  { id: 3, name: "Fumigación", description: "Servicios de fumigación y control de plagas", icon: "🚁" },
  { id: 4, name: "Fertilización", description: "Servicios de fertilización del suelo", icon: "🌿" },
  { id: 5, name: "Riego", description: "Servicios de riego y manejo del agua", icon: "💧" },
];

// Location options data
const locationOptions = [
  { id: 1, name: "Cerca de ti", description: "Encuentra servicios cerca de tu ubicación", icon: "📍" },
  { id: 2, name: "Montevideo", description: "Servicios en Montevideo y alrededores", icon: "🏙️" },
  { id: 3, name: "Canelones", description: "Servicios en Canelones", icon: "🌾" },
  { id: 4, name: "Colonia", description: "Servicios en Colonia", icon: "🏛️" },
  { id: 5, name: "San José", description: "Servicios en San José", icon: "🌿" },
  { id: 6, name: "Florida", description: "Servicios en Florida", icon: "🌱" },
];

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

interface DropdownProps {
  label: string;
  placeholder: string;
  width: string;
  paddingX: string;
  options: Array<{ id: number; name: string; description: string; icon?: string; value?: string }>;
  selectedOption: { id: number; name: string; description: string; icon?: string; value?: string } | null;
  onSelect: (option: { id: number; name: string; description: string; icon?: string; value?: string }) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface DateRangePickerProps {
  label: string;
  placeholder: string;
  width: string;
  paddingX: string;
  startDate: Date | null;
  endDate: Date | null;
  onDateSelect: (startDate: Date | null, endDate: Date | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SearchDropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  width,
  paddingX,
  options,
  selectedOption,
  onSelect,
  isOpen,
  onToggle,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div 
      className={`
        ${width} h-[77px] justify-center gap-1 ${paddingX} py-[18px] 
        bg-white rounded-[45px] flex flex-col items-start relative
        border-2 transition-all duration-200 ease-in-out cursor-pointer
        ${isOpen 
          ? 'border-transparent shadow-2xl shadow-verdeprimario-100/30' 
          : 'border-transparent hover:border-verdeprimario-100/50 hover:shadow-md'
        }
      `} 
      ref={dropdownRef}
      onClick={onToggle}
    >
      <div className="text-gray-700 text-[length:var(--raleway-bold-14pt-font-size)] w-fit font-raleway-bold-14pt font-[number:var(--raleway-bold-14pt-font-weight)] tracking-[var(--raleway-bold-14pt-letter-spacing)] leading-[var(--raleway-bold-14pt-line-height)] whitespace-nowrap [font-style:var(--raleway-bold-14pt-font-style)]">
        {label}
      </div>

      <div className="w-full bg-transparent border-none outline-none font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-black text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-none text-left flex items-center justify-between transition-colors duration-200">
        <span className={selectedOption ? "text-black" : "text-gray-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <div className={`
        absolute top-full left-0 right-0 mt-2 bg-white rounded-[25px] shadow-xl border border-gray-200 z-50
        transition-all duration-200 ease-in-out transform origin-top
        ${isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }
      `}>
        <div className="p-2">
          <div className="text-sm font-semibold text-gray-700 mb-2 px-3 py-2">
            {label === "Servicios:" ? "Servicios disponibles" : 
             label === "Zona:" ? "Ubicaciones" : 
             "Fechas disponibles"}
          </div>
          <div className="max-h-64 overflow-y-auto dropdown-scrollbar">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option);
                  onToggle();
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-verdeprimario-100/10 rounded-lg transition-all duration-150 flex items-center gap-3 group"
              >
                {option.icon && <span className="text-lg group-hover:scale-110 transition-transform duration-150">{option.icon}</span>}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-black transition-colors duration-150">{option.name}</div>
                  <div className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-150">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  placeholder,
  width,
  paddingX,
  startDate,
  endDate,
  onDateSelect,
  isOpen,
  onToggle,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Don't close if clicking on calendar dates or buttons
        const target = event.target as HTMLElement;
        if (target.closest('.calendar-date') || target.closest('.calendar-button') || target.closest('.calendar-nav')) {
          return;
        }
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleDateClick = (date: Date) => {
    try {
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
    } catch (error) {
      console.error('Error handling date click:', error);
    }
  };

  const handleConfirm = () => {
    try {
      console.log('Confirming dates:', { tempStartDate, tempEndDate });
      onDateSelect(tempStartDate, tempEndDate);
      onToggle();
    } catch (error) {
      console.error('Error confirming dates:', error);
    }
  };

  const handleClear = () => {
    try {
      setTempStartDate(null);
      setTempEndDate(null);
      onDateSelect(null, null);
    } catch (error) {
      console.error('Error clearing dates:', error);
    }
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
          onClick={() => !isPastDate && handleDateClick(date)}
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
    try {
      // Use tempStartDate and tempEndDate for display while selecting, otherwise use the actual dates
      const displayStartDate = tempStartDate || startDate;
      const displayEndDate = tempEndDate || endDate;
      
      // Check if we have valid dates
      if (displayStartDate && displayEndDate) {
        // Validate both dates are valid Date objects
        const startDateObj = new Date(displayStartDate);
        const endDateObj = new Date(displayEndDate);
        
        if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
          const startStr = startDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          const endStr = endDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          return `${startStr} - ${endStr}`;
        }
      } else if (displayStartDate) {
        // Validate single date
        const startDateObj = new Date(displayStartDate);
        if (!isNaN(startDateObj.getTime())) {
          return startDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        }
      }
      return placeholder;
    } catch (error) {
      console.error('Error formatting date:', error);
      return placeholder;
    }
  };

  return (
    <div 
      className={`
        ${width} h-[77px] justify-center gap-1 ${paddingX} py-[18px] 
        bg-white rounded-[45px] flex flex-col items-start relative
        border-2 transition-all duration-200 ease-in-out cursor-pointer
        ${isOpen 
          ? 'border-transparent shadow-2xl shadow-verdeprimario-100/30' 
          : 'border-transparent hover:border-verdeprimario-100/50 hover:shadow-md'
        }
      `} 
      ref={dropdownRef}
      onClick={onToggle}
    >
      <div className="text-gray-700 text-[length:var(--raleway-bold-14pt-font-size)] w-fit font-raleway-bold-14pt font-[number:var(--raleway-bold-14pt-font-weight)] tracking-[var(--raleway-bold-14pt-letter-spacing)] leading-[var(--raleway-bold-14pt-line-height)] whitespace-nowrap [font-style:var(--raleway-bold-14pt-font-style)]">
        {label}
      </div>

      <div className="w-full bg-transparent border-none outline-none font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-black text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-none text-left flex items-center justify-between transition-colors duration-200">
        <span className={startDate || endDate ? "text-black" : "text-gray-400"}>
          {getDisplayText()}
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <div className={`
        absolute top-full left-0 right-0 mt-2 bg-white rounded-[25px] shadow-xl border border-gray-200 z-50 p-4 min-w-[600px] dropdown-scrollbar
        transition-all duration-200 ease-in-out transform origin-top
        ${isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }
      `}>
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-lg font-semibold">Seleccionar fechas</h3>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-150 hover:scale-105 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleConfirm}
                className="w-10 h-10 bg-verdeprimario-100 text-white rounded-full hover:bg-verdeprimario-100/90 transition-all duration-150 hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-6 px-2">
            {/* Left Calendar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-150 hover:scale-110 calendar-nav"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <h4 className="font-semibold capitalize">{getMonthName(currentMonth)}</h4>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-150 hover:scale-110 calendar-nav"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                  <div key={`left-day-${index}`} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar(0)}
              </div>
            </div>

            {/* Right Calendar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-1 hover:bg-gray-100 rounded calendar-nav"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <h4 className="font-semibold capitalize">{getMonthName(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}</h4>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-1 hover:bg-gray-100 rounded calendar-nav"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                  <div key={`right-day-${index}`} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar(1)}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export const ServiceSearchSection = (): JSX.Element => {
  const [selectedService, setSelectedService] = useState<{ id: number; name: string; description: string; icon?: string } | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ id: number; name: string; description: string; icon?: string } | null>(null);
  
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const handleDateSelect = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <section className="flex w-[903px] h-[92px] items-center justify-center p-[7px] bg-white rounded-[45px] shadow-lg border border-gray-200">
      <SearchDropdown
        label="Servicios:"
        placeholder="Buscar servicio"
        width="w-[280px]"
        paddingX="px-[45px]"
        options={serviceOptions}
        selectedOption={selectedService}
        onSelect={setSelectedService}
        isOpen={isServiceOpen}
        onToggle={() => setIsServiceOpen(!isServiceOpen)}
      />

      <DateRangePicker
        label="Fechas:"
        placeholder="Seleccionar fechas"
        width="w-[280px]"
        paddingX="px-[45px]"
        startDate={startDate}
        endDate={endDate}
        onDateSelect={handleDateSelect}
        isOpen={isDateRangeOpen}
        onToggle={() => setIsDateRangeOpen(!isDateRangeOpen)}
      />

      <SearchDropdown
        label="Zona:"
        placeholder="Seleccione la ubicación"
        width="w-[231px]"
        paddingX="px-[45px]"
        options={locationOptions}
        selectedOption={selectedLocation}
        onSelect={setSelectedLocation}
        isOpen={isLocationOpen}
        onToggle={() => setIsLocationOpen(!isLocationOpen)}
      />

      <Button className="flex w-[77px] h-[77px] items-center justify-center bg-verdesecundario-100 hover:bg-verdeprimario-100 rounded-full transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg">
        <SearchIcon className="w-12 h-12 text-white" />
      </Button>
    </section>
  );
};

