import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useArtistOnlineStatus } from "../lib/useArtistOnlineStatus";
import ProfileMenu from "./ProfileMenu";
import SplashScreen from "./SplashScreen";

// The real auth check usually resolves almost instantly, which makes the
// splash feel like a flicker rather than an intentional brand moment.
// Holding it for at least this long (even once auth is ready) gives it a
// deliberate, paced feel instead.
const MIN_SPLASH_MS = 1200;

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, profile, loading } = useAuth();
  const isArtist = profile?.role === "artist";
  const { online, busy, error: statusError, toggle } = useArtistOnlineStatus(isArtist);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  const closeMenu = () => setOpen(false);

  // Don't remember /login or /signup itself as the "return to" page —
  // otherwise signing in would just bounce the user back to the login screen.
  const isAuthPage = /^\/(login|signup)/.test(location.pathname);
  const returnState = isAuthPage ? undefined : { from: location.pathname };
  const dashboardPath = isArtist ? "/dashboard/artist" : "/dashboard/client";

  // Showcase the brand for a deliberate moment while the session is
  // checked — held for a minimum duration so it reads as intentional
  // rather than a flicker, but never adds real, uncapped delay.
  if (loading || !minTimeElapsed) return <SplashScreen />;

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
          {/* Artists book clients, not the other way around — "Find Artist"
              is a client-only action and doesn't belong on the artist side. */}
          {profile?.role !== "artist" && (
            <NavLink to="/artists" onClick={closeMenu}>Find Artist</NavLink>
          )}

          {/* Dashboard is a primary destination, not a menu item to hunt
              for — every signed-in user sees it right here in the nav. */}
          {!loading && user && (
            <NavLink to={dashboardPath} onClick={closeMenu}>Dashboard</NavLink>
          )}

          {!loading && !user && (
            <NavLink to="/login" state={returnState} onClick={closeMenu}>Sign In</NavLink>
          )}

          {!loading && user && isArtist && (
            <button
              type="button"
              className={online ? "artistStatusPill online navStatusPill" : "artistStatusPill navStatusPill"}
              onClick={toggle}
              disabled={online === null || busy}
              title={statusError ?? undefined}
            >
              <span className="artistStatusDot" />
              {statusError ? "Status unavailable" : online === null ? "…" : online ? "Online" : "Offline"}
            </button>
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
