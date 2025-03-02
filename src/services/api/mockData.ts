
import type { 
  DashboardMetricsResponse,
  Device,
  NetworkNode,
  Alert,
  MonthlyMetricItem,
  WeeklyMetricItem,
  IncidentTypeItem
} from "./types";

// Mock data for dashboard
export const MOCK_DASHBOARD_DATA: DashboardMetricsResponse = {
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

// Mock data for analytics
export const MOCK_MONTHLY_DATA: MonthlyMetricItem[] = [
  { month: "Jan", availability: 99.8, incidents: 2 },
  { month: "Feb", availability: 99.9, incidents: 1 },
  { month: "Mar", availability: 99.7, incidents: 3 },
  { month: "Apr", availability: 99.8, incidents: 2 },
  { month: "May", availability: 99.6, incidents: 4 },
  { month: "Jun", availability: 99.9, incidents: 1 },
  { month: "Jul", availability: 99.7, incidents: 3 },
  { month: "Aug", availability: 99.8, incidents: 2 },
  { month: "Sep", availability: 99.9, incidents: 1 },
  { month: "Oct", availability: 99.5, incidents: 5 },
  { month: "Nov", availability: 99.6, incidents: 4 },
  { month: "Dec", availability: 99.8, incidents: 2 },
];

export const MOCK_WEEKLY_DATA: WeeklyMetricItem[] = [
  { day: "Mon", latency: 120, bandwidth: 75 },
  { day: "Tue", latency: 132, bandwidth: 82 },
  { day: "Wed", latency: 101, bandwidth: 68 },
  { day: "Thu", latency: 134, bandwidth: 75 },
  { day: "Fri", latency: 90, bandwidth: 65 },
  { day: "Sat", latency: 85, bandwidth: 55 },
  { day: "Sun", latency: 90, bandwidth: 58 },
];

export const MOCK_INCIDENT_TYPES: IncidentTypeItem[] = [
  { type: "Hardware Failure", percentage: 28 },
  { type: "Software Issue", percentage: 35 },
  { type: "Network Congestion", percentage: 22 },
  { type: "Power Outage", percentage: 15 },
];

// Mock data for devices
export const MOCK_DEVICES: Device[] = [
  {
    id: "DEV-001",
    name: "Main Gateway Router",
    type: "Router",
    status: "Online",
    ip: "192.168.1.1",
    lastChecked: "2 minutes ago",
    model: "Cisco 2900 Series",
    location: "Server Room"
  },
  {
    id: "DEV-002",
    name: "Primary Firewall",
    type: "Firewall",
    status: "Online",
    ip: "192.168.1.2",
    lastChecked: "5 minutes ago",
    model: "Palo Alto PA-3020",
    location: "Server Room"
  },
  {
    id: "DEV-003",
    name: "Cloud Server A",
    type: "Server",
    status: "Warning",
    ip: "10.0.5.12",
    lastChecked: "3 minutes ago",
    model: "Dell PowerEdge R740",
    location: "Cloud Zone A"
  },
  {
    id: "DEV-004",
    name: "Cloud Server B",
    type: "Server",
    status: "Online",
    ip: "10.0.5.13",
    lastChecked: "just now",
    model: "Dell PowerEdge R740",
    location: "Cloud Zone A"
  },
  {
    id: "DEV-005",
    name: "Office Switch",
    type: "Switch",
    status: "Online",
    ip: "192.168.1.10",
    lastChecked: "7 minutes ago",
    model: "Cisco Catalyst 3850",
    location: "Office 2F"
  },
  {
    id: "DEV-006",
    name: "Backup Server",
    type: "Server",
    status: "Offline",
    ip: "10.0.5.20",
    lastChecked: "10 minutes ago",
    model: "HP ProLiant DL380",
    location: "Server Room"
  },
  {
    id: "DEV-007",
    name: "Development Server",
    type: "Server",
    status: "Online",
    ip: "10.0.5.30",
    lastChecked: "8 minutes ago",
    model: "Dell PowerEdge R640",
    location: "Developer Zone"
  },
  {
    id: "DEV-008",
    name: "Guest Network AP",
    type: "Access Point",
    status: "Online",
    ip: "192.168.2.1",
    lastChecked: "15 minutes ago",
    model: "Ubiquiti UniFi AP-AC-Pro",
    location: "Reception"
  },
];

// Mock data for network nodes
export const MOCK_NETWORK_NODES: NetworkNode[] = [
  {
    id: "gateway-1",
    name: "Main Gateway",
    type: "Gateway",
    status: "online",
    latency: 12,
    uptime: 99.98,
    lastChecked: new Date().toISOString(),
    ip: "192.168.1.1",
    location: "Server Room"
  },
  {
    id: "server-1",
    name: "Primary Server",
    type: "Server",
    status: "online",
    latency: 24,
    uptime: 99.95,
    lastChecked: new Date().toISOString(),
    ip: "10.0.1.5",
    location: "Data Center"
  },
  {
    id: "router-1",
    name: "Core Router",
    type: "Router",
    status: "online",
    latency: 8,
    uptime: 99.99,
    lastChecked: new Date().toISOString(),
    ip: "192.168.1.254",
    location: "Network Room"
  },
  {
    id: "switch-1",
    name: "Distribution Switch",
    type: "Switch",
    status: "degraded",
    latency: 45,
    uptime: 99.7,
    lastChecked: new Date().toISOString(),
    ip: "192.168.2.1",
    location: "Office 3F"
  },
  {
    id: "ap-1",
    name: "Office AP",
    type: "Access Point",
    status: "online",
    latency: 15,
    uptime: 99.85,
    lastChecked: new Date().toISOString(),
    ip: "192.168.3.10",
    location: "Meeting Room"
  },
  {
    id: "backup-1",
    name: "Backup Server",
    type: "Server",
    status: "offline",
    latency: 0,
    uptime: 97.25,
    lastChecked: new Date().toISOString(),
    ip: "10.0.1.6",
    location: "Data Center"
  },
];

// Mock data for alerts
export const MOCK_ALERTS: Alert[] = [
  {
    id: "ALT-001",
    title: "High CPU Usage",
    description: "Server CPU usage exceeds 90% for more than 10 minutes",
    severity: "high",
    status: "pending",
    sourceDevice: "Cloud Server A",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
  },
  {
    id: "ALT-002",
    title: "Network Connectivity Loss",
    description: "Primary connection to cloud services interrupted",
    severity: "critical",
    status: "acknowledged",
    sourceDevice: "Main Gateway Router",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
    notes: "Investigating potential ISP outage"
  },
  {
    id: "ALT-003",
    title: "Disk Space Warning",
    description: "Backup server disk space below 15% free",
    severity: "medium",
    status: "acknowledged",
    sourceDevice: "Backup Server",
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(), // 4 hours ago
    notes: "Scheduled cleanup in progress"
  },
  {
    id: "ALT-004",
    title: "Authentication Failure",
    description: "Multiple failed login attempts detected",
    severity: "medium",
    status: "resolved",
    sourceDevice: "Cloud Server B",
    createdAt: new Date(Date.now() - 300 * 60000).toISOString(), // 5 hours ago
    resolvedAt: new Date(Date.now() - 270 * 60000).toISOString(), // 4.5 hours ago
    notes: "False alarm - scheduled security scan"
  },
  {
    id: "ALT-005",
    title: "SSL Certificate Expiration",
    description: "SSL certificate for main domain expires in 7 days",
    severity: "low",
    status: "pending",
    sourceDevice: "Web Server",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(), // 3 hours ago
  },
];

// Mock data for settings and preferences
export const MOCK_USER_PREFERENCES = {
  emailAlerts: true,
  smsAlerts: false,
  pushNotifications: true,
  alertThreshold: 80,
  dashboardLayout: "default" as const,
  refreshRate: "30sec",
};

// Mock data for prediction regions
export const MOCK_PREDICTION_REGIONS = [
  { id: "kenya", name: "Kenya" },
  { id: "brazil", name: "Brazil" },
  { id: "india", name: "India" },
  { id: "indonesia", name: "Indonesia" },
  { id: "nigeria", name: "Nigeria" },
];
