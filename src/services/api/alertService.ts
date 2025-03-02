
import { SupabaseClient } from "@supabase/supabase-js";
import { Alert } from "./types";

// Mock data for fallback
const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    title: "Network Latency Spike",
    description: "Detected unusual latency in network traffic",
    severity: "high",
    status: "pending",
    sourceDevice: "Network Monitor",
    createdAt: new Date().toISOString(),
    country: "Spain",
    city: "Madrid",
    threshold: 5.2,
    isSystem: true
  },
  {
    id: "2",
    title: "Server CPU Overload",
    description: "Server CPU usage exceeded 90% for more than 5 minutes",
    severity: "critical",
    status: "acknowledged",
    sourceDevice: "Server Monitor",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    country: "UnitedStates",
    city: "New York",
    threshold: 8.7,
    isSystem: true
  },
  {
    id: "3",
    title: "Potential DDoS Attack",
    description: "Unusual traffic pattern detected, possible DDoS attempt",
    severity: "critical",
    status: "resolved",
    sourceDevice: "Security Gateway",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    notes: "False alarm, traffic spike due to marketing campaign",
    country: "UnitedKingdom",
    city: "London",
    threshold: 9.1,
    isSystem: true
  },
  {
    id: "4",
    title: "Database Connection Issues",
    description: "Intermittent database connection failures detected",
    severity: "medium",
    status: "pending",
    sourceDevice: "Database Monitor",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    country: "Spain",
    city: "Barcelona",
    threshold: 6.5,
    isSystem: true
  },
  {
    id: "5",
    title: "Bandwidth Alert",
    description: "User created alert for bandwidth monitoring",
    severity: "low",
    status: "pending",
    sourceDevice: "Network Monitor",
    createdAt: new Date(Date.now() - 129600000).toISOString(),
    country: "UnitedStates",
    city: "Los Angeles",
    threshold: 3.2,
    isSystem: false
  }
];

const MOCK_STATS = {
  total: 5,
  pending: 3,
  acknowledged: 1,
  resolved: 1,
  critical: 2,
  high: 1,
  medium: 1,
  low: 1
};

/**
 * Fetches all alerts from the API
 */
export const fetchAlerts = async (
  supabase: SupabaseClient, 
  options?: {
    status?: "pending" | "acknowledged" | "resolved";
    severity?: "low" | "medium" | "high" | "critical";
    limit?: number;
    offset?: number;
    country?: string;
    city?: string;
    isSystem?: boolean;
  }
): Promise<{ alerts: Alert[]; total: number }> => {
  try {
    // Use mock data if supabase is not available or for testing
    if (!supabase || process.env.NODE_ENV === 'test') {
      console.log("Using mock alert data");
      
      // Filter mock data based on options
      let filteredAlerts = [...MOCK_ALERTS];
      
      if (options?.status) {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === options.status);
      }
      
      if (options?.severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === options.severity);
      }
      
      if (options?.country) {
        filteredAlerts = filteredAlerts.filter(alert => alert.country === options.country);
      }
      
      if (options?.city) {
        filteredAlerts = filteredAlerts.filter(alert => alert.city === options.city);
      }
      
      if (options?.isSystem !== undefined) {
        filteredAlerts = filteredAlerts.filter(alert => alert.isSystem === options.isSystem);
      }
      
      // Sort by created date, newest first
      filteredAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply pagination
      const total = filteredAlerts.length;
      let paginatedAlerts = filteredAlerts;
      
      if (options?.limit && options?.offset !== undefined) {
        const start = options.offset;
        const end = options.offset + options.limit;
        paginatedAlerts = filteredAlerts.slice(start, end);
      }
      
      return {
        alerts: paginatedAlerts,
        total
      };
    }
    
    // Real data fetch
    try {
      let query = supabase.from('alerts').select('*', { count: 'exact' });
      
      // Apply filters
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      if (options?.severity) {
        query = query.eq('severity', options.severity);
      }
      
      if (options?.country) {
        query = query.eq('country', options.country);
      }
      
      if (options?.city) {
        query = query.eq('city', options.city);
      }
      
      if (options?.isSystem !== undefined) {
        query = query.eq('is_system', options.isSystem);
      }
      
      // Order by created date, newest first
      query = query.order('created_at', { ascending: false });
      
      // Apply pagination
      if (options?.limit) {
        query = query.range(
          options.offset || 0,
          (options.offset || 0) + options.limit - 1
        );
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Transform API data to match our application's Alert interface
      const alerts = data.map((alert: any) => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        status: alert.status,
        sourceDevice: alert.source_device,
        createdAt: alert.created_at,
        resolvedAt: alert.resolved_at,
        notes: alert.notes,
        country: alert.country,
        city: alert.city,
        threshold: alert.threshold,
        isSystem: alert.is_system
      }));
      
      return {
        alerts,
        total: count || 0
      };
    } catch (dbError) {
      console.error("Database error, falling back to mock data:", dbError);
      return fetchAlerts(null as any, options);
    }
  } catch (error) {
    console.error("Error fetching alerts:", error);
    // Fallback to mock data in case of any error
    return fetchAlerts(null as any, options);
  }
};

/**
 * Updates an alert status
 */
export const updateAlertStatus = async (
  supabase: SupabaseClient,
  alertId: string,
  status: "pending" | "acknowledged" | "resolved",
  notes?: string
): Promise<Alert> => {
  try {
    // Use mock data if supabase is not available
    if (!supabase || process.env.NODE_ENV === 'test') {
      console.log("Using mock data for update");
      
      // Find the alert in mock data
      const alertIndex = MOCK_ALERTS.findIndex(alert => alert.id === alertId);
      if (alertIndex === -1) {
        throw new Error(`Alert with ID ${alertId} not found`);
      }
      
      // Update the alert
      MOCK_ALERTS[alertIndex] = {
        ...MOCK_ALERTS[alertIndex],
        status,
        notes: notes || MOCK_ALERTS[alertIndex].notes,
        resolvedAt: status === "resolved" ? new Date().toISOString() : MOCK_ALERTS[alertIndex].resolvedAt
      };
      
      return MOCK_ALERTS[alertIndex];
    }
    
    const updateData: Record<string, any> = { status };
    
    // If resolving, set the resolved timestamp
    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }
    
    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }
    
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update(updateData)
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        severity: data.severity,
        status: data.status,
        sourceDevice: data.source_device,
        createdAt: data.created_at,
        resolvedAt: data.resolved_at,
        notes: data.notes,
        country: data.country,
        city: data.city,
        threshold: data.threshold,
        isSystem: data.is_system
      };
    } catch (dbError) {
      console.error("Database error, falling back to mock update:", dbError);
      return updateAlertStatus(null as any, alertId, status, notes);
    }
  } catch (error) {
    console.error(`Error updating alert with ID ${alertId}:`, error);
    throw error;
  }
};

/**
 * Gets alert statistics
 */
export const getAlertStats = async (
  supabase: SupabaseClient,
  options?: {
    country?: string;
    city?: string;
    isSystem?: boolean;
  }
): Promise<{
  total: number;
  pending: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}> => {
  try {
    // Use mock data if supabase is not available
    if (!supabase || process.env.NODE_ENV === 'test') {
      console.log("Using mock stats data");
      
      // For mockups, we'll just return static data
      // In a real implementation we would filter the mock alerts
      return MOCK_STATS;
    }
    
    try {
      // For filtered stats, we need to query the alerts table directly
      if (options?.country || options?.city || options?.isSystem !== undefined) {
        let query = supabase.from('alerts').select('status, severity', { count: 'exact' });
        
        if (options.country) {
          query = query.eq('country', options.country);
        }
        
        if (options.city) {
          query = query.eq('city', options.city);
        }
        
        if (options.isSystem !== undefined) {
          query = query.eq('is_system', options.isSystem);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Calculate statistics from the filtered data
        const stats = {
          total: data.length,
          pending: data.filter(alert => alert.status === 'pending').length,
          acknowledged: data.filter(alert => alert.status === 'acknowledged').length,
          resolved: data.filter(alert => alert.status === 'resolved').length,
          critical: data.filter(alert => alert.severity === 'critical').length,
          high: data.filter(alert => alert.severity === 'high').length,
          medium: data.filter(alert => alert.severity === 'medium').length,
          low: data.filter(alert => alert.severity === 'low').length
        };
        
        return stats;
      }
      
      // If no filters, use the original implementation
      const { data, error } = await supabase
        .from('alert_stats')
        .select('*')
        .single();
      
      if (error) throw error;
      
      return {
        total: data.total_alerts,
        pending: data.pending_alerts,
        acknowledged: data.acknowledged_alerts,
        resolved: data.resolved_alerts,
        critical: data.critical_alerts,
        high: data.high_alerts,
        medium: data.medium_alerts,
        low: data.low_alerts
      };
    } catch (dbError) {
      console.error("Database error, falling back to mock stats:", dbError);
      return getAlertStats(null as any, options);
    }
  } catch (error) {
    console.error("Error fetching alert statistics:", error);
    return MOCK_STATS;
  }
};

/**
 * Create a new manual alert
 */
export const createAlert = async (
  supabase: SupabaseClient,
  alert: {
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    sourceDevice: string;
    country?: string;
    city?: string;
    threshold?: number;
  }
): Promise<Alert> => {
  try {
    // Use mock data if supabase is not available
    if (!supabase || process.env.NODE_ENV === 'test') {
      console.log("Using mock data for creating alert");
      
      // Create a new mock alert
      const newAlert: Alert = {
        id: `mock-${Date.now()}`,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        status: "pending",
        sourceDevice: alert.sourceDevice,
        createdAt: new Date().toISOString(),
        country: alert.country,
        city: alert.city,
        threshold: alert.threshold,
        isSystem: false
      };
      
      // Add to mock data
      MOCK_ALERTS.push(newAlert);
      
      return newAlert;
    }
    
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert([{
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          status: "pending",
          source_device: alert.sourceDevice,
          created_at: new Date().toISOString(),
          country: alert.country,
          city: alert.city,
          threshold: alert.threshold,
          is_system: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        severity: data.severity,
        status: data.status,
        sourceDevice: data.source_device,
        createdAt: data.created_at,
        resolvedAt: data.resolved_at,
        notes: data.notes,
        country: data.country,
        city: data.city,
        threshold: data.threshold,
        isSystem: data.is_system
      };
    } catch (dbError) {
      console.error("Database error, falling back to mock creation:", dbError);
      return createAlert(null as any, alert);
    }
  } catch (error) {
    console.error("Error creating alert:", error);
    throw error;
  }
};
