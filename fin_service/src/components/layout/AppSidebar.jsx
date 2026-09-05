import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";
import {
  LayoutDashboard,
  BarChart3,
  GitFork,
  Wallet,
  Sparkles,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Scenarios", path: "/scenarios", icon: GitFork },
  { name: "Finances", path: "/finance-input", icon: Wallet },
  { name: "AI Advisor", path: "/advisor", icon: Sparkles },
  { name: "Profile", path: "/profile", icon: User },
];

export default function AppSidebar({ mobileOpen = false, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isGuestMode, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5">
      {/* Top Brand & Links */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-foreground text-background font-black text-sm shadow-2xs group-hover:scale-105 transition-transform">
              F
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1">
                FinSage AI
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Strategic Ledger</span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-full hover:bg-muted text-muted-foreground"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-foreground text-background shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="space-y-3 pt-4 border-t border-border/60">
        {isGuestMode && (
          <div className="px-3 py-2.5 rounded-2xl bg-muted/60 border border-border/80 text-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sandbox Guest Mode</span>
            </div>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Data is saved in local storage. Claim your account to sync across devices.
            </p>
            <Link
              to="/register"
              onClick={onCloseMobile}
              className="inline-block font-semibold text-foreground underline underline-offset-2"
            >
              Claim account →
            </Link>
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground border border-border/80 shrink-0">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-foreground truncate">
                {currentUser?.displayName || currentUser?.email?.split("@")[0] || "Explorer"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {currentUser?.email || "guest@finsage.ai"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Theme toggle bar */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-2xs text-muted-foreground font-medium">Appearance</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card/90 dark:bg-card/90 backdrop-blur-xl border-r border-border/80 sticky top-0 h-screen z-30 shrink-0 transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-full bg-card shadow-2xl h-full flex flex-col z-50 border-r border-border">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
