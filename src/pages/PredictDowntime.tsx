
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { usePrediction } from "@/hooks/usePrediction";
import { CityPredictionForm, CityPredictionFormValues } from "@/components/predictions/CityPredictionForm";
import { SimplifiedPredictionForm } from "@/components/predictions/SimplifiedPredictionForm";
import { AdvancedPredictionForm, PredictionFormValues } from "@/components/predictions/AdvancedPredictionForm";
import { CityPredictions } from "@/components/predictions/CityPredictions";
import { PredictionResults } from "@/components/predictions/PredictionResults";
import { SimplifiedPredictionRequest } from "@/services/api/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { MOCK_PREDICTION_REGIONS } from "@/services/api/mockData";

const DEFAULT_PREDICTION_RESULT = {
  downtime_probability: 0.42,
  threshold: 0.7,
  alert_triggered: false,
  contributing_factors: [
    { name: "Network Latency", impact: 0.35 },
    { name: "Packet Loss", impact: 0.25 },
    { name: "Environmental Conditions", impact: 0.15 }
  ],
  recommendation: "Network conditions are stable. Continue monitoring latency and packet loss metrics."
};

const DEFAULT_CITY_PREDICTIONS = null; // No default city predictions

const PredictDowntimePage = () => {
  const [activeTab, setActiveTab] = useState("cities");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const isMobile = useIsMobile();
  const { 
    isLoading, 
    result,
    cityPredictions,
    cityPredictionsLoading,
    getPrediction,
    getSimplifiedPrediction,
    getCityPredictionsByCountry,
    setMockResult,
    setMockCityPredictions
  } = usePrediction();

  useEffect(() => {
    setMockResult(DEFAULT_PREDICTION_RESULT);
    if (DEFAULT_CITY_PREDICTIONS) {
      setMockCityPredictions(DEFAULT_CITY_PREDICTIONS);
    }
  }, [setMockResult, setMockCityPredictions]);

  const handleCityPredictionSubmit = async (values: CityPredictionFormValues) => {
    setSelectedCountry(values.country);
    await getCityPredictionsByCountry(values.country);
  };

  const handleSimplifiedSubmit = async (values: SimplifiedPredictionRequest) => {
    await getSimplifiedPrediction(values);
  };

  const handleAdvancedSubmit = async (values: PredictionFormValues) => {
    const predictionRequest = {
      region: values.region || "",
      latency_ms: values.latency_ms || 0,
      packet_loss: values.packet_loss || 0,
      temperature: values.temperature || 0,
      wind_speed: values.wind_speed || 0,
      humidity: values.humidity || 0,
    };
    
    await getPrediction(predictionRequest);
  };

  return (
    <div className="container py-4 md:py-6 space-y-4 md:space-y-6 max-w-screen-xl px-3 md:px-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Predict Downtime</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Calculate downtime probability based on network metrics and location data.
        </p>
      </div>
      
      <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        <ErrorBoundary>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle>Prediction Factors</CardTitle>
                <CardDescription>
                  Enter network metrics to predict downtime probability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
                    <TabsTrigger value="cities">Cities</TabsTrigger>
                    <TabsTrigger value="simplified">Standard</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cities" className="space-y-4">
                    <CityPredictionForm 
                      onSubmit={handleCityPredictionSubmit} 
                      isLoading={cityPredictionsLoading} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="simplified" className="space-y-4">
                    <SimplifiedPredictionForm 
                      onSubmit={handleSimplifiedSubmit} 
                      isLoading={isLoading} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <AdvancedPredictionForm 
                      onSubmit={handleAdvancedSubmit} 
                      isLoading={isLoading} 
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </ErrorBoundary>
        
        <ErrorBoundary>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle>
                  {activeTab === "cities" ? "City Predictions" : "Prediction Results"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "cities" 
                    ? "Downtime probability for cities in the selected country."
                    : "Calculated probability of network downtime based on your inputs."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTab === "cities" ? (
                  <CityPredictions 
                    cityPredictions={cityPredictions} 
                    cityPredictionsLoading={cityPredictionsLoading}
                    country={selectedCountry}
                  />
                ) : (
                  <PredictionResults result={result} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PredictDowntimePage;
