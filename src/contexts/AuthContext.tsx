
import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { getUserPhone, updateUserPhone as apiUpdateUserPhone } from "@/services/api/userService";

// Initialize Supabase client with fallback for missing environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock client or real client based on available credentials
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing, using mock auth functionality");
    
    // Return a mock client with the expected methods
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ 
          data: { 
            subscription: { 
              unsubscribe: () => {} 
            } 
          } 
        }),
        signUp: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve()
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        }),
        insert: () => Promise.resolve({ data: null, error: null })
      }),
      functions: {
        invoke: () => Promise.resolve({ data: null, error: null })
      },
      rpc: () => Promise.resolve({ data: null, error: null })
    } as unknown as SupabaseClient;
  }
  
  // Return the real Supabase client
  return createClient(supabaseUrl, supabaseAnonKey);
};

const supabase = createSupabaseClient();

// Mock user for demo purposes when not authenticated
const MOCK_USER: User = {
  id: "mock-user-id",
  app_metadata: {},
  user_metadata: {
    full_name: "Demo User"
  },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "demo@example.com",
  role: "authenticated"
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: User | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: User | null;
  }>;
  signOut: () => Promise<void>;
  updateUserPhone: (phone: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  getUserPhone: () => Promise<string>;
  supabase: SupabaseClient;
  mockMode: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    try {
      // Check active sessions and set the user
      const checkSession = async () => {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setLoading(false);
          return;
        }
        
        setUser(data.session?.user ?? null);
        
        // Set mock mode if no real user and env variables missing
        const noSupabaseConfig = !supabaseUrl || !supabaseAnonKey;
        if (!data.session?.user && noSupabaseConfig) {
          console.log("Entering mock mode with demo user");
          setMockMode(true);
        }
        
        setLoading(false);
      };
      
      checkSession();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth state changed, new session:", session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Auth initialization error:", error);
      setLoading(false);
    }
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up with email:", email);
      
      // If in mock mode, return mock user
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log("Mock sign up successful");
        setMockMode(true);
        setUser(MOCK_USER);
        return { data: MOCK_USER, error: null };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Sign up API error:", error);
        return { data: null, error };
      }

      console.log("Sign up successful, response:", data);
      return { data: data.user, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { data: null, error: error as Error };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email);
      
      // If in mock mode, return mock user
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log("Mock sign in successful");
        setMockMode(true);
        setUser(MOCK_USER);
        return { data: MOCK_USER, error: null };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in API error:", error);
        return { data: null, error };
      }

      console.log("Sign in successful, response:", data);
      return { data: data.user, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error: error as Error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log("Attempting to sign out");
      
      // If in mock mode, just clear the user
      if (mockMode) {
        console.log("Mock sign out successful");
        setUser(null);
        setMockMode(false);
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      console.log("Sign out successful");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  // Update user's phone number using our service function
  const updateUserPhone = async (phone: string) => {
    if (!user) {
      return { data: null, error: new Error("Not authenticated") };
    }

    try {
      // If in mock mode, just return success
      if (mockMode) {
        console.log("Mock phone update successful", phone);
        return { data: { phone }, error: null };
      }
      
      await apiUpdateUserPhone(supabase, user.id, phone);
      return { data: { phone }, error: null };
    } catch (error) {
      console.error("Update phone error:", error);
      return { data: null, error: error as Error };
    }
  };

  // Get user's phone number using our service function
  const getUserPhoneWrapper = async (): Promise<string> => {
    if (!user) {
      return "";
    }

    try {
      // If in mock mode, return a mock phone
      if (mockMode) {
        return "+1234567890";
      }
      
      return await getUserPhone(supabase, user.id);
    } catch (error) {
      console.error("Get phone error:", error);
      return "";
    }
  };

  const value = {
    user: mockMode ? MOCK_USER : user,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserPhone,
    getUserPhone: getUserPhoneWrapper,
    supabase,
    mockMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
