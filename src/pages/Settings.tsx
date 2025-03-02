
import { useState, useEffect, useCallback } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BellRing, User, Lock, Bell, Shield, Zap, Save, LogOut, Phone, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { updateUserPhone, getUserPhone, updateUserProfile, updateUserCountry } from "@/services/api/userService";
import { MOCK_USER_PREFERENCES } from "@/services/api/mockData";

// Define form schemas
const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  country: z.string().min(1, {
    message: "Please select your country.",
  }),
});

const notificationsFormSchema = z.object({
  emailAlerts: z.boolean().default(true),
  smsAlerts: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  alertThreshold: z.number().min(0).max(100).default(80),
  phoneNumber: z.string().optional(),
});

// Available countries
const COUNTRIES = [
  { id: "kenya", name: "Kenya" },
  { id: "brazil", name: "Brazil" },
  { id: "india", name: "India" },
  { id: "spain", name: "Spain" },
  { id: "nigeria", name: "Nigeria" },
  { id: "indonesia", name: "Indonesia" },
];

// Dashboard layout types
export type DashboardLayout = "default" | "sidebar" | "grid";

// Create a custom event to notify layout changes
export const dashboardLayoutChanged = (layout: DashboardLayout) => {
  const event = new CustomEvent('dashboardLayoutChanged', { detail: layout });
  window.dispatchEvent(event);
};

// Create a custom event to notify country changes
export const userCountryChanged = (country: string) => {
  const event = new CustomEvent('userCountryChanged', { detail: country });
  window.dispatchEvent(event);
  // Also store in localStorage for persistence
  localStorage.setItem("userCountry", country);
};

const SettingsPage = () => {
  const { toast } = useToast();
  const { user, signOut, supabase } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [selectedLayout, setSelectedLayout] = useState<DashboardLayout>("default");
  const [userCountry, setUserCountry] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // Load saved layout preference and user country from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboardLayout") as DashboardLayout | null;
    if (savedLayout && ["default", "sidebar", "grid"].includes(savedLayout)) {
      setSelectedLayout(savedLayout);
    }
    
    const savedCountry = localStorage.getItem("userCountry");
    if (savedCountry) {
      setUserCountry(savedCountry);
    }
  }, []);

  // Account form
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: userName || "John Doe", // Will be updated when user profile is loaded
      country: userCountry || "",
    },
  });

  // Update form when userCountry or userName changes
  useEffect(() => {
    if (userCountry) {
      accountForm.setValue("country", userCountry);
    }
    if (userName) {
      accountForm.setValue("name", userName);
    }
  }, [userCountry, userName, accountForm]);

  // Fetch the user's phone number and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;
        
        const phone = await getUserPhone(supabase, user.id);
        setUserPhoneNumber(phone);
        
        // Fetch user profile data to get name and country
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('name, country')
            .eq('user_id', user.id)
            .single();
          
          if (profileData) {
            if (profileData.name) setUserName(profileData.name);
            if (profileData.country) setUserCountry(profileData.country);
          }
        } catch (err) {
          console.error("Error fetching user profile data:", err);
        }
      } catch (error) {
        console.error("Error fetching phone number:", error);
      }
    };

    fetchUserData();
  }, [user, supabase]);

  // Notifications form
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailAlerts: MOCK_USER_PREFERENCES.emailAlerts,
      smsAlerts: !!userPhoneNumber,  // Enable if user has phone number
      pushNotifications: MOCK_USER_PREFERENCES.pushNotifications,
      alertThreshold: MOCK_USER_PREFERENCES.alertThreshold,
      phoneNumber: userPhoneNumber,
    },
  });

  // Update form values when userPhoneNumber changes
  useEffect(() => {
    notificationsForm.setValue("phoneNumber", userPhoneNumber);
    notificationsForm.setValue("smsAlerts", !!userPhoneNumber);
  }, [userPhoneNumber, notificationsForm]);

  // Handle account form submission
  const onSubmitAccount = async (values: z.infer<typeof accountFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Update user profile with country
      if (user) {
        await updateUserProfile(supabase, user.id, {
          name: values.name,
          country: values.country
        });
        
        // Update local state and notify other components
        setUserCountry(values.country);
        userCountryChanged(values.country);
        setUserName(values.name);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle notifications form submission
  const onSubmitNotifications = async (values: z.infer<typeof notificationsFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Update phone number if SMS alerts are enabled
      if (values.smsAlerts && values.phoneNumber) {
        if (user) {
          await updateUserPhone(supabase, user.id, values.phoneNumber);
          setUserPhoneNumber(values.phoneNumber);
        }
      }
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save settings.",
      });
    } finally {
      setIsSubmitting(false);
    }
    
    console.log(values);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // Handle layout change
  const handleLayoutChange = (layout: DashboardLayout) => {
    setSelectedLayout(layout);
    
    // Save layout preference to localStorage
    localStorage.setItem("dashboardLayout", layout);
    
    // Dispatch custom event to notify other components
    dashboardLayoutChanged(layout);
    
    toast({
      title: "Layout updated",
      description: `Dashboard layout changed to ${layout}.`,
    });
  };

  return (
    <div className="container py-6 space-y-6 max-w-screen-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile & Settings</h2>
          <p className="text-muted-foreground">
            Manage your profile, country, and system preferences.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and country.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accountForm}>
                <form 
                  onSubmit={accountForm.handleSubmit(onSubmitAccount)}
                  className="space-y-4"
                >
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {user && (
                    <div className="space-y-1">
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email address cannot be changed.
                      </p>
                    </div>
                  )}
                  
                  <FormField
                    control={accountForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Country</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Dashboard and alerts will be customized for your country.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="mt-4" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive alerts and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form 
                  onSubmit={notificationsForm.handleSubmit(onSubmitNotifications)}
                  className="space-y-4"
                >
                  <FormField
                    control={notificationsForm.control}
                    name="emailAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Alerts</FormLabel>
                          <FormDescription>
                            Receive network alerts via email.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="smsAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">SMS Alerts</FormLabel>
                          <FormDescription>
                            Receive critical alerts via SMS.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {notificationsForm.watch("smsAlerts") && (
                    <FormField
                      control={notificationsForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="+1 (555) 123-4567"
                                {...field}
                                value={field.value || ""}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Enter your phone number to receive SMS alerts.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={notificationsForm.control}
                    name="pushNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Push Notifications</FormLabel>
                          <FormDescription>
                            Receive push notifications on your device.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="alertThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Threshold ({field.value}%)</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Set the risk threshold level for sending alerts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="mt-4" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save preferences"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">Update your account password.</p>
                  </div>
                  <Button variant="outline">
                    <Lock className="mr-2 h-4 w-4" />
                    Change
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">
                      Set the period of inactivity before automatic logout.
                    </p>
                  </div>
                  <Select defaultValue="30min">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hour">1 hour</SelectItem>
                      <SelectItem value="2hours">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save security settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark mode.
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Dashboard Layout</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred dashboard layout.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button 
                      className={`border rounded p-2 w-20 h-20 flex flex-col transition-all ${selectedLayout === 'default' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      onClick={() => handleLayoutChange('default')}
                    >
                      <div className="h-1/3 bg-muted rounded-sm mb-1"></div>
                      <div className="flex gap-1 flex-1">
                        <div className="w-1/2 bg-muted rounded-sm"></div>
                        <div className="w-1/2 bg-muted rounded-sm"></div>
                      </div>
                      <div className="text-xs mt-1 text-center">Default</div>
                    </button>
                    <button 
                      className={`border rounded p-2 w-20 h-20 flex flex-col transition-all ${selectedLayout === 'sidebar' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      onClick={() => handleLayoutChange('sidebar')}
                    >
                      <div className="flex gap-1 flex-1">
                        <div className="w-1/3 bg-muted rounded-sm"></div>
                        <div className="w-2/3 bg-muted rounded-sm"></div>
                      </div>
                      <div className="text-xs mt-1 text-center">Sidebar</div>
                    </button>
                    <button 
                      className={`border rounded p-2 w-20 h-20 flex flex-col transition-all ${selectedLayout === 'grid' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      onClick={() => handleLayoutChange('grid')}
                    >
                      <div className="grid grid-cols-2 gap-1 flex-1">
                        <div className="bg-muted rounded-sm"></div>
                        <div className="bg-muted rounded-sm"></div>
                        <div className="bg-muted rounded-sm"></div>
                        <div className="bg-muted rounded-sm"></div>
                      </div>
                      <div className="text-xs mt-1 text-center">Grid</div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Data Refresh Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    Set how often the dashboard data refreshes.
                  </p>
                  <Select defaultValue="30sec">
                    <SelectTrigger className="mt-2 w-full md:w-52">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10sec">10 seconds</SelectItem>
                      <SelectItem value="30sec">30 seconds</SelectItem>
                      <SelectItem value="1min">1 minute</SelectItem>
                      <SelectItem value="5min">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save appearance settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
