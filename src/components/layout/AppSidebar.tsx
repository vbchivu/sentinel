
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  BarChart4,
  Home,
  Power,
  Server,
  Settings,
  Upload,
  Wifi,
  CloudLightning,
  Bell,
  Brain,
  Plus,
  Shield
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, mockMode } = useAuth();
  const [open, setOpen] = useState(!isMobile);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [location.pathname, isMobile]);

  // Navigation items - all features available with mock data
  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Analytics",
      icon: BarChart4,
      href: "/analytics",
    },
    {
      title: "Network Status",
      icon: Wifi,
      href: "/network-status",
    },
    {
      title: "View Alerts",
      icon: Bell,
      href: "/alerts",
    },
    {
      title: "Predict Downtime",
      icon: CloudLightning,
      href: "/predict",
    },
  ];

  // Admin items - available to authenticated or mock users
  const adminItems = [
    {
      title: "Devices",
      icon: Server,
      href: "/devices",
    },
    {
      title: "Add Device",
      icon: Plus,
      href: "/add-device",
    },
    {
      title: "Upload Data",
      icon: Upload,
      href: "/upload",
    },
    {
      title: "Train Model",
      icon: Brain,
      href: "/train",
    },
  ];

  // Utility items
  const utilityItems = [
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  // Check if user should see admin section
  const showAdminSection = user !== null || mockMode;

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 px-2">
          <Power className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">Sentinel</span>
          {mockMode && (
            <Badge variant="outline" className="ml-2 text-xs text-yellow-500 border-yellow-500">
              DEMO
            </Badge>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-4 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link to={item.href}>
                    <SidebarMenuButton
                      className={cn(
                        location.pathname === item.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "transparent"
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdminSection && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link to={item.href}>
                      <SidebarMenuButton
                        className={cn(
                          location.pathname === item.href
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "transparent"
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link to={item.href}>
                    <SidebarMenuButton
                      className={cn(
                        location.pathname === item.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "transparent"
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
