// API Response Types

// Dashboard
export interface DashboardMetricsResponse {
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

// Analytics 
export interface MonthlyMetricItem {
  month: string;
  availability: number;
  incidents: number;
}

export interface WeeklyMetricItem {
  day: string;
  latency: number;
  bandwidth: number;
}

export interface IncidentTypeItem {
  type: string;
  percentage: number;
}

export interface MonthlyMetricsResponse {
  data: MonthlyMetricItem[];
}

export interface WeeklyMetricsResponse {
  data: WeeklyMetricItem[];
}

export interface IncidentTypesResponse {
  data: IncidentTypeItem[];
}

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  country?: string;
  preferences?: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushNotifications: boolean;
    alertThreshold: number;
  }
}

// Device Management
export interface Device {
  id: string;
  name: string;
  type: string;
  status: "Online" | "Offline" | "Warning"; // Fixed statuses for consistent usage
  ip: string;
  lastChecked: string;
  model?: string;
  location?: string;
  notes?: string;
}

// Network Status
export interface NetworkNode {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "degraded"; // Match existing case in NetworkStatus.tsx
  latency: number;
  uptime: number;
  lastChecked: string;
  ip?: string;
  location?: string;
}

// Alerts
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "acknowledged" | "resolved";
  sourceDevice: string;
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
  country?: string;
  city?: string;
  threshold?: number;
  isSystem?: boolean;
}

// Create Alert Form
export interface CreateAlertRequest {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  sourceDevice: string;
  country?: string;
  city?: string;
  threshold?: number;
}

// Downtime Prediction
export interface PredictionRequest {
  region: string;
  latency_ms: number;
  packet_loss: number;
  temperature: number;
  wind_speed: number;
  humidity: number;
}

export interface SimplifiedPredictionRequest {
  timestamp: string;
  city: string;
  country_code: string;
  metric_bgp: number;
  calc_bgp_mad: number;
  calc_avg_mad: number;
  region: string;
  network_quality: "good" | "moderate" | "poor";
  weather_condition: "normal" | "extreme_heat" | "extreme_cold" | "rainy" | "stormy";
}

export interface PredictionResult {
  downtime_probability: number;
  threshold: number;
  alert_triggered: boolean;
  contributing_factors?: {
    name: string;
    impact: number;
  }[];
  recommendation?: string;
}

// City predictions
export interface CityPredictionsResponse {
  predictions: Record<string, number>;
}

// API Error
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
