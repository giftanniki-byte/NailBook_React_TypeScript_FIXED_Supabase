export type Role = "artist" | "client";

export type Artist = {
  id: string;
  name: string;
  city: string;
  location?: string;
  specialty: string;
  rating: number;
  reviewCount?: number;
  image: string;
  bio?: string;
  services?: string[];
  isOnline?: boolean;
};

export type Profile = {
  user_id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  location: string | null;
  business_name: string | null;
  services: string[] | null;
  avatar_url: string | null;
};

// ---- Artist dashboard (v2) ----

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "declined" | "no_show";

export type ArtistTodayMetrics = {
  artist_id: string;
  average_rating: number;
  is_available: boolean;
  bookings_today: number;
  pending_requests: number;
  earnings_today: number;
  top_service: string | null;
};

export type ArtistBooking = {
  booking_id: string;
  client_id: string;
  artist_id: string;
  service_id: number;
  booking_date: string;
  start_time: string;
  end_time: string | null;
  status: BookingStatus;
  price: number;
  client_notes: string;
  artist_notes: string;
  client_name: string;
  client_email: string;
  service_name: string;
};

export type ArtistServiceRow = {
  service_id: number;
  service_name: string;
  default_duration_minutes: number;
  price: number | null;
  duration_minutes: number | null;
  is_available: boolean;
  offered: boolean;
  created_by: string | null;
};

export type ArtistClientRow = {
  artist_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  total_appointments: number;
  last_appointment: string | null;
  total_spent: number;
  avg_rating_given: number | null;
  public_review_count: number;
  private_note: string | null;
};

export type ArtistProfileRow = {
  user_id: string;
  business_name: string;
  location: string;
  bio: string;
  years_experience: number;
  average_rating: number;
  review_count: number;
  total_bookings: number;
  is_available: boolean;
  gallery: string[];
  instagram_handle: string | null;
  tiktok_handle: string | null;
  whatsapp_number: string | null;
  working_hours: Record<string, { open: string; close: string; closed: boolean }>;
};

export type ClientBookingRow = {
  booking_id: string;
  client_id: string;
  artist_id: string;
  service_id: number;
  booking_date: string;
  start_time: string;
  status: BookingStatus;
  price: number;
  service_name: string;
  artist_name: string;
  artist_location: string;
};

export type BookingMessage = {
  message_id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  edited_at: string | null;
};
