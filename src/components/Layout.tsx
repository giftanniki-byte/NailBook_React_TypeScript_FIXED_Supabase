import type { ReactNode } from "react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import ProfileMenu from "./ProfileMenu";

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  const closeMenu = () => setOpen(false);

  // Don't remember /login or /signup itself as the "return to" page —
  // otherwise signing in would just bounce the user back to the login screen.
  const isAuthPage = /^\/(login|signup)/.test(location.pathname);
  const returnState = isAuthPage ? undefined : { from: location.pathname };

  return (
    <div className="siteShell">
      <header className="navbar">
        <Link className="brand" to="/" onClick={closeMenu}>NailBook</Link>

        <button
          className="menuButton"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open navigation menu"
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={open ? "navLinks open" : "navLinks"}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/artists" onClick={closeMenu}>Find Artist</NavLink>

          {!loading && !user && (
            <NavLink to="/login" state={returnState} onClick={closeMenu}>Sign In</NavLink>
          )}

          {!loading && user && <ProfileMenu />}
        </nav>
      </header>

      {children}

      <footer className="footer">
        <div>
          <strong>NailBook</strong>
          <span>Find talented nail artists and book with confidence.</span>
        </div>
        <div className="footerLinks">
          <Link to="/help">Help & Support</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
