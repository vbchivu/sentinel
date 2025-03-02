
import { SupabaseClient } from "@supabase/supabase-js";
import { NetworkNode } from "./types";

/**
 * Fetches all network nodes from the API
 */
export const fetchNetworkNodes = async (supabase: SupabaseClient): Promise<NetworkNode[]> => {
  try {
    const { data, error } = await supabase
      .from('network_nodes')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Transform API data to match our application's NetworkNode interface
    return data.map((node: any) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      status: node.status,
      latency: node.latency,
      uptime: node.uptime,
      lastChecked: node.last_checked,
      ip: node.ip_address,
      location: node.location
    }));
  } catch (error) {
    console.error("Error fetching network nodes:", error);
    throw error;
  }
};

/**
 * Fetches a single network node by ID
 */
export const fetchNodeById = async (supabase: SupabaseClient, nodeId: string): Promise<NetworkNode> => {
  try {
    const { data, error } = await supabase
      .from('network_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      latency: data.latency,
      uptime: data.uptime,
      lastChecked: data.last_checked,
      ip: data.ip_address,
      location: data.location
    };
  } catch (error) {
    console.error(`Error fetching network node with ID ${nodeId}:`, error);
    throw error;
  }
};

/**
 * Updates the status of a network node
 */
export const updateNodeStatus = async (
  supabase: SupabaseClient, 
  nodeId: string, 
  status: "online" | "offline" | "degraded",
  latency?: number
): Promise<void> => {
  try {
    const updateData: Record<string, any> = { 
      status: status,
      last_checked: new Date().toISOString()
    };
    
    if (latency !== undefined) {
      updateData.latency = latency;
    }
    
    const { error } = await supabase
      .from('network_nodes')
      .update(updateData)
      .eq('id', nodeId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error updating status for node with ID ${nodeId}:`, error);
    throw error;
  }
};

/**
 * Run a network scan to update all nodes
 */
export const runNetworkScan = async (supabase: SupabaseClient): Promise<{ updated: number, total: number }> => {
  try {
    // In a real implementation, this would trigger a server function
    // that performs actual network scanning
    const { data, error } = await supabase
      .functions
      .invoke('run-network-scan');
    
    if (error) throw error;
    
    return {
      updated: data.updated_nodes,
      total: data.total_nodes
    };
  } catch (error) {
    console.error("Error running network scan:", error);
    throw error;
  }
};

/**
 * Get network overview statistics
 */
export const getNetworkOverview = async (supabase: SupabaseClient): Promise<{
  total: number;
  online: number;
  degraded: number;
  offline: number;
  avgLatency: number;
  avgUptime: number;
}> => {
  try {
    const { data, error } = await supabase
      .from('network_overview')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      total: data.total_nodes,
      online: data.online_nodes,
      degraded: data.degraded_nodes,
      offline: data.offline_nodes,
      avgLatency: data.average_latency,
      avgUptime: data.average_uptime
    };
  } catch (error) {
    console.error("Error fetching network overview:", error);
    throw error;
  }
};
