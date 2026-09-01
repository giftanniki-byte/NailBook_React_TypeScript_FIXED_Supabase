import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import type { Role } from "../types";

// role is optional: routes like /settings just require any signed-in user,
// while /dashboard/client and /dashboard/artist require a matching role.
export default function ProtectedRoute({ role, children }: { role?: Role; children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loadingPage">Checking your account…</div>;

  if (!user) {
    const target = role === "artist" ? "/login/artist" : role === "client" ? "/login/client" : "/login";
    // Remember where the user was headed so they land back here right after
    // they sign in, instead of always being sent to a dashboard.
    return <Navigate to={target} state={{ from: location.pathname }} replace />;
  }

  if (role && profile?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
