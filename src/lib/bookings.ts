import { supabase } from "./supabase";

export type BookableService = {
  service_id: number;
  service_name: string;
  price: number;
  duration_minutes: number | null;
};

// Reads from the same v_artist_directory view Find Artist uses, so the
// service list, prices, and durations shown here always match what the
// artist has actually turned on in their Services tab.
export async function getArtistBookableServices(artistId: string): Promise<BookableService[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("v_artist_directory")
    .select("services")
    .eq("artist_id", artistId)
    .maybeSingle();

  if (error || !data?.services) return [];

  const services = Array.isArray(data.services) ? data.services : [];
  return services
    .filter((s: { service_id?: number; price?: number | null }) => s?.service_id != null && s?.price != null)
    .map((s: { service_id: number; service_name: string; price: number; duration_minutes: number | null }) => ({
      service_id: s.service_id,
      service_name: s.service_name,
      price: Number(s.price),
      duration_minutes: s.duration_minutes ?? null,
    }));
}

export async function createBookingRequest(input: {
  artistId: string;
  serviceId: number;
  price: number;
  bookingDate: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  clientNotes?: string;
}) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("You need to be signed in to request a booking.");

  const { error } = await supabase.from("bookings").insert({
    client_id: userId,
    artist_id: input.artistId,
    service_id: input.serviceId,
    booking_date: input.bookingDate,
    start_time: input.startTime,
    price: input.price,
    client_notes: input.clientNotes ?? "",
  });

  if (error) throw error;
}
