
import { SupabaseClient } from "@supabase/supabase-js";
import { 
  MonthlyMetricsResponse, 
  WeeklyMetricsResponse, 
  IncidentTypesResponse,
  MonthlyMetricItem,
  WeeklyMetricItem,
  IncidentTypeItem
} from "./types";
import { 
  MOCK_MONTHLY_DATA, 
  MOCK_WEEKLY_DATA, 
  MOCK_INCIDENT_TYPES 
} from "./mockData"; // We'll create this file next

/**
 * Fetches monthly metrics from the API
 */
export const fetchMonthlyMetrics = async (supabase: SupabaseClient): Promise<MonthlyMetricItem[]> => {
  try {
    const { data, error } = await supabase
      .from('monthly_metrics')
      .select('*')
      .order('month_index', { ascending: true });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error("No monthly metrics found");
    }
    
    // Transform API data to match our application format
    return data.map((item) => ({
      month: item.month,
      availability: item.availability,
      incidents: item.incidents
    }));
  } catch (error) {
    console.error("Error fetching monthly metrics:", error);
    // Return mock data if the API call fails
    return MOCK_MONTHLY_DATA;
  }
};

/**
 * Fetches weekly metrics from the API
 */
export const fetchWeeklyMetrics = async (supabase: SupabaseClient): Promise<WeeklyMetricItem[]> => {
  try {
    const { data, error } = await supabase
      .from('weekly_metrics')
      .select('*')
      .order('day_index', { ascending: true });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error("No weekly metrics found");
    }
    
    // Transform API data to match our application format
    return data.map((item) => ({
      day: item.day,
      latency: item.latency,
      bandwidth: item.bandwidth
    }));
  } catch (error) {
    console.error("Error fetching weekly metrics:", error);
    // Return mock data if the API call fails
    return MOCK_WEEKLY_DATA;
  }
};

/**
 * Fetches incident types from the API
 */
export const fetchIncidentTypes = async (supabase: SupabaseClient): Promise<IncidentTypeItem[]> => {
  try {
    const { data, error } = await supabase
      .from('incident_types')
      .select('*')
      .order('percentage', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error("No incident types found");
    }
    
    // Transform API data to match our application format
    return data.map((item) => ({
      type: item.type,
      percentage: item.percentage
    }));
  } catch (error) {
    console.error("Error fetching incident types:", error);
    // Return mock data if the API call fails
    return MOCK_INCIDENT_TYPES;
  }
};

/**
 * Exports monthly metrics to a file on the server and returns download URL
 * This would typically be a server-side operation, but for demo purposes
 * we'll simulate it here
 */
export const exportMetricsReport = async (
  supabase: SupabaseClient, 
  type: 'monthly' | 'weekly' | 'incidents',
  dateRange?: { from: Date, to: Date }
): Promise<string> => {
  try {
    // In a real implementation, this would call a server function
    // that generates the report and returns a download URL
    
    const { data, error } = await supabase
      .functions
      .invoke('generate-metrics-report', {
        body: { type, dateRange }
      });
    
    if (error) throw error;
    
    return data.downloadUrl;
  } catch (error) {
    console.error(`Error exporting ${type} metrics:`, error);
    throw error;
  }
};
