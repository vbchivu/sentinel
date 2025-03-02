
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  value: number;
  size?: number;
  thickness?: number;
  className?: string;
}

export function RiskGauge({
  value,
  size = 200,
  thickness = 12,
  className,
}: RiskGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  // Calculate risk level color
  const getRiskColor = (val: number) => {
    if (val < 30) return "text-green-500 dark:text-green-400";
    if (val < 70) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  // Calculate risk level text
  const getRiskText = (val: number) => {
    if (val < 30) return "Low";
    if (val < 70) return "Medium";
    return "High";
  };

  // Animate the gauge
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedValue(value);
    }, 200);
    
    return () => clearTimeout(timeout);
  }, [value]);

  // Calculate gauge parameters
  const radius = size / 2 - thickness;
  const circumference = 2 * Math.PI * radius;
  const gaugeAngle = 240; // Degrees of the arc (240 degrees = 2/3 of a circle)
  const gaugeLength = (circumference * gaugeAngle) / 360;
  
  // Calculate the progress along the arc
  const progress = (animatedValue / 100) * gaugeLength;
  const dashOffset = gaugeLength - progress;
  
  // Calculate the rotation to center the gauge
  const rotationOffset = (360 - gaugeAngle) / 2 - 90;

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size * 0.75 }}
    >
      {/* Background arc */}
      <svg
        width={size}
        height={size}
        className="absolute"
        style={{ transform: `rotate(${rotationOffset}deg)` }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeDasharray={gaugeLength}
          strokeLinecap="round"
          className="text-muted/20"
        />
      </svg>
      
      {/* Foreground arc */}
      <svg
        width={size}
        height={size}
        className="absolute"
        style={{ transform: `rotate(${rotationOffset}deg)` }}
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeDasharray={gaugeLength}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={getRiskColor(animatedValue)}
          initial={{ strokeDashoffset: gaugeLength }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {/* Value display */}
      <div className="z-10 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold tracking-tighter">
          {Math.round(animatedValue)}%
        </div>
        <div className={cn("text-xl font-medium", getRiskColor(animatedValue))}>
          {getRiskText(animatedValue)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">Risk Level</div>
      </div>
    </div>
  );
}
