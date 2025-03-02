
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Globe, Hash, CloudSnow, Thermometer } from "lucide-react";
import { SimplifiedPredictionRequest } from "@/services/api/types";

// Define schema for simplified prediction
const simplifiedPredictionSchema = z.object({
  timestamp: z.string().min(1, { message: "Timestamp is required." }),
  city: z.string().min(1, { message: "City is required." }),
  country_code: z.string().min(1, { message: "Country is required." }),
  metric_bgp: z.coerce
    .number()
    .min(-10, { message: "BGP metric must be between -10 and 10." })
    .max(10, { message: "BGP metric must be between -10 and 10." }),
  calc_bgp_mad: z.coerce
    .number()
    .min(0, { message: "BGP MAD must be a positive number." }),
  calc_avg_mad: z.coerce
    .number()
    .min(0, { message: "Average MAD must be a positive number." }),
  region: z.string().min(1, { message: "Region is required." }),
  network_quality: z.enum(["good", "moderate", "poor"]),
  weather_condition: z.enum(["normal", "extreme_heat", "extreme_cold", "rainy", "stormy"]),
});

// Define countries
const COUNTRIES = [
  { code: "ES", name: "Spain" },
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
];

export type SimplifiedPredictionFormValues = z.infer<typeof simplifiedPredictionSchema>;

interface SimplifiedPredictionFormProps {
  onSubmit: (values: SimplifiedPredictionRequest) => Promise<void>;
  isLoading: boolean;
}

// Helper to get current timestamp in the format expected by datetime-local input
const getCurrentTimestamp = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"
};

export const SimplifiedPredictionForm = ({ onSubmit, isLoading }: SimplifiedPredictionFormProps) => {
  // Initialize form with current date/time
  const form = useForm<SimplifiedPredictionFormValues>({
    resolver: zodResolver(simplifiedPredictionSchema),
    defaultValues: {
      timestamp: getCurrentTimestamp(),
      city: "",
      country_code: "ES",
      metric_bgp: -0.2071,
      calc_bgp_mad: 0.0,
      calc_avg_mad: 0.0,
      region: "Europe",
      network_quality: "good",
      weather_condition: "normal",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="timestamp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timestamp</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Albacete"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Europe"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="network_quality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Network Quality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="weather_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weather Condition</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <CloudSnow className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select weather" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="extreme_heat">Extreme Heat</SelectItem>
                    <SelectItem value="extreme_cold">Extreme Cold</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="stormy">Stormy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="metric_bgp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BGP Metric</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="-0.2071"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">Range: -10 to 10</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="calc_bgp_mad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BGP MAD</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="0.0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="calc_avg_mad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avg MAD</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="0.0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Calculating..." : "Predict Downtime"}
        </Button>
      </form>
    </Form>
  );
};
