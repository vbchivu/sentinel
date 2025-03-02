
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { addDays, addMonths, format, subMonths } from "date-fns";

interface DatePickerWithRangeProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  dateRange,
  setDateRange,
}: DatePickerWithRangeProps) {
  // Predefined ranges
  const handleRangeSelect = (range: "7d" | "30d" | "90d" | "6m" | "1y") => {
    const now = new Date();
    
    switch (range) {
      case "7d":
        setDateRange({ from: addDays(now, -7), to: now });
        break;
      case "30d":
        setDateRange({ from: addDays(now, -30), to: now });
        break;
      case "90d":
        setDateRange({ from: addDays(now, -90), to: now });
        break;
      case "6m":
        setDateRange({ from: addMonths(now, -6), to: now });
        break;
      case "1y":
        setDateRange({ from: addMonths(now, -12), to: now });
        break;
    }
  };
  
  return (
    <div className="p-3 space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRangeSelect("7d")}
        >
          Last 7 days
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRangeSelect("30d")}
        >
          Last 30 days
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRangeSelect("90d")}
        >
          Last 90 days
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRangeSelect("6m")}
        >
          Last 6 months
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRangeSelect("1y")}
        >
          Last year
        </Button>
      </div>
      <div className="border-t pt-3">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
        />
      </div>
    </div>
  );
}
