import type { Session, User } from "@supabase/supabase-js";
import type { Profile, Role } from "../types";
import { supabase } from "./supabase";

function clientOrThrow() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.");
  }
  return supabase;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await clientOrThrow().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await clientOrThrow().auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await clientOrThrow()
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function provisionProfile(input: {
  role?: Role | null;
  fullName?: string;
  phone?: string;
  city?: string;
  location?: string;
  businessName?: string;
  services?: string[];
}) {
  const { data, error } = await clientOrThrow().rpc("ensure_nailbook_profile", {
    p_role: input.role ?? null,
    p_full_name: input.fullName ?? null,
    p_phone: input.phone ?? null,
    p_city: input.city ?? null,
    p_location: input.location ?? null,
    p_business_name: input.businessName ?? null,
    p_services: input.services ?? null,
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string, expectedRole: Role) {
  const client = clientOrThrow();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw new Error(error.message);

  const profile = await getProfile(data.user.id);
  if (!profile || profile.role !== expectedRole) {
    await client.auth.signOut();
    throw new Error(`This account is not registered as a ${expectedRole}.`);
  }

  return { user: data.user, session: data.session, profile };
}

export async function signUp(input: {
  role: Role;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  city?: string;
  location?: string;
  businessName?: string;
  services?: string[];
}) {
  const client = clientOrThrow();
  const redirectPath = input.role === "artist" ? "/dashboard/artist" : "/dashboard/client";
  const emailRedirectTo = window.location.origin + redirectPath;

  const { data, error } = await client.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        role: input.role,
        full_name: input.fullName,
        phone: input.phone ?? "",
        city: input.city ?? "",
        location: input.location ?? "",
        business_name: input.businessName ?? input.fullName,
        services: input.services ?? [],
      },
      emailRedirectTo,
    },
  });

  if (error) throw new Error(error.message);

  if (data.session && data.user) {
    await provisionProfile({
      role: input.role,
      fullName: input.fullName,
      phone: input.phone,
      city: input.city,
      location: input.location,
      businessName: input.businessName ?? input.fullName,
      services: input.services,
    });
  }

  return data;
}

export async function signOut() {
  await clientOrThrow().auth.signOut();
}
