import { useState, useEffect, useRef } from "react";
import { Home, Users, Activity, FileText, Stethoscope } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If scrolling down, hide; if scrolling up, show
      // Add a small threshold to avoid flicker
      if (currentScrollY > lastScrollY.current + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 10) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/community", icon: Home, label: "Home" },
    { path: "/trackers", icon: Activity, label: "Trackers" },
    { path: "/articles", icon: FileText, label: "Articles" },
    { path: "/consult", icon: Stethoscope, label: "Consults" },
    { path: "/profile", icon: Users, label: "Profile" },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg transition-transform duration-300 ease-in-out",
        !isVisible && "translate-y-full"
      )}
    >
      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === "/community" && location.pathname === "/");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className={cn("h-6 w-6 mb-1", isActive && "scale-110")} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

