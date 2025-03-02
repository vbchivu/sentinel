
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function UserNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userCountry, setUserCountry] = useState<string>("");
  
  // Load user country from localStorage
  useEffect(() => {
    const savedCountry = localStorage.getItem("userCountry");
    if (savedCountry) {
      setUserCountry(savedCountry);
    }
    
    // Listen for country changes
    const handleCountryChange = (event: CustomEvent<string>) => {
      setUserCountry(event.detail);
    };

    window.addEventListener('userCountryChanged', handleCountryChange as EventListener);
    
    return () => {
      window.removeEventListener('userCountryChanged', handleCountryChange as EventListener);
    };
  }, []);
  
  if (!user) return null;
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  // Get country display name
  const getCountryName = () => {
    if (!userCountry) return "No country set";
    
    // Convert country ID to display name
    const countryMap: Record<string, string> = {
      "kenya": "Kenya",
      "brazil": "Brazil",
      "india": "India",
      "spain": "Spain",
      "nigeria": "Nigeria",
      "indonesia": "Indonesia"
    };
    
    return countryMap[userCountry] || userCountry;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar-placeholder.png" alt={user.email || "User"} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {userCountry && (
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {getCountryName()}
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            Profile & Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
