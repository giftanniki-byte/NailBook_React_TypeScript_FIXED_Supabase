import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, Sparkles, Users, Wallet } from "lucide-react";
import { getTodayMetrics } from "../lib/artistDashboard";
import { playBookingAlert } from "../lib/notifySound";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

const TABS = [
  { to: "/dashboard/artist", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/artist/bookings", label: "Bookings", icon: CalendarCheck, end: false },
  { to: "/dashboard/artist/services", label: "Services", icon: Sparkles, end: false },
  { to: "/dashboard/artist/clients", label: "Clients", icon: Users, end: false },
  { to: "/dashboard/artist/earnings", label: "Earnings", icon: Wallet, end: false },
];

export default function ArtistShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pending, setPending] = useState(0);
  const [justAlerted, setJustAlerted] = useState(false);

  function refreshPending() {
    getTodayMetrics()
      .then((metrics) => {
        if (metrics) setPending(metrics.pending_requests);
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    refreshPending();
  }, []);

  // Live alert for new booking requests — plays a chime and pulses the
  // Bookings badge the instant a client books, without needing a refresh.
  // Requires "bookings" to be added to the supabase_realtime publication
  // (see nailbook-artist-v5.sql) — otherwise this subscribes but never
  // receives anything.
  useEffect(() => {
    if (!supabase || !user) return;
    const client = supabase;

    const channel = client
      .channel(`artist-new-bookings-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings", filter: `artist_id=eq.${user.id}` },
        () => {
          playBookingAlert();
          refreshPending();
          setJustAlerted(true);
          setTimeout(() => setJustAlerted(false), 2000);
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="artistShell">
      <div className="artistTabBar">
        <nav className="artistTabs">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "artistTab active" : "artistTab")}>
              <Icon size={17} />
              <span>{label}</span>
              {label === "Bookings" && pending > 0 && (
                <span className={justAlerted ? "artistTabBadge pulse" : "artistTabBadge"}>{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
}
