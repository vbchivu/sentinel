
import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MOCK_DEVICES } from "@/services/api/mockData";

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  ip: string;
  lastChecked: string;
  model?: string;
  location?: string;
}

const fetchDevices = async (supabase: any): Promise<Device[]> => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*');
    
    if (error) throw error;
    
    return data.map((device: any) => ({
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      ip: device.ip_address,
      lastChecked: device.last_checked,
      model: device.model,
      location: device.location
    }));
  } catch (error) {
    console.error("Error fetching devices:", error);
    return MOCK_DEVICES;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Online":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "Warning":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case "Offline":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
  }
};

const DevicesPage = () => {
  const { user, supabase, mockMode } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadDevices = async () => {
      setIsLoading(true);
      try {
        if (mockMode) {
          console.log("Using mock device data in mock mode");
          setDevices(MOCK_DEVICES);
          setIsLoading(false);
          return;
        }

        if (user) {
          const devicesData = await fetchDevices(supabase);
          setDevices(devicesData);
        } else {
          console.log("Using mock device data for non-authenticated user");
          setDevices(MOCK_DEVICES);
        }
      } catch (error) {
        console.error("Failed to load devices:", error);
        toast({
          variant: "destructive",
          title: "Error loading devices",
          description: "Could not load device data. Using mock data instead.",
        });
        setDevices(MOCK_DEVICES);
      } finally {
        setIsLoading(false);
      }
    };

    loadDevices();
  }, [user, supabase, toast, mockMode]);

  const filteredDevices = devices.filter(device => {
    const query = searchQuery.toLowerCase();
    return (
      device.name.toLowerCase().includes(query) ||
      device.type.toLowerCase().includes(query) ||
      device.status.toLowerCase().includes(query) ||
      device.ip.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Devices</h2>
        <p className="page-description">
          Manage and monitor all your network devices.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            className="pl-10 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link to="/add-device">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Checked</TableHead>
                  {(user || mockMode) && <TableHead>Location</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={user || mockMode ? 7 : 6} className="text-center p-8">
                      No devices found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => (
                    <TableRow key={device.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{device.id}</TableCell>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(device.status)}>
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{device.ip}</TableCell>
                      <TableCell className="text-muted-foreground">{device.lastChecked}</TableCell>
                      {(user || mockMode) && <TableCell>{device.location || "—"}</TableCell>}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DevicesPage;
