import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";
import { Search, Plus, Menu, User, Settings, LogOut } from "lucide-react";

export default function AppHeader({ onOpenMobileMenu }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    if (query.includes("analytic") || query.includes("chart")) {
      navigate("/analytics");
    } else if (query.includes("scenario") || query.includes("tax") || query.includes("fire")) {
      navigate("/scenarios");
    } else if (query.includes("input") || query.includes("add") || query.includes("expense") || query.includes("salary")) {
      navigate("/finance-input");
    } else if (query.includes("ai") || query.includes("advisor") || query.includes("copilot")) {
      navigate("/advisor");
    } else if (query.includes("profile") || query.includes("setting")) {
      navigate("/profile");
    } else {
      navigate("/dashboard");
    }
    setSearchQuery("");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        
        {/* Left: Mobile Menu Trigger + Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-2xl bg-card border border-border/80 text-foreground hover:bg-muted"
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Pill Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full h-10 pl-10 pr-12 rounded-full bg-card border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all shadow-2xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted rounded-md border border-border">
                ↵
              </kbd>
            </div>
          </form>
        </div>

        {/* Right: Actions + ThemeToggle + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Action Pill Button */}
          <Link
            to="/finance-input"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Create / Add</span>
            <span className="sm:hidden">Add</span>
          </Link>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-ring transition cursor-pointer"
              aria-expanded={isProfileOpen}
            >
              <div className="h-8 w-8 rounded-full bg-muted border border-border/80 flex items-center justify-center font-bold text-xs text-foreground shadow-2xs">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border/80 shadow-card p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 text-xs border-b border-border/60 mb-1">
                  <span className="text-muted-foreground block text-2xs">Signed in as</span>
                  <div className="font-semibold text-foreground truncate mt-0.5">
                    {currentUser?.email || "Guest"}
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Profile Details
                </Link>

                <Link
                  to="/finance-input"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition"
                >
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  Financial Records
                </Link>

                <div className="border-t border-border/60 my-1"></div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
