
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserNav } from "@/components/layout/UserNav";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 w-full items-center border-b bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserNav />
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link to="/register">Sign up</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
