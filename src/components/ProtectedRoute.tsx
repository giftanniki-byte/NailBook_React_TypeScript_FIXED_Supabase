import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser, getProfile } from "../lib/auth";
import type { Profile, Role } from "../types";

export default function ProtectedRoute({ role, children }: { role: Role; children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          if (active) setState("denied");
          return;
        }

        const found = await getProfile(user.id);
        if (active) {
          setProfile(found);
          setState(found?.role === role ? "allowed" : "denied");
        }
      } catch {
        if (active) setState("denied");
      }
    }

    check();
    return () => { active = false; };
  }, [role]);

  if (state === "loading") return <div className="loadingPage">Checking your account…</div>;
  if (state === "denied") return <Navigate to={role === "artist" ? "/login/artist" : "/login/client"} replace />;

  return <>{children}</>;
}

export function useProtectedProfile() {
  return profilePlaceholder;
}

const profilePlaceholder: Profile | null = null;
