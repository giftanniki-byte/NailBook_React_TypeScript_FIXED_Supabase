import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../types";
import { supabase } from "./supabase";
import { getProfile } from "./auth";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Keeping session state in one context (instead of every page/route fetching
// it independently) is what lets a signed-in user move around the app
// without flicker or being asked to sign in again on every page.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    try {
      const found = await getProfile(userId);
      setProfile(found);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        loadProfile(sessionUser.id).finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Supabase persists the session in localStorage on its own (this was
    // already configured in lib/supabase.ts). This listener is what keeps
    // the rest of the app in sync the moment sign-in/sign-out happens, and
    // also picks the session back up automatically on a page refresh.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        loadProfile(sessionUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
