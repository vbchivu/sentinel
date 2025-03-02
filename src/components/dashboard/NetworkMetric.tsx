
import { cva } from "class-variance-authority";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const statusVariants = cva("", {
  variants: {
    trend: {
      up: "text-green-500 dark:text-green-400 bg-green-500/10 dark:bg-green-400/10",
      down: "text-red-500 dark:text-red-400 bg-red-500/10 dark:bg-red-400/10",
      neutral: "text-yellow-500 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-400/10",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
});

interface NetworkMetricProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  changeValue?: string | number;
  changeText?: string;
  className?: string;
}

export function NetworkMetric({
  title,
  value,
  trend = "neutral",
  changeValue,
  changeText,
  className,
}: NetworkMetricProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {(changeValue || changeText) && (
        <div className="flex items-center gap-1">
          <div
            className={cn(
              "flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
              statusVariants({ trend })
            )}
          >
            {trend === "up" && <ArrowUpIcon className="mr-1 h-3 w-3" />}
            {trend === "down" && <ArrowDownIcon className="mr-1 h-3 w-3" />}
            {trend === "neutral" && <MinusIcon className="mr-1 h-3 w-3" />}
            {changeValue}
          </div>
          {changeText && (
            <p className="text-xs text-muted-foreground">{changeText}</p>
          )}
        </div>
      )}
    </div>
  );
}
