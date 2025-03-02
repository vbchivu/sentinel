
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Define network status data
interface NetworkNode {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "degraded";
  latency: number;
  uptime: number;
  lastChecked: string;
}

const MOCK_NETWORK_DATA: NetworkNode[] = [
  {
    id: "gateway-1",
    name: "Main Gateway",
    type: "Gateway",
    status: "online",
    latency: 12,
    uptime: 99.98,
    lastChecked: new Date().toISOString(),
  },
  {
    id: "server-1",
    name: "Primary Server",
    type: "Server",
    status: "online",
    latency: 24,
    uptime: 99.95,
    lastChecked: new Date().toISOString(),
  },
  {
    id: "router-1",
    name: "Core Router",
    type: "Router",
    status: "online",
    latency: 8,
    uptime: 99.99,
    lastChecked: new Date().toISOString(),
  },
  {
    id: "switch-1",
    name: "Distribution Switch",
    type: "Switch",
    status: "degraded",
    latency: 45,
    uptime: 99.7,
    lastChecked: new Date().toISOString(),
  },
  {
    id: "ap-1",
    name: "Office AP",
    type: "Access Point",
    status: "online",
    latency: 15,
    uptime: 99.85,
    lastChecked: new Date().toISOString(),
  },
  {
    id: "backup-1",
    name: "Backup Server",
    type: "Server",
    status: "offline",
    latency: 0,
    uptime: 97.25,
    lastChecked: new Date().toISOString(),
  },
];

// Function to fetch network nodes from the API
const fetchNetworkNodes = async (supabase: any): Promise<NetworkNode[]> => {
  try {
    const { data, error } = await supabase
      .from('network_nodes')
      .select('*');
    
    if (error) throw error;
    
    // Map the data to match our NetworkNode interface
    return data.map((node: any) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      status: node.status,
      latency: node.latency,
      uptime: node.uptime,
      lastChecked: node.last_checked,
    }));
  } catch (error) {
    console.error("Error fetching network nodes:", error);
    return MOCK_NETWORK_DATA;
  }
};

const NetworkStatusPage = () => {
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  const [networkData, setNetworkData] = useState<NetworkNode[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Load network data
  const loadNetworkData = async () => {
    setIsRefreshing(true);
    
    try {
      // Use real API if user is logged in, otherwise use mock data
      const nodesData = user 
        ? await fetchNetworkNodes(supabase) 
        : MOCK_NETWORK_DATA;
      
      setNetworkData(nodesData);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Failed to load network data:", error);
      toast({
        variant: "destructive",
        title: "Error loading network data",
        description: "Could not load network status. Using mock data instead.",
      });
      setNetworkData(MOCK_NETWORK_DATA);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    loadNetworkData();
  }, [user, supabase]);

  // Handle refresh button click
  const handleRefresh = () => {
    loadNetworkData();
  };

  // Auto refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      loadNetworkData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user, supabase]);

  // Get overview stats
  const nodeStats = {
    total: networkData.length,
    online: networkData.filter(node => node.status === "online").length,
    degraded: networkData.filter(node => node.status === "degraded").length,
    offline: networkData.filter(node => node.status === "offline").length,
  };

  return (
    <div className="container py-6 space-y-6 max-w-screen-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Network Status</h2>
          <p className="text-muted-foreground">
            Monitor real-time network health and performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link to="/alerts">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Alerts
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodeStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All network devices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{nodeStats.online}</div>
              <Badge className="ml-2 bg-green-500" variant="secondary">
                {nodeStats.total ? Math.round((nodeStats.online / nodeStats.total) * 100) : 0}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Operating normally
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Degraded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{nodeStats.degraded}</div>
              <Badge className="ml-2 bg-yellow-500" variant="secondary">
                {nodeStats.total ? Math.round((nodeStats.degraded / nodeStats.total) * 100) : 0}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Performance issues
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{nodeStats.offline}</div>
              <Badge className="ml-2 bg-red-500" variant="secondary">
                {nodeStats.total ? Math.round((nodeStats.offline / nodeStats.total) * 100) : 0}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Not responding
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Network Nodes</CardTitle>
          <CardDescription>
            Status of all monitored network devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRefreshing && networkData.length === 0 ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {networkData.map((node) => (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-0">
                    {node.status === "online" ? (
                      <Wifi className="h-5 w-5 text-green-500" />
                    ) : node.status === "degraded" ? (
                      <Wifi className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-500" />
                    )}
                    
                    <div>
                      <div className="font-medium">{node.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {node.type}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground mr-2">Status:</span>
                      <Badge className={
                        node.status === "online" ? "bg-green-500" :
                        node.status === "degraded" ? "bg-yellow-500" : "bg-red-500"
                      }>
                        {node.status === "online" ? "Online" :
                         node.status === "degraded" ? "Degraded" : "Offline"}
                      </Badge>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground mr-2">Latency:</span>
                      {node.status !== "offline" ? `${node.latency} ms` : "N/A"}
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground mr-2">Uptime:</span>
                      {node.uptime}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStatusPage;
