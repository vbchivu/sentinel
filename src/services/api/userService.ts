import { SupabaseClient, User } from "@supabase/supabase-js";
import { UserProfile } from "./types";

/**
 * Fetches user profile from Supabase
 */
export const fetchUserProfile = async (supabase: SupabaseClient, userId: string): Promise<UserProfile> => {
  try {
    // First get the basic user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Then get the profile data
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw profileError;
    }
    
    // Then get the preferences data
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (prefsError && prefsError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw prefsError;
    }
    
    // Combine all the data
    return {
      id: userData.id,
      name: userData.name || profileData?.name || '',
      email: userData.email,
      phone_number: profileData?.phone_number || '',
      country: profileData?.country || '',
      preferences: prefsData ? {
        emailAlerts: prefsData.email_alerts || true,
        smsAlerts: prefsData.sms_alerts || false,
        pushNotifications: prefsData.push_notifications || true,
        alertThreshold: prefsData.alert_threshold || 80
      } : undefined
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Updates user profile in Supabase
 */
export const updateUserProfile = async (
  supabase: SupabaseClient, 
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> => {
  try {
    // Start a transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw transactionError;
    
    try {
      // Update the user table if name is provided
      if (profile.name) {
        const { error: nameError } = await supabase
          .from('users')
          .update({ name: profile.name })
          .eq('id', userId);
        
        if (nameError) throw nameError;
      }
      
      // Update the profile table if phone number or country is provided
      if (profile.phone_number !== undefined || profile.country !== undefined) {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        const updateData: { phone_number?: string, country?: string } = {};
        if (profile.phone_number !== undefined) updateData.phone_number = profile.phone_number;
        if (profile.country !== undefined) updateData.country = profile.country;
        
        if (existingProfile) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', userId);
          
          if (profileError) throw profileError;
        } else {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{ user_id: userId, ...updateData }]);
          
          if (profileError) throw profileError;
        }
      }
      
      // Update the preferences table if preferences are provided
      if (profile.preferences) {
        const { data: existingPrefs } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        const prefsData = {
          email_alerts: profile.preferences.emailAlerts,
          sms_alerts: profile.preferences.smsAlerts,
          push_notifications: profile.preferences.pushNotifications,
          alert_threshold: profile.preferences.alertThreshold
        };
        
        if (existingPrefs) {
          const { error: prefsError } = await supabase
            .from('user_preferences')
            .update(prefsData)
            .eq('user_id', userId);
          
          if (prefsError) throw prefsError;
        } else {
          const { error: prefsError } = await supabase
            .from('user_preferences')
            .insert([{ user_id: userId, ...prefsData }]);
          
          if (prefsError) throw prefsError;
        }
      }
      
      // Commit the transaction
      const { error: commitError } = await supabase.rpc('commit_transaction');
      if (commitError) throw commitError;
      
    } catch (error) {
      // Rollback the transaction if any error occurs
      await supabase.rpc('rollback_transaction');
      throw error;
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Updates user phone number
 */
export const updateUserPhone = async (
  supabase: SupabaseClient, 
  userId: string, 
  phoneNumber: string
): Promise<void> => {
  try {
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ phone_number: phoneNumber })
        .eq('user_id', userId);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_profiles')
        .insert([{ user_id: userId, phone_number: phoneNumber }]);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error updating user phone:", error);
    throw error;
  }
};

/**
 * Gets user's phone number
 */
export const getUserPhone = async (supabase: SupabaseClient, userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('phone_number')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw error;
    }
    
    return data?.phone_number || '';
  } catch (error) {
    console.error("Error getting user phone:", error);
    return '';
  }
};

/**
 * Gets user's region
 */
export const getUserRegion = async (supabase: SupabaseClient, userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('region')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw error;
    }
    
    return data?.region || '';
  } catch (error) {
    console.error("Error getting user region:", error);
    return '';
  }
};

/**
 * Updates user region
 */
export const updateUserRegion = async (
  supabase: SupabaseClient, 
  userId: string, 
  region: string
): Promise<void> => {
  try {
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ region })
        .eq('user_id', userId);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_profiles')
        .insert([{ user_id: userId, region }]);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error updating user region:", error);
    throw error;
  }
};

/**
 * Gets user's country
 */
export const getUserCountry = async (supabase: SupabaseClient, userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('country')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw error;
    }
    
    return data?.country || '';
  } catch (error) {
    console.error("Error getting user country:", error);
    return '';
  }
};

/**
 * Updates user country
 */
export const updateUserCountry = async (
  supabase: SupabaseClient, 
  userId: string, 
  country: string
): Promise<void> => {
  try {
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ country })
        .eq('user_id', userId);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_profiles')
        .insert([{ user_id: userId, country }]);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error updating user country:", error);
    throw error;
  }
};
