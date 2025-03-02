
import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowDown, ArrowUp, Server, Wifi } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NetworkMetric } from "@/components/dashboard/NetworkMetric";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardLayout } from "./Settings";

// Interface for dashboard metrics
interface DashboardMetrics {
  uptime: string;
  uptimeTrend: "up" | "down" | "neutral";
  uptimeChange: string;
  responseTime: string;
  responseTimeTrend: "up" | "down" | "neutral";
  responseTimeChange: string;
  activeAlerts: number;
  alertsTrend: "up" | "down" | "neutral";
  alertsChange: string;
  devices: number;
  devicesTrend: "up" | "down" | "neutral";
  devicesChange: string;
  riskScore: number;
  riskFactors: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  incidents: Array<{
    title: string;
    time: string;
    status: string;
    statusColor: string;
  }>;
  downloadSpeed: string;
  downloadTrend: string;
  uploadSpeed: string;
  uploadTrend: string;
  bandwidthUsage: number;
}

// Mock dashboard data
const MOCK_DASHBOARD_DATA: DashboardMetrics = {
  uptime: "99.8%",
  uptimeTrend: "down",
  uptimeChange: "0.2%",
  responseTime: "124ms",
  responseTimeTrend: "up",
  responseTimeChange: "8ms",
  activeAlerts: 3,
  alertsTrend: "neutral",
  alertsChange: "",
  devices: 47,
  devicesTrend: "up",
  devicesChange: "5",
  riskScore: 42,
  riskFactors: [
    { name: "Hardware Failures", value: 55, color: "bg-yellow-500" },
    { name: "Network Congestion", value: 28, color: "bg-green-500" },
    { name: "Security Threats", value: 72, color: "bg-red-500" },
    { name: "Power Stability", value: 12, color: "bg-green-500" },
  ],
  incidents: [
    {
      title: "Router Failure",
      time: "2 hours ago",
      status: "Resolved",
      statusColor: "text-green-500",
    },
    {
      title: "High Latency Alert",
      time: "6 hours ago",
      status: "Monitoring",
      statusColor: "text-yellow-500",
    },
    {
      title: "Firewall Warning",
      time: "1 day ago",
      status: "Resolved",
      statusColor: "text-green-500",
    },
  ],
  downloadSpeed: "128.5 MB/s",
  downloadTrend: "+12.5%",
  uploadSpeed: "42.8 MB/s",
  uploadTrend: "+3.2%",
  bandwidthUsage: 78,
};

// Function to fetch dashboard data from API
const fetchDashboardData = async (supabase: any): Promise<DashboardMetrics> => {
  try {
    // In a real app, you'd make multiple queries to get different data
    // For simplicity, we're assuming one dashboard_metrics table with all data
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Transform API data to match our interface
    return {
      uptime: data.uptime,
      uptimeTrend: data.uptime_trend,
      uptimeChange: data.uptime_change,
      responseTime: data.response_time,
      responseTimeTrend: data.response_time_trend,
      responseTimeChange: data.response_time_change,
      activeAlerts: data.active_alerts,
      alertsTrend: data.alerts_trend,
      alertsChange: data.alerts_change,
      devices: data.devices,
      devicesTrend: data.devices_trend,
      devicesChange: data.devices_change,
      riskScore: data.risk_score,
      riskFactors: data.risk_factors,
      incidents: data.incidents,
      downloadSpeed: data.download_speed,
      downloadTrend: data.download_trend,
      uploadSpeed: data.upload_speed,
      uploadTrend: data.upload_trend,
      bandwidthUsage: data.bandwidth_usage,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return MOCK_DASHBOARD_DATA;
  }
};

const Dashboard = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>("default");

  // Load dashboard layout preference
  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboardLayout") as DashboardLayout | null;
    if (savedLayout && ["default", "sidebar", "grid"].includes(savedLayout)) {
      setDashboardLayout(savedLayout);
    }

    // Listen for layout changes from Settings
    const handleLayoutChange = (event: CustomEvent<DashboardLayout>) => {
      setDashboardLayout(event.detail);
    };

    window.addEventListener('dashboardLayoutChanged', handleLayoutChange as EventListener);
    
    return () => {
      window.removeEventListener('dashboardLayoutChanged', handleLayoutChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Use real API if user is logged in, otherwise use mock data
        const dashboardData = user 
          ? await fetchDashboardData(supabase) 
          : MOCK_DASHBOARD_DATA;
        
        setMetrics(dashboardData);
        
        // Show welcome toast
        toast({
          title: "Dashboard Loaded",
          description: user 
            ? "Welcome back to Downtime Sentinel" 
            : "Welcome to Downtime Sentinel",
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: "Could not load dashboard data. Using mock data instead.",
        });
        setMetrics(MOCK_DASHBOARD_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, supabase, toast]);

  if (isLoading || !metrics) {
    return (
      <div className="container py-6 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render the dashboard based on the selected layout
  return (
    <div className="container py-6 space-y-8 max-w-screen-2xl px-4 md:px-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor your network performance and risk assessment
        </p>
      </div>
      
      {/* Metrics Cards Section - Layout depends on user preference */}
      <div className={
        dashboardLayout === "grid" 
          ? "grid gap-4 grid-cols-2 md:grid-cols-4" 
          : dashboardLayout === "sidebar" 
            ? "flex flex-col sm:flex-row gap-4"
            : "grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      }>
        {dashboardLayout === "sidebar" && (
          <div className="sm:w-1/3 space-y-4">
            <DashboardCard 
              title="Network Availability" 
              icon={<Wifi className="h-4 w-4" />}
            >
              <NetworkMetric
                title="Uptime"
                value={metrics.uptime}
                trend={metrics.uptimeTrend}
                changeValue={metrics.uptimeChange}
                changeText="from last week"
              />
            </DashboardCard>
            
            <DashboardCard 
              title="Response Time" 
              icon={<Activity className="h-4 w-4" />}
            >
              <NetworkMetric
                title="Average"
                value={metrics.responseTime}
                trend={metrics.responseTimeTrend}
                changeValue={metrics.responseTimeChange}
                changeText="improvement"
              />
            </DashboardCard>
          </div>
        )}
        
        <div className={
          dashboardLayout === "sidebar" 
            ? "sm:w-2/3 space-y-4" 
            : "contents"
        }>
          {dashboardLayout !== "sidebar" && (
            <>
              <DashboardCard 
                title="Network Availability" 
                icon={<Wifi className="h-4 w-4" />}
              >
                <NetworkMetric
                  title="Uptime"
                  value={metrics.uptime}
                  trend={metrics.uptimeTrend}
                  changeValue={metrics.uptimeChange}
                  changeText="from last week"
                />
              </DashboardCard>
              
              <DashboardCard 
                title="Response Time" 
                icon={<Activity className="h-4 w-4" />}
              >
                <NetworkMetric
                  title="Average"
                  value={metrics.responseTime}
                  trend={metrics.responseTimeTrend}
                  changeValue={metrics.responseTimeChange}
                  changeText="improvement"
                />
              </DashboardCard>
            </>
          )}
          
          <DashboardCard 
            title="Active Alerts" 
            icon={<AlertTriangle className="h-4 w-4" />}
          >
            <NetworkMetric
              title="Issues"
              value={metrics.activeAlerts.toString()}
              trend={metrics.alertsTrend}
              changeText={metrics.alertsChange || "No change"}
            />
          </DashboardCard>
          
          <DashboardCard 
            title="Monitored Devices" 
            icon={<Server className="h-4 w-4" />}
          >
            <NetworkMetric
              title="Total"
              value={metrics.devices.toString()}
              trend={metrics.devicesTrend}
              changeValue={metrics.devicesChange}
              changeText="new devices"
            />
          </DashboardCard>
        </div>
      </div>
      
      {/* Risk Assessment Section - Layout depends on user preference */}
      <div className={
        dashboardLayout === "grid" 
          ? "grid gap-4 grid-cols-1 lg:grid-cols-3"
          : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      }>
        <DashboardCard 
          title="Downtime Risk Assessment" 
          className={dashboardLayout === "grid" ? "" : "md:col-span-2 lg:col-span-2"}
        >
          <div className="flex items-center justify-center py-4">
            <RiskGauge 
              value={metrics.riskScore} 
              size={240} 
            />
          </div>
        </DashboardCard>
        
        <DashboardCard title="Risk Factors">
          <div className="space-y-4">
            {metrics.riskFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{factor.name}</p>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className={`h-2 rounded-full ${factor.color}`} style={{ width: `${factor.value}%` }}></div>
                  </div>
                </div>
                <span className="text-sm">{factor.value}%</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      
      {/* Incidents & Traffic Section - Grid layout adjusts based on preference */}
      <div className={
        dashboardLayout === "grid" 
          ? "grid gap-4 grid-cols-1 md:grid-cols-2"
          : "grid gap-4 md:grid-cols-2"
      }>
        <DashboardCard title="Recent Incidents">
          <div className="space-y-4">
            {metrics.incidents.map((incident, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="space-y-1">
                  <p className="font-medium">{incident.title}</p>
                  <p className="text-sm text-muted-foreground">{incident.time}</p>
                </div>
                <div className={incident.statusColor}>
                  {incident.status}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        
        <DashboardCard title="Network Traffic">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Download</p>
                  <p className="text-xl font-bold">{metrics.downloadSpeed}</p>
                </div>
              </div>
              <div className="flex h-12 w-28 items-center justify-center rounded-md bg-green-500/10 text-green-500">
                {metrics.downloadTrend}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Upload</p>
                  <p className="text-xl font-bold">{metrics.uploadSpeed}</p>
                </div>
              </div>
              <div className="flex h-12 w-28 items-center justify-center rounded-md bg-yellow-500/10 text-yellow-500">
                {metrics.uploadTrend}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Bandwidth Usage</span>
                  <span>{metrics.bandwidthUsage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div 
                    className="h-2 rounded-full bg-primary" 
                    style={{ width: `${metrics.bandwidthUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Dashboard;
