
import { SupabaseClient } from "@supabase/supabase-js";
import { PredictionRequest, PredictionResult, SimplifiedPredictionRequest, CityPredictionsResponse } from "./types";

// The API base URL
const PREDICTION_API_URL = "https://api.example.com/predict";
// The correct API endpoint (no trailing slash)
const CITY_PREDICTION_API_URL = "https://uptime-ai-510434762087.europe-southwest1.run.app/predict";

/**
 * Predicts downtime probability based on network and environmental conditions
 */
export const predictDowntime = async (
  supabase: SupabaseClient,
  params: PredictionRequest
): Promise<PredictionResult> => {
  try {
    const { data, error } = await supabase
      .rpc('predict_downtime', {
        region: params.region,
        latency_ms: params.latency_ms,
        packet_loss: params.packet_loss,
        temperature: params.temperature,
        wind_speed: params.wind_speed,
        humidity: params.humidity
      });
    
    if (error) throw error;
    
    return {
      downtime_probability: data.probability,
      threshold: data.threshold,
      alert_triggered: data.alert_triggered,
      contributing_factors: data.contributing_factors,
      recommendation: data.recommendation
    };
  } catch (error) {
    console.error("Error making downtime prediction:", error);
    throw error;
  }
};

/**
 * Predicts downtime using simplified metrics
 */
export const predictDowntimeSimplified = async (
  params: SimplifiedPredictionRequest
): Promise<PredictionResult> => {
  try {
    const response = await fetch(PREDICTION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: params.timestamp,
        city: params.city,
        country_code: params.country_code,
        features: {
          metric_bgp: params.metric_bgp,
          calc_bgp_mad: params.calc_bgp_mad,
          calc_avg_mad: params.calc_avg_mad
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Mock result for development until API is ready
    return {
      downtime_probability: parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)),
      threshold: 0.7,
      alert_triggered: Math.random() > 0.6,
      contributing_factors: [
        { name: "BGP Metric", impact: parseFloat((Math.abs(params.metric_bgp) * 0.7).toFixed(2)) },
        { name: "Network Instability", impact: parseFloat((Math.random() * 0.5).toFixed(2)) }
      ],
      recommendation: "Monitor BGP metrics closely and consider routing adjustments."
    };
  } catch (error) {
    console.error("Error making simplified prediction:", error);
    throw error;
  }
};

/**
 * Gets predictions for all cities in a country
 */
export const getCityPredictions = async (
  country: string
): Promise<CityPredictionsResponse> => {
  try {
    console.log(`Attempting to fetch city predictions for ${country} from ${CITY_PREDICTION_API_URL}?country=${encodeURIComponent(country)}`);
    
    // Add timeout handling for the API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${CITY_PREDICTION_API_URL}?country=${encodeURIComponent(country)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    
    return data as CityPredictionsResponse;
  } catch (error) {
    console.error("Error fetching city predictions:", error);
    
    // If the API call fails, return fallback data based on the country
    if (country === "Spain") {
      console.log("Using fallback data for Spain");
      return {
        predictions: {
          "Madrid": 0.0034748444184734394,
          "Barcelona": 0.004376579690223345,
          "Valencia": 0.0033437952261111837,
          "Seville": 0.006782503484561028,
          "Zaragoza": 0.003636487134878024,
          "Málaga": 0.0034847247971792213,
          "Murcia": 0.0035266592038738416,
          "Palma": 0.0034320998997824427,
          "Las Palmas": 0.003947999745671289,
          "Bilbao": 0.0035445528532564606,
          "Alicante": 0.004058265132688682,
          "Córdoba": 0.0063832946594888735,
          "Valladolid": 0.003503675406237349,
          "Vigo": 0.003947999745671289,
          "Gijón": 0.0035618539082385567
        }
      };
    }
    
    if (country === "UnitedStates") {
      return {
        predictions: {
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
        }
      };
    }
    
    if (country === "UnitedKingdom") {
      return {
        predictions: {
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
    }
    
    // If no fallback data for the country, return an empty predictions object
    return { predictions: {} };
  }
};

/**
 * Gets historical prediction accuracy
 */
export const getPredictionAccuracy = async (
  supabase: SupabaseClient
): Promise<{
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  regions: Array<{ name: string; accuracy: number }>;
}> => {
  try {
    const { data, error } = await supabase
      .from('prediction_accuracy')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      accuracy: data.overall_accuracy,
      totalPredictions: data.total_predictions,
      correctPredictions: data.correct_predictions,
      regions: data.region_accuracy
    };
  } catch (error) {
    console.error("Error fetching prediction accuracy:", error);
    throw error;
  }
};

/**
 * Gets available regions for prediction
 */
export const getAvailableRegions = async (
  supabase: SupabaseClient
): Promise<Array<{ id: string; name: string }>> => {
  try {
    const { data, error } = await supabase
      .from('prediction_regions')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map((region: any) => ({
      id: region.id,
      name: region.name
    }));
  } catch (error) {
    console.error("Error fetching prediction regions:", error);
    throw error;
  }
};

/**
 * Saves a prediction result for accuracy tracking
 */
export const savePredictionResult = async (
  supabase: SupabaseClient,
  prediction: {
    region: string;
    predicted_probability: number;
    actual_outcome: boolean;
    parameters: PredictionRequest;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('prediction_history')
      .insert([{
        region: prediction.region,
        predicted_probability: prediction.predicted_probability,
        actual_outcome: prediction.actual_outcome,
        parameters: prediction.parameters,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error saving prediction result:", error);
    throw error;
  }
};
