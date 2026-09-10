import { supabase } from "./supabase";

export type PlatformStats = {
  artistCount: number;
  completedBookingCount: number;
  cityCount: number;
};

export async function getPlatformStats(): Promise<PlatformStats | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.from("v_platform_stats").select("*").maybeSingle();
  if (error || !data) return null;

  return {
    artistCount: data.artist_count ?? 0,
    completedBookingCount: data.completed_booking_count ?? 0,
    cityCount: data.city_count ?? 0,
  };
}
