import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

const calendarDays = [
  { day: 1, isCurrentMonth: true, isSelected: false },
  { day: 2, isCurrentMonth: true, isSelected: false },
  { day: 3, isCurrentMonth: true, isSelected: false },
  { day: 4, isCurrentMonth: true, isSelected: false },
  { day: 5, isCurrentMonth: true, isSelected: false },
  { day: 6, isCurrentMonth: true, isSelected: false },
  { day: 7, isCurrentMonth: true, isSelected: false },
  { day: 8, isCurrentMonth: true, isSelected: false },
  { day: 9, isCurrentMonth: true, isSelected: false },
  { day: 10, isCurrentMonth: true, isSelected: false },
  { day: 11, isCurrentMonth: true, isSelected: false },
  { day: 12, isCurrentMonth: true, isSelected: false },
  { day: 13, isCurrentMonth: true, isSelected: false },
  { day: 14, isCurrentMonth: true, isSelected: false },
  { day: 15, isCurrentMonth: true, isSelected: false },
  { day: 16, isCurrentMonth: true, isSelected: false },
  { day: 17, isCurrentMonth: true, isSelected: false },
  { day: 18, isCurrentMonth: true, isSelected: false },
  { day: 19, isCurrentMonth: true, isSelected: false },
  { day: 20, isCurrentMonth: true, isSelected: false },
  { day: 21, isCurrentMonth: true, isSelected: false },
  { day: 22, isCurrentMonth: true, isSelected: true },
  { day: 23, isCurrentMonth: true, isSelected: true },
  { day: 24, isCurrentMonth: true, isSelected: true },
  { day: 25, isCurrentMonth: true, isSelected: true },
  { day: 26, isCurrentMonth: true, isSelected: true },
  { day: 27, isCurrentMonth: true, isSelected: false },
  { day: 28, isCurrentMonth: true, isSelected: false },
  { day: 29, isCurrentMonth: true, isSelected: false },
  { day: 30, isCurrentMonth: true, isSelected: false },
  { day: 1, isCurrentMonth: false, isSelected: false },
  { day: 2, isCurrentMonth: false, isSelected: false },
  { day: 3, isCurrentMonth: false, isSelected: false },
  { day: 4, isCurrentMonth: false, isSelected: false },
  { day: 5, isCurrentMonth: false, isSelected: false },
];

export const CalendarSection = (): JSX.Element => {
  return (
    <Card className="w-full max-w-[315px] bg-white rounded-[30px] shadow-[4px_4px_4px_#00000040]">
      <CardContent className="flex flex-col items-center justify-center gap-[31px] p-8">
        <div className="flex w-full max-w-[251px] gap-0">
          <div className="flex flex-col w-[126px] h-[55px] items-center justify-center gap-[3px] rounded-[10px_0px_0px_10px] border border-solid border-[#c8c8c8]">
            <div className="w-[106px] font-[number:var(--raleway-medium-14pt-font-weight)] font-raleway-medium-14pt text-negro-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]">
              Desde:
            </div>
            <div className="flex w-[106px] items-center gap-2">
              <div className="font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-grissecundario-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-14pt-font-style)]">
                22/09/2025
              </div>
              <CalendarIcon className="w-5 h-5 text-grissecundario-100" />
            </div>
          </div>
          <div className="flex flex-col w-[126px] h-[55px] items-center justify-center gap-[3px] rounded-[0px_10px_10px_0px] border border-solid border-[#c8c8c8]">
            <div className="w-[106px] font-[number:var(--raleway-medium-14pt-font-weight)] font-raleway-medium-14pt text-negro-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] [font-style:var(--raleway-medium-14pt-font-style)]">
              Hasta:
            </div>
            <div className="flex w-[106px] items-center gap-2">
              <div className="font-raleway-medium-14pt font-[number:var(--raleway-medium-14pt-font-weight)] text-grissecundario-100 text-[length:var(--raleway-medium-14pt-font-size)] tracking-[var(--raleway-medium-14pt-letter-spacing)] leading-[var(--raleway-medium-14pt-line-height)] whitespace-nowrap [font-style:var(--raleway-medium-14pt-font-style)]">
                26/09/2025
              </div>
              <CalendarIcon className="w-5 h-5 text-grissecundario-100" />
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[216px] items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-[25px] h-[25px] p-0 hover:bg-transparent"
          >
            <ChevronLeftIcon className="w-[25px] h-[25px]" />
          </Button>
          <div className="font-barlow-medium-20pt font-[number:var(--barlow-medium-20pt-font-weight)] text-black text-[length:var(--barlow-medium-20pt-font-size)] text-center tracking-[var(--barlow-medium-20pt-letter-spacing)] leading-[var(--barlow-medium-20pt-line-height)] [font-style:var(--barlow-medium-20pt-font-style)]">
            Septiembre 2025
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-[25px] h-[25px] p-0 hover:bg-transparent"
          >
            <ChevronRightIcon className="w-[25px] h-[25px]" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-x-[15px] gap-y-[8px] w-full max-w-[270px]">
          {weekDays.map((day, index) => (
            <div
              key={`weekday-${index}`}
              className="w-[25px] h-[25px] flex items-center justify-center"
            >
              <div className="text-grissecundario-100 font-raleway-medium-16pt font-[number:var(--raleway-medium-16pt-font-weight)] text-[length:var(--raleway-medium-16pt-font-size)] text-center tracking-[var(--raleway-medium-16pt-letter-spacing)] leading-[var(--raleway-medium-16pt-line-height)] [font-style:var(--raleway-medium-16pt-font-style)]">
                {day}
              </div>
            </div>
          ))}
          {calendarDays.map((dayData, index) => (
            <Button
              key={`day-${index}`}
              variant="ghost"
              className={`w-[30px] h-[30px] p-0 flex items-center justify-center hover:bg-naranja-100/10 ${
                dayData.isSelected
                  ? "bg-naranja-100 rounded-[5px] hover:bg-naranja-100"
                  : ""
              } ${!dayData.isCurrentMonth ? "w-[25px] h-[25px]" : ""}`}
            >
              <div
                className={`font-raleway-medium-16pt font-[number:var(--raleway-medium-16pt-font-weight)] text-[length:var(--raleway-medium-16pt-font-size)] text-center tracking-[var(--raleway-medium-16pt-letter-spacing)] leading-[var(--raleway-medium-16pt-line-height)] [font-style:var(--raleway-medium-16pt-font-style)] ${
                  dayData.isSelected
                    ? "text-blanco-100"
                    : dayData.isCurrentMonth
                      ? "text-negro-100"
                      : "text-grissecundario-100"
                }`}
              >
                {dayData.day}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

