
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, AlertTriangle, Thermometer, Wind, Droplet } from "lucide-react";
import { PredictionRequest } from "@/services/api/types";

// Define available regions
const REGIONS = [
  { id: "kenya", name: "Kenya" },
  { id: "brazil", name: "Brazil" },
  { id: "india", name: "India" },
  { id: "indonesia", name: "Indonesia" },
  { id: "nigeria", name: "Nigeria" },
];

// Define form schema with validation for advanced options
const predictionFormSchema = z.object({
  region: z.string({
    required_error: "Please select a region.",
  }),
  latency_ms: z.coerce
    .number()
    .min(0, { message: "Latency must be a positive number." })
    .max(5000, { message: "Latency cannot exceed 5000ms." }),
  packet_loss: z.coerce
    .number()
    .min(0, { message: "Packet loss must be between 0 and 100%." })
    .max(100, { message: "Packet loss must be between 0 and 100%." }),
  temperature: z.coerce
    .number()
    .min(-50, { message: "Temperature must be between -50°C and 60°C." })
    .max(60, { message: "Temperature must be between -50°C and 60°C." }),
  wind_speed: z.coerce
    .number()
    .min(0, { message: "Wind speed must be a positive number." }),
  humidity: z.coerce
    .number()
    .min(0, { message: "Humidity must be between 0 and 100%." })
    .max(100, { message: "Humidity must be between 0 and 100%." }),
});

export type PredictionFormValues = z.infer<typeof predictionFormSchema>;

interface AdvancedPredictionFormProps {
  onSubmit: (values: PredictionRequest) => Promise<void>;
  isLoading: boolean;
}

export const AdvancedPredictionForm = ({ onSubmit, isLoading }: AdvancedPredictionFormProps) => {
  // Initialize advanced form
  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      region: "",
      latency_ms: 120,
      packet_loss: 2.5,
      temperature: 25,
      humidity: 80,
      wind_speed: 3.4,
    },
  });

  const handleSubmit = (values: PredictionFormValues) => {
    // Ensure all required fields are present for PredictionRequest
    const predictionRequest: PredictionRequest = {
      region: values.region,
      latency_ms: values.latency_ms,
      packet_loss: values.packet_loss,
      temperature: values.temperature,
      wind_speed: values.wind_speed,
      humidity: values.humidity,
    };
    
    onSubmit(predictionRequest);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the region for prediction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="latency_ms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latency (ms)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="120"
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
            name="packet_loss"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Packet Loss (%)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Thermometer className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="25"
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
            name="wind_speed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wind Speed (km/h)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Wind className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="3.4"
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
            name="humidity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Humidity (%)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Droplet className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="80"
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
