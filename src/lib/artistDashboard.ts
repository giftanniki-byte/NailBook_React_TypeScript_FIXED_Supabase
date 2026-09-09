import { supabase } from "./supabase";
import type {
  ArtistBooking,
  ArtistClientRow,
  ArtistProfileRow,
  ArtistServiceRow,
  ArtistTodayMetrics,
  BookingStatus,
} from "../types";

function clientOrThrow() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

// ---- Dashboard metrics ----

export async function getTodayMetrics(): Promise<ArtistTodayMetrics | null> {
  const { data, error } = await clientOrThrow()
    .from("v_artist_today")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as ArtistTodayMetrics | null;
}

export async function setOnlineStatus(isAvailable: boolean) {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  const { error } = await client
    .from("artist_profiles")
    .update({ is_available: isAvailable })
    .eq("user_id", userId);
  if (error) throw error;
}

// ---- Bookings ----

export async function getUpNextBooking(): Promise<ArtistBooking | null> {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await client
    .from("v_my_bookings")
    .select("*")
    .eq("artist_id", userId)
    .in("status", ["pending", "confirmed"])
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(1);

  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;

  return {
    booking_id: row.booking_id,
    client_id: row.client_id,
    artist_id: row.artist_id,
    service_id: row.service_id,
    booking_date: row.booking_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    price: row.price,
    client_notes: row.client_notes,
    artist_notes: row.artist_notes,
    client_name: row.client_name,
    client_email: row.client_email,
    service_name: row.service_name,
  };
}

export async function listBookings(statusFilter?: BookingStatus | "all"): Promise<ArtistBooking[]> {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];

  let query = client
    .from("v_my_bookings")
    .select("*")
    .eq("artist_id", userId)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    booking_id: row.booking_id,
    client_id: row.client_id,
    artist_id: row.artist_id,
    service_id: row.service_id,
    booking_date: row.booking_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    price: row.price,
    client_notes: row.client_notes,
    artist_notes: row.artist_notes,
    client_name: row.client_name,
    client_email: row.client_email,
    service_name: row.service_name,
  }));
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const { error } = await clientOrThrow()
    .from("bookings")
    .update({ status })
    .eq("booking_id", bookingId);
  if (error) throw error;
}

// ---- Services ----

export async function listArtistServices(): Promise<ArtistServiceRow[]> {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];

  const [{ data: allServices, error: servicesError }, { data: offered, error: offeredError }] = await Promise.all([
    client.from("services").select("service_id, service_name, default_duration_minutes").order("service_name"),
    client.from("artist_services").select("service_id, price, duration_minutes, is_available").eq("artist_id", userId),
  ]);

  if (servicesError) throw servicesError;
  if (offeredError) throw offeredError;

  const offeredMap = new Map((offered ?? []).map((row) => [row.service_id, row]));

  return (allServices ?? []).map((service) => {
    const match = offeredMap.get(service.service_id);
    return {
      service_id: service.service_id,
      service_name: service.service_name,
      default_duration_minutes: service.default_duration_minutes,
      price: match?.price ?? null,
      duration_minutes: match?.duration_minutes ?? null,
      is_available: match?.is_available ?? false,
      offered: Boolean(match),
    };
  });
}

export async function upsertArtistService(input: {
  serviceId: number;
  price: number;
  durationMinutes: number | null;
  isAvailable: boolean;
}) {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  const { error } = await client.from("artist_services").upsert(
    {
      artist_id: userId,
      service_id: input.serviceId,
      price: input.price,
      duration_minutes: input.durationMinutes,
      is_available: input.isAvailable,
    },
    { onConflict: "artist_id,service_id" },
  );
  if (error) throw error;
}

export async function removeArtistService(serviceId: number) {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  const { error } = await client
    .from("artist_services")
    .delete()
    .eq("artist_id", userId)
    .eq("service_id", serviceId);
  if (error) throw error;
}

/**
 * Lets an artist add a service that isn't in the standard catalog. If a
 * service with that exact name already exists, it's reused (turned on for
 * this artist with the given price/duration) rather than erroring on the
 * catalog's unique-name constraint — an artist typing "Acrylic" again
 * almost certainly means the existing one, not a duplicate entry.
 */
export async function addCustomService(input: {
  name: string;
  durationMinutes: number;
  price: number;
}): Promise<void> {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  const name = input.name.trim();
  if (!name) throw new Error("Give the service a name.");

  const { data: inserted, error: insertError } = await client
    .from("services")
    .insert({
      service_name: name,
      default_duration_minutes: input.durationMinutes,
      created_by: userId,
    })
    .select("service_id")
    .single();

  let serviceId: number;

  if (insertError) {
    // 23505 = unique_violation — a service with this name already exists.
    if (insertError.code === "23505") {
      const { data: existing, error: lookupError } = await client
        .from("services")
        .select("service_id")
        .ilike("service_name", name)
        .maybeSingle();
      if (lookupError || !existing) throw insertError;
      serviceId = existing.service_id;
    } else {
      throw insertError;
    }
  } else {
    serviceId = inserted.service_id;
  }

  await upsertArtistService({
    serviceId,
    price: input.price,
    durationMinutes: input.durationMinutes,
    isAvailable: true,
  });
}

// ---- Clients ----

export async function listArtistClients(): Promise<ArtistClientRow[]> {
  const { data, error } = await clientOrThrow()
    .from("v_artist_clients")
    .select("*")
    .order("last_appointment", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ArtistClientRow[];
}

export async function saveClientNote(clientId: string, note: string) {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  const { error } = await client.from("artist_client_notes").upsert(
    { artist_id: userId, client_id: clientId, note },
    { onConflict: "artist_id,client_id" },
  );
  if (error) throw error;
}

// ---- Earnings ----

export async function getEarningsBreakdown() {
  const bookings = await listBookings("all");
  const completed = bookings.filter((b) => b.status === "completed");

  const totalEarned = completed.reduce((sum, b) => sum + Number(b.price), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = completed.filter((b) => new Date(b.booking_date) >= startOfMonth);
  const thisMonthTotal = thisMonth.reduce((sum, b) => sum + Number(b.price), 0);

  const byService = new Map<string, { count: number; total: number }>();
  for (const b of completed) {
    const entry = byService.get(b.service_name) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += Number(b.price);
    byService.set(b.service_name, entry);
  }

  return {
    totalEarned,
    thisMonthTotal,
    completedCount: completed.length,
    byService: Array.from(byService.entries()).map(([serviceName, v]) => ({ serviceName, ...v })),
    recentCompleted: completed.slice(0, 10),
  };
}

// ---- Artist profile (bio, gallery, socials, working hours) ----

export async function getMyArtistProfile(): Promise<ArtistProfileRow | null> {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await client
    .from("artist_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    working_hours: data.working_hours ?? {},
  } as ArtistProfileRow;
}

export async function updateMyArtistProfile(patch: Partial<Pick<ArtistProfileRow,
  "business_name" | "location" | "bio" | "instagram_handle" | "tiktok_handle" | "whatsapp_number" | "working_hours"
>>) {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  const { error } = await client.from("artist_profiles").update(patch).eq("user_id", userId);
  if (error) throw error;
}

// ---- Portfolio / gallery photos ----
// Uses the "artist-gallery" public storage bucket (already set up in
// nailbook.sql, scoped by RLS to each artist's own folder).

export async function uploadGalleryPhoto(file: File): Promise<string> {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await client.storage.from("artist-gallery").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: publicUrl } = client.storage.from("artist-gallery").getPublicUrl(path);

  const profile = await getMyArtistProfile();
  const nextGallery = [...(profile?.gallery ?? []), publicUrl.publicUrl];

  const { error: updateError } = await client
    .from("artist_profiles")
    .update({ gallery: nextGallery })
    .eq("user_id", userId);
  if (updateError) throw updateError;

  return publicUrl.publicUrl;
}

export async function removeGalleryPhoto(url: string) {
  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  const profile = await getMyArtistProfile();
  const nextGallery = (profile?.gallery ?? []).filter((g) => g !== url);

  const { error } = await client.from("artist_profiles").update({ gallery: nextGallery }).eq("user_id", userId);
  if (error) throw error;

  // Best-effort cleanup of the underlying storage object; if this fails
  // (e.g. URL shape changed) the gallery list is already correct either way.
  try {
    const marker = "/artist-gallery/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const objectPath = url.slice(idx + marker.length);
      await client.storage.from("artist-gallery").remove([objectPath]);
    }
  } catch {
    // non-fatal
  }
}
