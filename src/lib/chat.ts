import { supabase } from "./supabase";
import type { BookingMessage } from "../types";

function clientOrThrow() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function listMessages(bookingId: string): Promise<BookingMessage[]> {
  const { data, error } = await clientOrThrow()
    .from("booking_messages")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BookingMessage[];
}

export async function sendMessage(bookingId: string, body: string): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) return;

  const client = clientOrThrow();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("You need to be signed in to send a message.");

  const { error } = await client.from("booking_messages").insert({
    booking_id: bookingId,
    sender_id: userId,
    body: trimmed,
  });
  if (error) throw error;
}

/**
 * Subscribes to new messages on a booking's chat in real time. Returns an
 * unsubscribe function — call it on cleanup (e.g. component unmount, or
 * when the chat panel closes) to avoid leaking open channels.
 */
export function subscribeToMessages(bookingId: string, onMessage: (message: BookingMessage) => void): () => void {
  if (!supabase) return () => undefined;
  const client = supabase;

  const channel = client
    .channel(`booking-chat-${bookingId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "booking_messages", filter: `booking_id=eq.${bookingId}` },
      (payload) => onMessage(payload.new as BookingMessage),
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
