
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { AlertTriangle, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createAlert } from "@/services/api/alertService";
import { fetchDevices } from "@/services/api/deviceService";
import { Device } from "@/services/api/types";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CreateAlertRequest } from "@/services/api/types";
import { Slider } from "@/components/ui/slider";

// City data - typically would come from an API
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza"],
  "UnitedStates": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  "UnitedKingdom": ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool"],
};

// Default source devices for mock data
const DEFAULT_DEVICES = [
  { id: "DEV-001", name: "Main Gateway Router" },
  { id: "DEV-002", name: "Primary Firewall" },
  { id: "DEV-003", name: "Cloud Server A" },
  { id: "DEV-004", name: "Network Monitor" }
];

// Schema for alert creation
const createAlertSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  severity: z.enum(["low", "medium", "high", "critical"]),
  sourceDevice: z.string().min(1, { message: "Source device is required" }),
  country: z.string().optional(),
  city: z.string().optional(),
  threshold: z.number().min(0).max(100).optional(),
});

type CreateAlertFormValues = z.infer<typeof createAlertSchema>;

export function CreateAlertForm() {
  const { toast } = useToast();
  const { supabase, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threshold, setThreshold] = useState(5);
  const [isOpen, setIsOpen] = useState(false);
  const [userCountry, setUserCountry] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  
  // Get the user's selected country from localStorage
  useEffect(() => {
    const savedCountry = localStorage.getItem("userCountry");
    if (savedCountry) {
      setUserCountry(savedCountry);
      
      // Set available cities based on country
      if (CITIES_BY_COUNTRY[savedCountry]) {
        setCities(CITIES_BY_COUNTRY[savedCountry]);
      }
    }
  }, []);
  
  // Fetch available devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        if (supabase && user) {
          const deviceData = await fetchDevices(supabase);
          setDevices(deviceData);
        } else {
          // Use mock devices if not authenticated
          setDevices(DEFAULT_DEVICES as Device[]);
        }
      } catch (error) {
        console.error("Error loading devices:", error);
        setDevices(DEFAULT_DEVICES as Device[]);
      }
    };
    
    loadDevices();
  }, [supabase, user]);
  
  // Listen for country changes
  useEffect(() => {
    const handleCountryChange = (event: CustomEvent<string>) => {
      setUserCountry(event.detail);
      
      // Update cities when country changes
      if (CITIES_BY_COUNTRY[event.detail]) {
        setCities(CITIES_BY_COUNTRY[event.detail]);
        form.setValue("city", ""); // Reset city when country changes
      }
    };

    window.addEventListener('userCountryChanged', handleCountryChange as EventListener);
    
    return () => {
      window.removeEventListener('userCountryChanged', handleCountryChange as EventListener);
    };
  }, []);

  const form = useForm<CreateAlertFormValues>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "medium",
      sourceDevice: "",
      country: userCountry || undefined,
      city: undefined,
      threshold: 5,
    },
  });
  
  useEffect(() => {
    // Update form when userCountry changes
    if (userCountry) {
      form.setValue("country", userCountry);
    }
  }, [userCountry, form]);

  const onSubmit = async (values: CreateAlertFormValues) => {
    if (!supabase) return;
    
    try {
      setIsSubmitting(true);
      
      // Add threshold to values
      values.threshold = threshold;
      
      // Create alert
      await createAlert(supabase, values as CreateAlertRequest);
      
      toast({
        title: "Alert created",
        description: "Your personal alert has been created successfully.",
      });
      
      // Reset form and close sheet
      form.reset();
      setIsOpen(false);
      
    } catch (error) {
      console.error("Error creating alert:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error creating your alert. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2" data-create-alert>
          <Bell className="h-4 w-4" />
          Create Personal Alert
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Personal Alert</SheetTitle>
          <SheetDescription>
            Set up custom monitoring for your network in specific locations.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Network latency monitor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Alert me when the network latency exceeds the threshold in the specified location" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Set the importance level of this alert.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input value={userCountry} disabled placeholder="Your selected country" />
                    </FormControl>
                    <FormDescription>
                      Alerts will be created for your currently selected country. Change your country in Settings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all_cities">All cities</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Specify a city or select "All cities" to monitor the entire country.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Threshold (%): {threshold}</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[threshold]}
                        max={10}
                        step={0.1}
                        onValueChange={(values) => {
                          setThreshold(values[0]);
                          field.onChange(values[0]);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Alert when the downtime probability exceeds this threshold.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sourceDevice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Device</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Device that will generate this alert.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Alert"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
