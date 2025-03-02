import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAlerts, getAlertStats, updateAlertStatus } from "@/services/api/alertService";
import { Alert } from "@/services/api/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle2, Clock, AlertTriangle, Filter, MapPin, Globe, Bell, Radio } from "lucide-react";
import { CreateAlertForm } from "@/components/alerts/CreateAlertForm";
import { Separator } from "@/components/ui/separator";

const PAGE_SIZE = 5;

const ViewAlerts = () => {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    acknowledged: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [notes, setNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [alertType, setAlertType] = useState<string>("system");
  
  const CITIES_BY_COUNTRY: Record<string, string[]> = {
    "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza"],
    "UnitedStates": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
    "UnitedKingdom": ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool"],
  };

  useEffect(() => {
    const savedCountry = localStorage.getItem("userCountry");
    if (savedCountry) {
      setUserCountry(savedCountry);
      
      if (CITIES_BY_COUNTRY[savedCountry]) {
        setCities(CITIES_BY_COUNTRY[savedCountry]);
      }
    }
    
    const handleCountryChange = (event: CustomEvent<string>) => {
      setUserCountry(event.detail);
      
      setCityFilter(null);
      
      if (CITIES_BY_COUNTRY[event.detail]) {
        setCities(CITIES_BY_COUNTRY[event.detail]);
      }
    };

    window.addEventListener('userCountryChanged', handleCountryChange as EventListener);
    
    return () => {
      window.removeEventListener('userCountryChanged', handleCountryChange as EventListener);
    };
  }, []);

  const loadData = async () => {
    if (!supabase) return;
    
    try {
      setLoading(true);
      
      const status = currentTab !== "all" ? currentTab as "pending" | "acknowledged" | "resolved" : undefined;
      const isSystem = alertType === "system" ? true : alertType === "personal" ? false : undefined;
      
      const { alerts, total } = await fetchAlerts(supabase, {
        status,
        severity: severityFilter as any || undefined,
        limit: PAGE_SIZE,
        offset: (currentPage - 1) * PAGE_SIZE,
        country: userCountry || undefined,
        city: cityFilter || undefined,
        isSystem
      });
      
      const alertStats = await getAlertStats(supabase, {
        country: userCountry || undefined,
        city: cityFilter || undefined,
        isSystem
      });
      
      setAlerts(alerts);
      setFilteredAlerts(alerts);
      setStats(alertStats);
      setTotalAlerts(total);
    } catch (error) {
      console.error("Error loading alerts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load alerts. Using offline data.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    loadData();
  }, [currentTab, severityFilter, userCountry, cityFilter, alertType]);
  
  useEffect(() => {
    loadData();
  }, [currentPage]);
  
  const handleUpdateStatus = async (alertId: string, status: "pending" | "acknowledged" | "resolved") => {
    if (!supabase) return;
    
    try {
      await updateAlertStatus(supabase, alertId, status, notes);
      toast({
        title: "Alert updated",
        description: `Alert has been marked as ${status}.`,
      });
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error updating alert:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update alert. Please try again.",
      });
    }
  };
  
  const openStatusDialog = (alert: Alert) => {
    setSelectedAlert(alert);
    setNotes("");
    setIsDialogOpen(true);
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="border-green-500 text-green-700">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-red-500 text-red-700 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Pending</Badge>;
      case "acknowledged":
        return <Badge variant="outline" className="border-blue-500 text-blue-700 flex items-center gap-1"><Clock className="h-3 w-3" /> Acknowledged</Badge>;
      case "resolved":
        return <Badge variant="outline" className="border-green-500 text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const totalPages = Math.ceil(totalAlerts / PAGE_SIZE);
  
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Alerts</h1>
        <p className="page-description">Monitor and manage network alerts.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.acknowledged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>
            View and manage all network alerts.
            {userCountry && (
              <div className="flex items-center mt-1 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                Showing alerts for {userCountry}
                {cityFilter && <span> - {cityFilter}</span>}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <Tabs defaultValue="system" value={alertType} onValueChange={setAlertType} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  <Globe className="h-4 w-4 mr-2" />
                  All Alerts
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Radio className="h-4 w-4 mr-2" />
                  Network Alerts
                </TabsTrigger>
                <TabsTrigger value="personal">
                  <Bell className="h-4 w-4 mr-2" />
                  My Alerts
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  <span className="text-sm mr-2">Filters:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={severityFilter || "all"} onValueChange={(value) => setSeverityFilter(value === "all" ? null : value)}>
                    <SelectTrigger className="w-[150px]">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {userCountry && cities.length > 0 && (
                    <Select value={cityFilter || "all"} onValueChange={(value) => setCityFilter(value === "all" ? null : value)}>
                      <SelectTrigger className="w-[150px]">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </Tabs>
          </div>
          
          <Separator className="mb-4" />
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No alerts found</p>
              <p className="text-sm text-muted-foreground max-w-md">
                {userCountry ? 
                  `No alerts found for ${userCountry}${cityFilter ? ` - ${cityFilter}` : ''}. Try changing your filters or create a new alert.` :
                  "No alerts match your current filters. Try adjusting your filters or create a new alert."
                }
              </p>
              {alertType === "personal" && (
                <Button variant="outline" className="mt-4" onClick={() => document.querySelector<HTMLButtonElement>('[data-create-alert]')?.click()}>
                  <Bell className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="overflow-hidden">
                  <div className={`h-1 w-full ${
                    alert.severity === "critical" ? "bg-red-500" :
                    alert.severity === "high" ? "bg-orange-500" :
                    alert.severity === "medium" ? "bg-yellow-500" :
                    "bg-green-500"
                  }`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{alert.title}</CardTitle>
                          {!alert.isSystem && (
                            <Badge variant="outline" className="bg-blue-50">
                              <Bell className="h-3 w-3 mr-1" /> Personal
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {alert.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getSeverityBadge(alert.severity)}
                        {getStatusBadge(alert.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Source:</span> {alert.sourceDevice}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {new Date(alert.createdAt).toLocaleString()}
                      </div>
                      
                      {alert.resolvedAt && (
                        <div>
                          <span className="font-medium">Resolved:</span> {new Date(alert.resolvedAt).toLocaleString()}
                        </div>
                      )}
                      
                      {alert.notes && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Notes:</span> {alert.notes}
                        </div>
                      )}
                      
                      {(alert.country || alert.city) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {alert.city ? `${alert.city}, ` : ''}{alert.country}
                        </div>
                      )}
                      
                      {alert.threshold !== undefined && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                          Threshold: {alert.threshold}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    {alert.status !== "resolved" && (
                      <Button 
                        variant="outline" 
                        onClick={() => openStatusDialog(alert)}
                      >
                        {alert.status === "pending" ? "Acknowledge" : "Resolve"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAlert?.status === "pending" ? "Acknowledge Alert" : "Resolve Alert"}
            </DialogTitle>
            <DialogDescription>
              {selectedAlert?.status === "pending" 
                ? "Mark this alert as acknowledged to indicate you're working on it."
                : "Mark this alert as resolved if the issue has been fixed."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the alert status..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedAlert) {
                  handleUpdateStatus(
                    selectedAlert.id, 
                    selectedAlert.status === "pending" ? "acknowledged" : "resolved"
                  );
                }
              }}
            >
              {selectedAlert?.status === "pending" ? "Acknowledge" : "Resolve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewAlerts;
