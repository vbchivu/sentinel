
import { SupabaseClient } from "@supabase/supabase-js";
import { Device } from "./types";

/**
 * Fetches all devices from the API
 */
export const fetchDevices = async (supabase: SupabaseClient): Promise<Device[]> => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error("Supabase error fetching devices:", error);
      throw new Error(`Failed to fetch devices: ${error.message}`);
    }
    
    if (!data) {
      return [];
    }
    
    // Transform API data to match our application's Device interface
    return data.map((device: any) => ({
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      ip: device.ip_address,
      lastChecked: device.last_checked,
      model: device.model || "",
      location: device.location || "",
      notes: device.notes || ""
    }));
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
};

/**
 * Fetches a single device by ID
 */
export const fetchDeviceById = async (supabase: SupabaseClient, deviceId: string): Promise<Device> => {
  if (!deviceId) {
    throw new Error("Device ID is required");
  }
  
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .single();
    
    if (error) {
      console.error(`Supabase error fetching device with ID ${deviceId}:`, error);
      throw new Error(`Failed to fetch device: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      ip: data.ip_address,
      lastChecked: data.last_checked,
      model: data.model || "",
      location: data.location || "",
      notes: data.notes || ""
    };
  } catch (error) {
    console.error(`Error fetching device with ID ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Creates a new device
 */
export const createDevice = async (supabase: SupabaseClient, device: Omit<Device, 'id'>): Promise<Device> => {
  // Validate required fields
  if (!device.name || !device.type || !device.status || !device.ip) {
    throw new Error("Missing required device fields");
  }
  
  try {
    const { data, error } = await supabase
      .from('devices')
      .insert([{
        name: device.name,
        type: device.type,
        status: device.status,
        ip_address: device.ip,
        last_checked: device.lastChecked,
        model: device.model,
        location: device.location,
        notes: device.notes
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error creating device:", error);
      throw new Error(`Failed to create device: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("Failed to create device: No data returned");
    }
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      ip: data.ip_address,
      lastChecked: data.last_checked,
      model: data.model || "",
      location: data.location || "",
      notes: data.notes || ""
    };
  } catch (error) {
    console.error("Error creating device:", error);
    throw error;
  }
};

/**
 * Updates an existing device
 */
export const updateDevice = async (supabase: SupabaseClient, deviceId: string, device: Partial<Device>): Promise<Device> => {
  try {
    // Convert from our application structure to database schema
    const dbDevice: Record<string, any> = {};
    
    if (device.name !== undefined) dbDevice.name = device.name;
    if (device.type !== undefined) dbDevice.type = device.type;
    if (device.status !== undefined) dbDevice.status = device.status;
    if (device.ip !== undefined) dbDevice.ip_address = device.ip;
    if (device.lastChecked !== undefined) dbDevice.last_checked = device.lastChecked;
    if (device.model !== undefined) dbDevice.model = device.model;
    if (device.location !== undefined) dbDevice.location = device.location;
    if (device.notes !== undefined) dbDevice.notes = device.notes;
    
    const { data, error } = await supabase
      .from('devices')
      .update(dbDevice)
      .eq('id', deviceId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      ip: data.ip_address,
      lastChecked: data.last_checked,
      model: data.model,
      location: data.location,
      notes: data.notes
    };
  } catch (error) {
    console.error(`Error updating device with ID ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Deletes a device
 */
export const deleteDevice = async (supabase: SupabaseClient, deviceId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', deviceId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting device with ID ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Bulk imports devices
 */
export const bulkImportDevices = async (supabase: SupabaseClient, devices: Omit<Device, 'id'>[]): Promise<number> => {
  try {
    // Convert to database schema format
    const dbDevices = devices.map(device => ({
      name: device.name,
      type: device.type,
      status: device.status,
      ip_address: device.ip,
      last_checked: device.lastChecked,
      model: device.model,
      location: device.location,
      notes: device.notes
    }));
    
    const { data, error } = await supabase
      .from('devices')
      .insert(dbDevices);
    
    if (error) throw error;
    
    return dbDevices.length;
  } catch (error) {
    console.error("Error bulk importing devices:", error);
    throw error;
  }
};
