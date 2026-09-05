import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, UserPlus, LogOut, Settings, Wallet, ArrowRight } from "lucide-react";

function Navbar() {
  const { currentUser, isGuestMode, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [error, setError] = useState("");
  const profileRef = useRef(null);

  // Handle click outside to close profile dropdown
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

  // Handle logout
  const handleLogout = async () => {
    setError("");
    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navPillClass = (path) =>
    `rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
      isActive(path)
        ? "bg-foreground text-background font-semibold shadow-2xs"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
    }`;

  const mobileNavClass = (path) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-foreground text-background font-semibold"
        : "text-foreground hover:bg-muted"
    }`;

  return (
    <header className="sticky top-3 z-50 w-full px-3 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-card/85 dark:bg-card/85 backdrop-blur-xl border border-border/80 shadow-card rounded-full px-4 sm:px-5 py-2 flex items-center justify-between transition-all">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-foreground font-bold tracking-tight text-sm sm:text-base group"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background font-black text-xs group-hover:scale-105 transition-transform">
                F
              </span>
              <span className="tracking-tight">FinSage</span>
              <span className="relative flex h-1.5 w-1.5 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className={navPillClass("/")}>
              Overview
            </Link>
            <Link to="/scenarios" className={navPillClass("/scenarios")}>
              Scenarios
            </Link>
            <Link to="/advisor" className={navPillClass("/advisor")}>
              AI Copilot
            </Link>
            {currentUser && (
              <>
                <Link to="/dashboard" className={navPillClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link to="/analytics" className={navPillClass("/analytics")}>
                  Analytics
                </Link>
              </>
            )}
            <Link to="/contact" className={navPillClass("/contact")}>
              Contact
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {isGuestMode && (
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-muted/60 hover:bg-muted text-foreground transition"
              >
                <UserPlus className="w-3 h-3" />
                <span>Claim Plan</span>
              </Link>
            )}

            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  id="user-menu"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted border border-border/80 hover:border-foreground/40 transition-all">
                    <span className="text-xs font-bold leading-none text-foreground">
                      {currentUser.email &&
                        (() => {
                          const username = currentUser.email.split("@")[0];
                          return (
                            username.charAt(0).toUpperCase() +
                            username.charAt(username.length - 1)
                          );
                        })()}
                    </span>
                  </span>
                </button>

                {isProfileOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2.5 w-56 rounded-2xl shadow-card p-1.5 bg-card border border-border/80 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="px-3 py-2 text-xs border-b border-border/60 mb-1">
                      <span className="text-muted-foreground block text-2xs">Signed in as</span>
                      <div className="font-semibold text-foreground truncate mt-0.5">
                        {currentUser.email}
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                      Profile Settings
                    </Link>

                    <div className="border-t border-border/60 my-1"></div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition cursor-pointer"
                      role="menuitem"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/login"
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs inline-flex items-center gap-1.5 group transition-all"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Start Free Trial</span>
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none cursor-pointer"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-card p-3 space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <Link
              to="/"
              className={mobileNavClass("/")}
              onClick={() => setIsMenuOpen(false)}
            >
              Overview
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
            <Link
              to="/scenarios"
              className={mobileNavClass("/scenarios")}
              onClick={() => setIsMenuOpen(false)}
            >
              What-If Scenarios
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
            <Link
              to="/advisor"
              className={mobileNavClass("/advisor")}
              onClick={() => setIsMenuOpen(false)}
            >
              AI Copilot
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>

            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className={mobileNavClass("/dashboard")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  to="/analytics"
                  className={mobileNavClass("/analytics")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Analytics
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  to="/finance-input"
                  className={mobileNavClass("/finance-input")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Update Finances
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  to="/profile"
                  className={mobileNavClass("/profile")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Settings
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>

                <div className="border-t border-border/60 pt-2 mt-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition"
                  >
                    <span>Sign out</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 mt-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2 px-3 rounded-full text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2 px-3 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-2xs"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Start Free
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-2 text-center text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-full py-1.5 px-4">
            {error}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
