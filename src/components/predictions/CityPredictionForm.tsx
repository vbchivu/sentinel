
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

// Define schema
const cityPredictionSchema = z.object({
  country: z.string().min(1, { message: "Country is required." }),
});

// Supported countries for city predictions
const PREDICTION_COUNTRIES = [
  { id: "Spain", name: "Spain" },
  { id: "UnitedStates", name: "United States" },
  { id: "UnitedKingdom", name: "United Kingdom" },
];

export type CityPredictionFormValues = z.infer<typeof cityPredictionSchema>;

interface CityPredictionFormProps {
  onSubmit: (values: CityPredictionFormValues) => Promise<void>;
  isLoading: boolean;
}

export const CityPredictionForm = ({ onSubmit, isLoading }: CityPredictionFormProps) => {
  // Initialize city prediction form with no default country
  const form = useForm<CityPredictionFormValues>({
    resolver: zodResolver(cityPredictionSchema),
    defaultValues: {
      country: "", // No default value so user must select
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="country"
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
                  {PREDICTION_COUNTRIES.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select a country to see predictions for all cities.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Loading predictions..." : "Get City Predictions"}
        </Button>
      </form>
    </Form>
  );
};
