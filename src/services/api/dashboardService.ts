
import { SupabaseClient } from "@supabase/supabase-js";
import { DashboardMetricsResponse } from "./types";
import { MOCK_DASHBOARD_DATA } from "./mockData"; // We'll create this file next

/**
 * Fetches dashboard metrics from the API
 */
export const fetchDashboardMetrics = async (supabase: SupabaseClient): Promise<DashboardMetricsResponse> => {
  try {
    // Get the data from Supabase
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error("No dashboard metrics found");
    }
    
    // Transform API data format to match our application's interface
    return {
      uptime: data.uptime,
      uptimeTrend: data.uptime_trend,
      uptimeChange: data.uptime_change,
      responseTime: data.response_time,
      responseTimeTrend: data.response_time_trend,
      responseTimeChange: data.response_time_change,
      activeAlerts: data.active_alerts,
      alertsTrend: data.alerts_trend,
      alertsChange: data.alerts_change,
      devices: data.devices,
      devicesTrend: data.devices_trend,
      devicesChange: data.devices_change,
      riskScore: data.risk_score,
      riskFactors: data.risk_factors,
      incidents: data.incidents,
      downloadSpeed: data.download_speed,
      downloadTrend: data.download_trend,
      uploadSpeed: data.upload_speed,
      uploadTrend: data.upload_trend,
      bandwidthUsage: data.bandwidth_usage,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    // Return mock data if the API call fails
    return MOCK_DASHBOARD_DATA;
  }
};

/**
 * Updates device count when a new device is added
 */
export const updateDeviceCount = async (supabase: SupabaseClient, count: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('dashboard_metrics')
      .update({ devices: count })
      .eq('id', 1); // Assuming there's only one dashboard_metrics row with id 1
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating device count:", error);
    throw error;
  }
};
