import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";
import { signOut } from "../lib/auth";

export default function ProfileMenu() {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const dashboardPath = profile?.role === "artist" ? "/dashboard/artist" : "/dashboard/client";
  const initial = (profile?.full_name?.trim()?.[0] ?? "U").toUpperCase();

  async function handleSignOut() {
    setOpen(false);
    try {
      await signOut();
    } finally {
      navigate("/");
    }
  }

  return (
    <div className="profileMenu" ref={menuRef}>
      <button
        type="button"
        className="profileButton"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="profileAvatar">{initial}</span>
      </button>

      {open && (
        <div className="profileDropdown" role="menu">
          <Link to={dashboardPath} role="menuitem" onClick={() => setOpen(false)}>
            <LayoutDashboard size={17} /> Dashboard
          </Link>
          <Link to="/settings" role="menuitem" onClick={() => setOpen(false)}>
            <Settings size={17} /> Settings
          </Link>
          <button
            type="button"
            className="darkModeToggle"
            role="menuitemcheckbox"
            aria-checked={theme === "dark"}
            onClick={toggleTheme}
          >
            <span className="darkModeLabel">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              Dark Mode
            </span>
            <span className={`switch ${theme === "dark" ? "on" : ""}`} />
          </button>
          <button type="button" className="signOutItem" role="menuitem" onClick={handleSignOut}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
