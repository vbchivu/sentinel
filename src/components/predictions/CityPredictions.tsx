
import { MapPin, CloudLightning, Globe, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface CityPredictionsProps {
  cityPredictions: Record<string, number> | null;
  cityPredictionsLoading: boolean;
  country: string;
}

export const CityPredictions = ({ 
  cityPredictions, 
  cityPredictionsLoading,
  country
}: CityPredictionsProps) => {
  if (cityPredictionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <CloudLightning className="h-16 w-16 text-muted-foreground animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading city predictions...</p>
      </div>
    );
  }

  if (!cityPredictions) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Globe className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Select a country and click "Get City Predictions" to see results.</p>
      </div>
    );
  }

  if (Object.keys(cityPredictions).length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          No prediction data available for {country}. Please try another country.
        </AlertDescription>
      </Alert>
    );
  }

  // Find the max probability in the data for relative scaling
  const maxProbability = Math.max(...Object.values(cityPredictions));

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/50 p-3 mb-4">
        <div className="flex">
          <CloudLightning className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Showing network stability predictions for {Object.keys(cityPredictions).length} cities in {country}. 
              <br />
              <span className="font-medium">Values are shown as downtime probability percentages.</span> Lower values indicate better stability.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Cities Network Status</h3>
        <Badge variant="outline" className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {country}
        </Badge>
      </div>
      
      <div className="max-h-[450px] overflow-y-auto pr-2">
        <div className="space-y-2">
          {Object.entries(cityPredictions)
            .sort((a, b) => b[1] - a[1]) // Sort by probability (highest first)
            .map(([city, probability]) => {
              // Display as actual percentage with proper precision
              const percentage = (probability * 100).toFixed(4);
              
              // Classify the risk based on the probability value
              let riskLevel;
              let barColor;
              
              if (probability > 0.006) {
                riskLevel = "Higher Risk";
                barColor = "bg-red-500";
              } else if (probability > 0.004) {
                riskLevel = "Moderate Risk";
                barColor = "bg-amber-500";
              } else {
                riskLevel = "Lower Risk";
                barColor = "bg-emerald-500";
              }
              
              return (
                <div 
                  key={city} 
                  className="flex flex-col p-3 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <MapPin className={`h-4 w-4 mr-2 ${
                        probability > 0.005 ? "text-amber-500" : "text-emerald-500"
                      }`} />
                      <span className="font-medium">{city}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      probability > 0.006
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : probability > 0.004
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}>
                      {riskLevel}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                      <div 
                        className={`h-full rounded-full ${barColor}`}
                        // Scale the bar relative to the maximum value in the dataset
                        style={{ width: `${(probability / maxProbability) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm ml-2 min-w-16 text-right ${
                      probability > 0.006 
                        ? "text-red-600 dark:text-red-400" 
                        : probability > 0.004 
                          ? "text-amber-600 dark:text-amber-400" 
                          : "text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                  
                  {probability > 0.005 && (
                    <div className="mt-2 flex items-start text-xs text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1 flex-shrink-0 mt-0.5" />
                      <span>This city might experience network instability. Consider monitoring closely.</span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
