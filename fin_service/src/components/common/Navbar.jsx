import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const { currentUser, logout } = useAuth();
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
        ? "border-blue-500 text-gray-900 dark:text-white font-semibold"
        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`;

  const mobileLinkClass = (path) =>
    `${
      isActive(path)
        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400 font-semibold"
        : "border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>FinSage</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-normal">AI</span>
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

            {currentUser ? (
              <div className="ml-3 relative" ref={profileRef}>
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="bg-white dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                    id="user-menu"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/60 ring-2 ring-transparent hover:ring-blue-400 transition-all">
                      <span className="text-sm font-medium leading-none text-blue-700 dark:text-blue-300">
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
                    className="origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="block px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      Signed in as
                      <div className="font-bold text-gray-800 dark:text-gray-200 truncate mt-0.5">
                        {currentUser.email}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      to="/finance-input"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Finances
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
      <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900`}>
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
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/60">
                  <span className="text-sm font-medium leading-none text-blue-700 dark:text-blue-300">
                    {currentUser.email &&
                      currentUser.email.charAt(0).toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                  {currentUser.displayName || "User"}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
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
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-2 px-4">
              <Link
                to="/login"
                className="block text-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="block text-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
