import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ showDropdown = false, className = "" }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!showDropdown) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer ${className}`}
        aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
        title={`Current: ${theme} (Resolved: ${resolvedTheme}). Click to toggle.`}
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-4.5 w-4.5 text-foreground transition-transform duration-200 hover:rotate-45" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-foreground transition-transform duration-200 hover:-rotate-12" />
        )}
      </button>
    );
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-border/80 bg-card text-foreground hover:bg-muted shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer text-xs font-medium"
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-3.5 w-3.5 text-foreground mr-1.5" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-foreground mr-1.5" />
        )}
        <span className="capitalize">{theme}</span>
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-36 rounded-2xl shadow-card py-1.5 bg-card border border-border/80 ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="h-3 w-3 text-foreground" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
