
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
