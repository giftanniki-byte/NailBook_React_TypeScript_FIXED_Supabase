import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, Sparkles, Users, Wallet } from "lucide-react";
import { getTodayMetrics, setOnlineStatus } from "../lib/artistDashboard";

const TABS = [
  { to: "/dashboard/artist", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/artist/bookings", label: "Bookings", icon: CalendarCheck, end: false },
  { to: "/dashboard/artist/services", label: "Services", icon: Sparkles, end: false },
  { to: "/dashboard/artist/clients", label: "Clients", icon: Users, end: false },
  { to: "/dashboard/artist/earnings", label: "Earnings", icon: Wallet, end: false },
];

export default function ArtistShell({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null);
  const [pending, setPending] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getTodayMetrics()
      .then((metrics) => {
        if (!active || !metrics) return;
        setOnline(metrics.is_available);
        setPending(metrics.pending_requests);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function toggleOnline() {
    if (online === null || busy) return;
    const next = !online;
    setBusy(true);
    setOnline(next); // optimistic
    try {
      await setOnlineStatus(next);
    } catch {
      setOnline(!next); // revert on failure
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="artistShell">
      <div className="artistTabBar">
        <nav className="artistTabs">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "artistTab active" : "artistTab")}>
              <Icon size={17} />
              <span>{label}</span>
              {label === "Bookings" && pending > 0 && <span className="artistTabBadge">{pending}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={online ? "artistStatusPill online" : "artistStatusPill"}
          onClick={toggleOnline}
          disabled={online === null || busy}
        >
          <span className="artistStatusDot" />
          {online === null ? "…" : online ? "Online" : "Offline"}
        </button>
      </div>

      {children}
    </div>
  );
}
