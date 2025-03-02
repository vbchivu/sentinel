import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Server, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createDevice } from "@/services/api/deviceService";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEVICE_TYPES = [
  "Router",
  "Switch",
  "Firewall",
  "Server",
  "Access Point",
  "Gateway",
  "Network Monitor",
  "Other"
];

const createDeviceSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  type: z.string().min(1, { message: "Device type is required" }),
  status: z.enum(["Online", "Offline", "Warning"]),
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, { message: "Valid IP address required" }),
  model: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type CreateDeviceFormValues = z.infer<typeof createDeviceSchema>;

const AddDevicePage = () => {
  const { user, supabase, mockMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user && !mockMode) {
    return <Navigate to="/login" />;
  }

  const form = useForm<CreateDeviceFormValues>({
    resolver: zodResolver(createDeviceSchema),
    defaultValues: {
      name: "",
      type: "",
      status: "Online",
      ip: "",
      model: "",
      location: "",
      notes: "",
    },
  });

  const onSubmit = async (values: CreateDeviceFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const deviceData: Omit<Device, 'id'> = {
        name: values.name,
        type: values.type,
        status: values.status,
        ip: values.ip,
        lastChecked: new Date().toISOString(),
        model: values.model || "",
        location: values.location || "",
        notes: values.notes || ""
      };
      
      await createDevice(supabase, deviceData);
      
      toast({
        title: "Device added successfully",
        description: `${values.name} has been added to your network monitoring system.`,
      });
      
      setIsSuccess(true);
      
      form.reset();
      
      setTimeout(() => {
        navigate("/devices");
      }, 2000);
      
    } catch (error) {
      console.error("Error adding device:", error);
      setError(error instanceof Error ? error.message : "Failed to add device. Please try again.");
      toast({
        variant: "destructive",
        title: "Error adding device",
        description: "There was an error adding the device. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-screen-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="page-header">
          <h2 className="page-title">Add Device</h2>
          <p className="page-description">
            Register a new device to monitor in your network.
          </p>
        </div>

        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              <span>Device Details</span>
            </CardTitle>
            <CardDescription>
              Provide information about the device you want to add to your monitoring system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Device Added Successfully</h3>
                <p className="text-muted-foreground mb-4">
                  Your device has been registered and is now being monitored.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to devices page...
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Main Gateway Router" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter a descriptive name for the device.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Type*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEVICE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The category this device belongs to.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Online">Online</SelectItem>
                              <SelectItem value="Offline">Offline</SelectItem>
                              <SelectItem value="Warning">Warning</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Current operational status of the device.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IP Address*</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.1" {...field} />
                          </FormControl>
                          <FormDescription>
                            The IP address used to connect to this device.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Cisco 2900 Series" {...field} />
                          </FormControl>
                          <FormDescription>
                            The manufacturer and model number.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Server Room A" {...field} />
                          </FormControl>
                          <FormDescription>
                            Where this device is physically located.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional information about this device..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any special considerations or instructions for this device.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/devices")}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex gap-2 items-center">
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          <span>Adding...</span>
                        </>
                      ) : "Add Device"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AddDevicePage;
