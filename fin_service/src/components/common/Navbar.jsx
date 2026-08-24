import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

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

  const linkClass = (path) =>
    `${
      isActive(path)
        ? "border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold"
        : "border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`;

  const mobileLinkClass = (path) =>
    `${
      isActive(path)
        ? "bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold"
        : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`;

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>FinSage</span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white inline-block"></span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={linkClass("/")}>
                Home
              </Link>

              {currentUser && (
                <>
                  <Link to="/dashboard" className={linkClass("/dashboard")}>
                    Dashboard
                  </Link>
                  <Link to="/analytics" className={linkClass("/analytics")}>
                    Analytics
                  </Link>
                  <Link to="/scenarios" className={linkClass("/scenarios")}>
                    What-If Scenarios
                  </Link>
                  <Link to="/finance-input" className={linkClass("/finance-input")}>
                    Update Finances
                  </Link>
                  <Link to="/advisor" className={linkClass("/advisor")}>
                    AI Advisor
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isGuestMode && (
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <span>Claim Plan</span>
              </Link>
            )}

            {currentUser ? (
              <div className="ml-3 relative" ref={profileRef}>
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="bg-white dark:bg-slate-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                    id="user-menu"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition-all">
                      <span className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">
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
                </div>
                {isProfileOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-52 rounded-xl shadow-lg py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="block px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Signed in as
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {currentUser.email}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      to="/finance-input"
                      className="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Finances
                    </Link>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2.5">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3.5 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xs transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center space-x-2 sm:hidden">
            <ThemeToggle />
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu icon */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={mobileLinkClass("/")}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>

          {currentUser && (
            <>
              <Link
                to="/dashboard"
                className={mobileLinkClass("/dashboard")}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className={mobileLinkClass("/analytics")}
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link
                to="/scenarios"
                className={mobileLinkClass("/scenarios")}
                onClick={() => setIsMenuOpen(false)}
              >
                What-If Scenarios
              </Link>
              <Link
                to="/finance-input"
                className={mobileLinkClass("/finance-input")}
                onClick={() => setIsMenuOpen(false)}
              >
                Update Finances
              </Link>
              <Link
                to="/advisor"
                className={mobileLinkClass("/advisor")}
                onClick={() => setIsMenuOpen(false)}
              >
                AI Advisor
              </Link>
              <Link
                to="/profile"
                className={mobileLinkClass("/profile")}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile Settings
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu account section */}
        {currentUser ? (
          <div className="pt-4 pb-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-200">
                    {currentUser.email &&
                      currentUser.email.charAt(0).toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {currentUser.displayName || "User"}
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  {currentUser.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col space-y-2 px-4">
              <Link
                to="/login"
                className="block text-center w-full py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="block text-center w-full py-2 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xs"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Display error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
