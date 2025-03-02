
import { CloudLightning, AlertTriangle } from "lucide-react";
import { PredictionResult } from "@/services/api/types";

interface PredictionResultsProps {
  result: PredictionResult | null;
}

export const PredictionResults = ({ result }: PredictionResultsProps) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <CloudLightning className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Fill out the form and click "Predict Downtime" to see results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative h-40 w-40">
          {/* Circular progress indicator */}
          <svg className="h-full w-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-muted/20"
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
            />
            {/* Foreground circle */}
            <circle
              className={`${
                result.alert_triggered
                  ? "text-red-500"
                  : "text-green-500"
              }`}
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${result.downtime_probability * 251.2} 251.2`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">
              {Math.round(result.downtime_probability * 100)}%
            </span>
            <span className="text-sm text-muted-foreground">Probability</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Downtime Probability:</span>
          <span>{(result.downtime_probability * 100).toFixed(1)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Alert Threshold:</span>
          <span>{(result.threshold * 100).toFixed(1)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Alert Status:</span>
          <span className={`px-2 py-1 rounded-md text-sm ${
            result.alert_triggered
              ? "bg-red-500/10 text-red-500"
              : "bg-green-500/10 text-green-500"
          }`}>
            {result.alert_triggered ? "TRIGGERED" : "NORMAL"}
          </span>
        </div>
        
        {result.contributing_factors && result.contributing_factors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Contributing Factors:</h4>
            <div className="space-y-2">
              {result.contributing_factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{factor.name}</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${factor.impact * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {result.recommendation && (
        <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/50 p-4 mt-4">
          <div className="flex">
            <CloudLightning className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Recommendation
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {result.alert_triggered && (
        <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                High Risk of Downtime Detected
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Based on current conditions, there is a high probability of network issues.
                Preventive measures are recommended.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
