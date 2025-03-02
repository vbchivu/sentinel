
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  PredictionRequest, 
  PredictionResult, 
  SimplifiedPredictionRequest, 
  CityPredictionsResponse 
} from "@/services/api/types";
import { 
  predictDowntimeSimplified, 
  getCityPredictions 
} from "@/services/api/predictionService";

interface UsePredictionReturn {
  isLoading: boolean;
  result: PredictionResult | null;
  cityPredictions: Record<string, number> | null;
  cityPredictionsLoading: boolean;
  getPrediction: (values: PredictionRequest) => Promise<void>;
  getSimplifiedPrediction: (values: SimplifiedPredictionRequest) => Promise<void>;
  getCityPredictionsByCountry: (country: string) => Promise<void>;
  setMockResult: (mockResult: PredictionResult) => void;
  setMockCityPredictions: (mockPredictions: Record<string, number>) => void;
}

// Mock calculation for demonstration
const calculateMockProbability = (values: PredictionRequest): PredictionResult => {
  let probability = 0;
  
  // Simple model that weighs different factors
  probability += (values.latency_ms / 1000) * 0.3;
  probability += (values.packet_loss / 100) * 0.3;
  
  // Environmental factors
  if (values.temperature > 35 || values.temperature < 0) {
    probability += 0.15;
  }
  
  if (values.humidity > 90) {
    probability += 0.1;
  }
  
  if (values.wind_speed > 20) {
    probability += 0.15;
  }
  
  // Clamp between 0 and 1
  probability = Math.max(0, Math.min(1, probability));
  
  // Add some randomness for demo purposes
  probability += (Math.random() * 0.2) - 0.1;
  probability = Math.max(0, Math.min(1, probability));
  
  const threshold = 0.7;
  
  return {
    downtime_probability: parseFloat(probability.toFixed(2)),
    threshold: threshold,
    alert_triggered: probability > threshold,
    contributing_factors: [
      { name: "Network Latency", impact: 0.35 },
      { name: "Packet Loss", impact: 0.30 },
      { name: "Environmental Conditions", impact: 0.25 }
    ],
    recommendation: "Consider network path optimization and environmental controls."
  };
};

// Mock city predictions
const getMockCityPredictions = (country: string): Record<string, number> => {
  const predictionsByCountry: Record<string, Record<string, number>> = {
    spain: {
      "Madrid": 0.0034748444184734394,
      "Barcelona": 0.004376579690223345,
      "Valencia": 0.0033437952261111837,
      "Seville": 0.006782503484561028,
      "Zaragoza": 0.003636487134878024,
      "Málaga": 0.0034847247971792213,
      "Murcia": 0.0035266592038738416,
      "Palma": 0.0034320998997824427,
      "Las Palmas": 0.003947999745671289,
      "Bilbao": 0.0035445528532564606
    },
    kenya: {
      "Nairobi": 0.42,
      "Mombasa": 0.67,
      "Kisumu": 0.55,
      "Nakuru": 0.33,
      "Eldoret": 0.29
    },
    brazil: {
      "São Paulo": 0.38,
      "Rio de Janeiro": 0.45,
      "Brasília": 0.22,
      "Salvador": 0.51,
      "Fortaleza": 0.63
    },
    india: {
      "Mumbai": 0.76,
      "Delhi": 0.82,
      "Bangalore": 0.58,
      "Chennai": 0.65,
      "Kolkata": 0.73
    },
    indonesia: {
      "Jakarta": 0.72,
      "Surabaya": 0.65,
      "Medan": 0.58,
      "Bandung": 0.47,
      "Makassar": 0.52
    },
    nigeria: {
      "Lagos": 0.81,
      "Kano": 0.75,
      "Ibadan": 0.69,
      "Abuja": 0.45,
      "Port Harcourt": 0.63
    },
    unitedstates: {
      "New York": 0.0045,
      "Los Angeles": 0.0052,
      "Chicago": 0.0038,
      "Houston": 0.0062,
      "Phoenix": 0.0031,
      "Philadelphia": 0.0044,
      "San Antonio": 0.0037,
      "San Diego": 0.0028,
      "Dallas": 0.0057,
      "San Jose": 0.0033
    },
    unitedkingdom: {
      "London": 0.0039,
      "Birmingham": 0.0044,
      "Manchester": 0.0049,
      "Glasgow": 0.0051,
      "Liverpool": 0.0046,
      "Bristol": 0.0037,
      "Edinburgh": 0.0042,
      "Leeds": 0.0045,
      "Sheffield": 0.0038,
      "Newcastle": 0.0047
    }
  };
  
  return predictionsByCountry[country.toLowerCase()] || {};
};

export const usePrediction = (): UsePredictionReturn => {
  const { toast } = useToast();
  const { user, supabase, mockMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [cityPredictions, setCityPredictions] = useState<Record<string, number> | null>(null);
  const [cityPredictionsLoading, setCityPredictionsLoading] = useState(false);

  // Function to set mock result for display purposes
  const setMockResult = (mockResult: PredictionResult) => {
    setResult(mockResult);
  };

  // Function to set mock city predictions for display purposes
  const setMockCityPredictions = (mockPredictions: Record<string, number>) => {
    setCityPredictions(mockPredictions);
  };

  // Function to get prediction from API
  const getPrediction = async (values: PredictionRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      let predictionResult;
      
      // Use real API if user is authenticated and not in mock mode
      if (user && !mockMode && supabase) {
        try {
          const { data, error } = await supabase
            .rpc('predict_downtime', {
              region: values.region,
              latency_ms: values.latency_ms,
              packet_loss: values.packet_loss,
              temperature: values.temperature,
              wind_speed: values.wind_speed,
              humidity: values.humidity
            });
          
          if (error) throw error;
          
          predictionResult = {
            downtime_probability: data.probability,
            threshold: data.threshold,
            alert_triggered: data.alert_triggered,
            contributing_factors: data.contributing_factors,
            recommendation: data.recommendation
          };
        } catch (error) {
          console.error("Error making prediction:", error);
          // Return mock result on failure
          predictionResult = calculateMockProbability(values);
        }
      } else {
        // Simulate API call for non-authenticated users or mock mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        predictionResult = calculateMockProbability(values);
      }
      
      setResult(predictionResult);
      
      toast({
        title: "Prediction completed",
        description: "Downtime probability has been calculated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Prediction failed",
        description: "There was an error processing your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get simplified prediction
  const getSimplifiedPrediction = async (values: SimplifiedPredictionRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      // For mock mode or unauthenticated users, use mock calculation
      if (!user || mockMode) {
        // Convert simplified request to full request format for mock calculation
        const fullRequest: PredictionRequest = {
          region: values.region,
          latency_ms: values.network_quality === "good" ? 50 : 
                      values.network_quality === "moderate" ? 150 : 300,
          packet_loss: values.network_quality === "good" ? 0.5 : 
                       values.network_quality === "moderate" ? 2 : 8,
          temperature: values.weather_condition === "normal" ? 25 : 
                       values.weather_condition === "extreme_heat" ? 40 : 
                       values.weather_condition === "extreme_cold" ? -5 : 25,
          humidity: values.weather_condition === "rainy" ? 95 : 60,
          wind_speed: values.weather_condition === "stormy" ? 35 : 5
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockResult = calculateMockProbability(fullRequest);
        setResult(mockResult);
      } else {
        // Call the actual API for authenticated users
        const predictionResult = await predictDowntimeSimplified(values);
        setResult(predictionResult);
      }
      
      toast({
        title: "Prediction completed",
        description: "Downtime probability has been calculated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Prediction failed",
        description: "There was an error processing your request.",
      });
      
      // Provide mock result even on error
      const fallbackRequest: PredictionRequest = {
        region: values.region,
        latency_ms: 150,
        packet_loss: 2,
        temperature: 25,
        humidity: 60,
        wind_speed: 5
      };
      
      const mockResult = calculateMockProbability(fallbackRequest);
      setResult(mockResult);
    } finally {
      setIsLoading(false);
    }
  };

  // Get city predictions
  const getCityPredictionsByCountry = async (country: string): Promise<void> => {
    setCityPredictionsLoading(true);
    setCityPredictions(null);
    
    try {
      // For mock mode or unauthenticated users, use mock data
      if (!user || mockMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockCityPredictions = getMockCityPredictions(country);
        setCityPredictions(mockCityPredictions);
      } else {
        // Call the actual API for authenticated users
        const response = await getCityPredictions(country);
        setCityPredictions(response.predictions);
      }
      
      toast({
        title: "City predictions loaded",
        description: `Loaded predictions for cities in ${country}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load city predictions",
        description: "There was an error fetching the predictions.",
      });
      
      // Provide mock data even on error
      const mockCityPredictions = getMockCityPredictions(country);
      setCityPredictions(mockCityPredictions);
    } finally {
      setCityPredictionsLoading(false);
    }
  };

  return {
    isLoading,
    result,
    cityPredictions,
    cityPredictionsLoading,
    getPrediction,
    getSimplifiedPrediction,
    getCityPredictionsByCountry,
    setMockResult,
    setMockCityPredictions
  };
};
