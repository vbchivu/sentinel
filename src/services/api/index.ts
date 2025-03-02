
// Export all API services for easy imports
export * from "./types";
export * from "./dashboardService";
export * from "./analyticsService";
export * from "./userService";
export * from "./deviceService";
export * from "./networkService";
export * from "./alertService";
export * from "./predictionService";
export * from "./mockData";

// Add a convenient API function to check if Supabase is connected
import { SupabaseClient } from "@supabase/supabase-js";

export const isSupabaseConnected = async (supabase: SupabaseClient): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    return !error;
  } catch (error) {
    console.error("Supabase connection check failed:", error);
    return false;
  }
};
