import { useState, useEffect, useMemo } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  LineChart as LucideLineChart, 
  PieChart, 
  Calendar, 
  FileDown, 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Area, 
  AreaChart, 
  BarChart, 
  Bar,
  TooltipProps
} from "recharts";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NetworkMetric } from "@/components/dashboard/NetworkMetric";
import { motion } from "framer-motion";
import { 
  fetchMonthlyMetrics, 
  fetchWeeklyMetrics, 
  fetchIncidentTypes,
  exportMetricsReport,
  MOCK_MONTHLY_DATA,
  MOCK_WEEKLY_DATA,
  MOCK_INCIDENT_TYPES
} from "@/services/api";
import type { MonthlyMetricItem, WeeklyMetricItem, IncidentTypeItem } from "@/services/api/types";

type CustomTooltipProps = TooltipProps<any, any> & {
  active?: boolean;
  payload?: any[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-popover border border-border rounded-md shadow-md p-4">
        <p className="font-medium">{label}</p>
        <div className="space-y-1 mt-2">
          {payload.map((entry, index) => (
            <div 
              key={`item-${index}`} 
              className="flex justify-between gap-4 text-sm"
              style={{ color: entry.color }}
            >
              <span>{entry.name}:</span>
              <span className="font-medium">
                {entry.name.toLowerCase().includes('latency') 
                  ? `${entry.value}ms` 
                  : entry.name.toLowerCase().includes('availability') 
                    ? `${entry.value}%` 
                    : entry.name.toLowerCase().includes('bandwidth') 
                      ? `${entry.value}%`
                      : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const getExportFilename = (type: string) => {
  const date = format(new Date(), 'yyyy-MM-dd');
  return `sentinel-analytics-${type}-${date}`;
};

const exportAsCSV = (data: any[], type: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => Object.values(item).join(',')).join('\n');
  const csvContent = `${headers}\n${rows}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', getExportFilename(type) + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateInsights = (data: MonthlyMetricItem[]) => {
  if (!data.length) return [];
  
  const insights = [];
  
  const highestAvail = data.reduce((prev, current) => {
    return (prev.availability > current.availability) ? prev : current;
  });
  
  const lowestAvail = data.reduce((prev, current) => {
    return (prev.availability < current.availability) ? prev : current;
  });
  
  const highestIncident = data.reduce((prev, current) => {
    return (prev.incidents > current.incidents) ? prev : current;
  });
  
  const avgAvailability = data.reduce((sum, item) => sum + item.availability, 0) / data.length;
  
  insights.push({
    type: highestAvail.availability > 99.8 ? 'positive' : 'neutral',
    title: 'Peak Performance',
    description: `${highestAvail.month} had the highest availability at ${highestAvail.availability}%`
  });
  
  insights.push({
    type: lowestAvail.availability < 99.6 ? 'negative' : 'neutral',
    title: 'Service Dips',
    description: `${lowestAvail.month} had the lowest availability at ${lowestAvail.availability}%`
  });
  
  insights.push({
    type: highestIncident.incidents > 3 ? 'negative' : 'neutral',
    title: 'Incident Spike',
    description: `${highestIncident.month} experienced ${highestIncident.incidents} incidents, the most in any period`
  });
  
  insights.push({
    type: avgAvailability > 99.7 ? 'positive' : 'neutral',
    title: 'Overall Performance',
    description: `Average availability is ${avgAvailability.toFixed(2)}% across all periods`
  });
  
  return insights;
};

const AnalyticsPage = () => {
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  const [monthlyData, setMonthlyData] = useState<MonthlyMetricItem[]>(MOCK_MONTHLY_DATA);
  const [weeklyData, setWeeklyData] = useState<WeeklyMetricItem[]>(MOCK_WEEKLY_DATA);
  const [incidentTypes, setIncidentTypes] = useState<IncidentTypeItem[]>(MOCK_INCIDENT_TYPES);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const insights = useMemo(() => generateInsights(monthlyData), [monthlyData]);
  
  const filteredMonthlyData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return monthlyData;
    
    const getMonthDate = (monthName: string) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.indexOf(monthName);
      const year = new Date().getFullYear();
      return new Date(year, monthIndex, 15);
    };
    
    return monthlyData.filter(item => {
      const itemDate = getMonthDate(item.month);
      return isWithinInterval(itemDate, { 
        start: startOfMonth(dateRange.from), 
        end: endOfMonth(dateRange.to || dateRange.from) 
      });
    });
  }, [monthlyData, dateRange]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user && supabase) {
          const [monthlyResult, weeklyResult, incidentResult] = await Promise.all([
            fetchMonthlyMetrics(supabase),
            fetchWeeklyMetrics(supabase),
            fetchIncidentTypes(supabase)
          ]);
          
          setMonthlyData(monthlyResult);
          setWeeklyData(weeklyResult);
          setIncidentTypes(incidentResult);
        } else {
          setMonthlyData(MOCK_MONTHLY_DATA);
          setWeeklyData(MOCK_WEEKLY_DATA);
          setIncidentTypes(MOCK_INCIDENT_TYPES);
        }
      } catch (error) {
        console.error("Failed to load analytics data:", error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Could not load analytics. Using mock data instead.",
        });
        setMonthlyData(MOCK_MONTHLY_DATA);
        setWeeklyData(MOCK_WEEKLY_DATA);
        setIncidentTypes(MOCK_INCIDENT_TYPES);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, supabase, toast]);

  const handleExportData = async (type: 'monthly' | 'weekly' | 'incidents') => {
    if (!user || !supabase) {
      if (type === 'monthly') {
        exportAsCSV(filteredMonthlyData, 'monthly');
      } else if (type === 'weekly') {
        exportAsCSV(weeklyData, 'weekly');
      } else {
        exportAsCSV(incidentTypes.map(item => ({ 
          type: item.type, 
          percentage: item.percentage 
        })), 'incidents');
      }
      return;
    }
    
    setIsExporting(true);
    
    try {
      const dateRangeParam = dateRange ? {
        from: dateRange.from,
        to: dateRange.to || dateRange.from
      } : undefined;
      
      const downloadUrl = await exportMetricsReport(supabase, type, dateRangeParam);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', getExportFilename(type) + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export complete",
        description: `${type} data has been exported successfully.`,
      });
    } catch (error) {
      console.error(`Error exporting ${type} data:`, error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not generate the export file. Please try again.",
      });
      
      if (type === 'monthly') {
        exportAsCSV(filteredMonthlyData, 'monthly');
      } else if (type === 'weekly') {
        exportAsCSV(weeklyData, 'weekly');
      } else {
        exportAsCSV(incidentTypes.map(item => ({ 
          type: item.type, 
          percentage: item.percentage 
        })), 'incidents');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const calculateTrends = () => {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    
    if (!lastMonth || !previousMonth) return {
      availability: { value: 0, trend: 'neutral' as const },
      incidents: { value: 0, trend: 'neutral' as const },
      latency: { value: 0, trend: 'neutral' as const }
    };
    
    const availabilityChange = lastMonth.availability - previousMonth.availability;
    const availabilityTrend = availabilityChange > 0 ? 'up' as const : availabilityChange < 0 ? 'down' as const : 'neutral' as const;
    
    const incidentsChange = previousMonth.incidents - lastMonth.incidents;
    const incidentsTrend = incidentsChange > 0 ? 'up' as const : incidentsChange < 0 ? 'down' as const : 'neutral' as const;
    
    const lastWeek = weeklyData.slice(-7);
    const avgLatencyLastWeek = lastWeek.reduce((sum, item) => sum + item.latency, 0) / lastWeek.length;
    const previousWeek = weeklyData.slice(-14, -7);
    const avgLatencyPreviousWeek = previousWeek.length ? 
      previousWeek.reduce((sum, item) => sum + item.latency, 0) / previousWeek.length : 0;
    
    const latencyChange = avgLatencyPreviousWeek - avgLatencyLastWeek;
    const latencyTrend = latencyChange > 0 ? 'up' as const : latencyChange < 0 ? 'down' as const : 'neutral' as const;
    
    return {
      availability: { 
        value: Math.abs(availabilityChange).toFixed(2), 
        trend: availabilityTrend
      },
      incidents: { 
        value: Math.abs(incidentsChange), 
        trend: incidentsTrend
      },
      latency: { 
        value: Math.abs(latencyChange).toFixed(1), 
        trend: latencyTrend
      }
    };
  };
  
  const trends = calculateTrends();

  return (
    <div className="container py-6 space-y-6 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Analyze network performance metrics and trends.
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Select date range"
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <NetworkMetric
          title="Network Availability"
          value={`${monthlyData[monthlyData.length - 1]?.availability.toFixed(2)}%`}
          trend={trends.availability.trend}
          changeValue={`${trends.availability.value}%`}
          changeText={trends.availability.trend === 'up' ? 'increase' : trends.availability.trend === 'down' ? 'decrease' : 'no change'}
        />
        <NetworkMetric
          title="Monthly Incidents"
          value={monthlyData[monthlyData.length - 1]?.incidents || 0}
          trend={trends.incidents.trend === 'up' ? 'down' : trends.incidents.trend === 'down' ? 'up' : 'neutral'}
          changeValue={trends.incidents.value}
          changeText={trends.incidents.trend === 'up' ? 'fewer' : trends.incidents.trend === 'down' ? 'more' : 'no change'}
        />
        <NetworkMetric
          title="Average Latency"
          value={`${Math.round(weeklyData.reduce((sum, item) => sum + item.latency, 0) / weeklyData.length)}ms`}
          trend={trends.latency.trend === 'up' ? 'down' : trends.latency.trend === 'down' ? 'up' : 'neutral'}
          changeValue={`${trends.latency.value}ms`}
          changeText={trends.latency.trend === 'up' ? 'improvement' : trends.latency.trend === 'down' ? 'slower' : 'no change'}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle>AI Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {insights.map((insight, index) => (
                <Alert key={index} className={`
                  ${insight.type === 'positive' ? 'border-green-200 dark:border-green-800' : ''} 
                  ${insight.type === 'negative' ? 'border-red-200 dark:border-red-800' : ''}
                `}>
                  <div className="flex items-center gap-2">
                    {insight.type === 'positive' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {insight.type === 'negative' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {insight.type === 'neutral' && <Minus className="h-4 w-4 text-yellow-500" />}
                    <AlertTitle>{insight.title}</AlertTitle>
                  </div>
                  <AlertDescription className="mt-2 text-sm">
                    {insight.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="performance" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <LucideLineChart className="h-4 w-4" />
                <span>Performance</span>
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Usage</span>
              </TabsTrigger>
              <TabsTrigger value="incidents" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span>Incidents</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExportData('monthly')}
                disabled={isExporting}
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isExporting ? "Exporting..." : "Export Data"}
                </span>
              </Button>
            </div>
          </div>

          <TabsContent value="performance" className="space-y-4">
            <DashboardCard title="Network Availability (Monthly)">
              <div className="h-[300px] py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredMonthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="availabilityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                    <XAxis dataKey="month" tickLine={false} stroke="currentColor" strokeOpacity={0.3} />
                    <YAxis 
                      domain={[99, 100]} 
                      tickLine={false} 
                      stroke="currentColor" 
                      strokeOpacity={0.3}
                      tickFormatter={(value) => `${value}%`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="availability" 
                      name="Availability"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#availabilityGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>

            <DashboardCard title="Response Time (Weekly)">
              <div className="h-[300px] py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                    <XAxis dataKey="day" tickLine={false} stroke="currentColor" strokeOpacity={0.3} />
                    <YAxis 
                      tickLine={false} 
                      stroke="currentColor" 
                      strokeOpacity={0.3}
                      tickFormatter={(value) => `${value}ms`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="latency" 
                      name="Latency"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ stroke: '#0ea5e9', strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: '#0ea5e9', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <DashboardCard title="Bandwidth Usage (Weekly)">
              <div className="h-[300px] py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                    <XAxis dataKey="day" tickLine={false} stroke="currentColor" strokeOpacity={0.3} />
                    <YAxis 
                      tickLine={false} 
                      stroke="currentColor" 
                      strokeOpacity={0.3}
                      tickFormatter={(value) => `${value}%`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="bandwidth"
                      name="Bandwidth Usage" 
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>

            <div className="grid gap-4 md:grid-cols-2">
              <DashboardCard title="Peak Usage Hours">
                <div className="h-[200px] py-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { hour: "8am", usage: 45 },
                        { hour: "10am", usage: 60 },
                        { hour: "12pm", usage: 80 },
                        { hour: "2pm", usage: 85 },
                        { hour: "4pm", usage: 92 },
                        { hour: "6pm", usage: 75 },
                        { hour: "8pm", usage: 50 },
                      ]}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                      <XAxis dataKey="hour" tickLine={false} stroke="currentColor" strokeOpacity={0.3} />
                      <YAxis
                        tickLine={false}
                        stroke="currentColor"
                        strokeOpacity={0.3}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="usage" 
                        name="Usage"
                        fill="#f97316" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>

              <DashboardCard title="Device Load Distribution">
                <div className="flex items-center justify-center h-[200px] py-4">
                  <div className="w-full max-w-md space-y-4">
                    {[
                      { name: "Main Gateway", load: 85 },
                      { name: "Primary Firewall", load: 62 },
                      { name: "Cloud Server A", load: 78 },
                      { name: "Backup Server", load: 35 },
                    ].map((device) => (
                      <div key={device.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{device.name}</span>
                          <span>{device.load}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${device.load}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <DashboardCard title="Monthly Incidents">
                <div className="h-[300px] py-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredMonthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                      <XAxis dataKey="month" tickLine={false} stroke="currentColor" strokeOpacity={0.3} />
                      <YAxis 
                        tickLine={false} 
                        stroke="currentColor" 
                        strokeOpacity={0.3}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="incidents" 
                        name="Incidents"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>

              <DashboardCard title="Incident Types">
                <div className="py-4">
                  <div className="space-y-4">
                    {incidentTypes.map((type) => (
                      <div key={type.type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{type.type}</span>
                          <span>{type.percentage}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              type.type === "Hardware Failure"
                                ? "bg-yellow-500"
                                : type.type === "Software Issue"
                                ? "bg-red-500"
                                : type.type === "Network Congestion"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                            }`}
                            style={{ width: `${type.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6">
                    <h4 className="font-medium mb-2">Recent Major Incidents</h4>
                    <div className="space-y-2">
                      {[
                        {
                          date: "Nov 15, 2023",
                          description: "Database server outage",
                          duration: "45 minutes",
                        },
                        {
                          date: "Oct 23, 2023",
                          description: "Network router failure",
                          duration: "2 hours",
                        },
                        {
                          date: "Sep 8, 2023",
                          description: "DDoS attack mitigated",
                          duration: "30 minutes",
                        },
                      ].map((incident, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm rounded-md p-2 border">
                          <div className="font-medium">{incident.date}:</div>
                          <div className="flex-1">{incident.description}</div>
                          <div className="text-muted-foreground">{incident.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AnalyticsPage;
