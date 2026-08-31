import type { Artist } from "../types";
import { supabase } from "./supabase";

// These records are useful while the database is empty or temporarily unavailable.
// They also make the Find Artist page usable during local development.
export const demoArtists: Artist[] = [
  {
    id: "demo-1",
    name: "Luxe Nail Studio",
    city: "Polokwane, South Africa",
    specialty: "Manicure",
    rating: 4.9,
    reviewCount: 48,
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=85",
    bio: "A modern nail studio focused on neat finishes, creative designs and a relaxed appointment experience.",
    services: ["Manicure", "Gel Nails", "Nail Art"],
  },
  {
    id: "demo-2",
    name: "Luxe Nails",
    city: "Johannesburg, South Africa",
    specialty: "Gel Nails",
    rating: 4.8,
    reviewCount: 36,
    image:
      "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1000&q=85",
    bio: "Gel specialists offering simple, polished sets and custom looks.",
    services: ["Gel Nails", "Nail Art"],
  },
  {
    id: "demo-3",
    name: "Nail Bar",
    city: "Cape Town, South Africa",
    specialty: "Pedicure",
    rating: 4.7,
    reviewCount: 29,
    image:
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1000&q=85",
    bio: "A friendly nail bar with a focus on clean pedicures and classic finishes.",
    services: ["Pedicure", "Manicure"],
  },
];

type DirectoryService = {
  service_id?: number;
  service_name?: string;
  price?: number | null;
  duration_minutes?: number | null;
};

type DirectoryArtist = {
  artist_id: string;
  business_name: string;
  location: string;
  bio: string;
  years_experience: number;
  average_rating: number;
  review_count: number;
  total_bookings: number;
  is_available: boolean;
  gallery: unknown;
  instagram_handle: string | null;
  services: DirectoryService[] | null;
};

function getGalleryImage(gallery: unknown): string {
  if (Array.isArray(gallery) && typeof gallery[0] === "string") {
    return gallery[0];
  }

  return demoArtists[0].image;
}

function getServiceNames(services: DirectoryService[] | null): string[] {
  if (!Array.isArray(services)) return [];

  return services
    .map((service) => service?.service_name?.trim())
    .filter((name): name is string => Boolean(name));
}

export async function getArtists(): Promise<Artist[]> {
  // Local/demo mode still works when Supabase environment variables are missing.
  if (!supabase) return demoArtists;

  /*
   * Do not query business_name, location or services from `profiles`.
   *
   * Those fields are not columns in the profiles table. The NailBook schema
   * keeps account information in `profiles`, artist information in
   * `artist_profiles`, and services in `artist_services` / `services`.
   *
   * `v_artist_directory` joins those tables for the Find Artist page, so this
   * is the correct source for the public artist directory.
   */
  const { data, error } = await supabase
    .from("v_artist_directory")
    .select(
      "artist_id, business_name, location, bio, years_experience, average_rating, review_count, total_bookings, is_available, gallery, instagram_handle, services",
    );

  if (error) {
    console.error("Unable to load artists from Supabase:", error);

    // The page should remain usable even if the database is temporarily down.
    return demoArtists;
  }

  if (!data?.length) return demoArtists;

  return (data as DirectoryArtist[]).map((row) => {
    const services = getServiceNames(row.services);

    return {
      id: row.artist_id,
      name: row.business_name || "Nail Artist",
      city: row.location || "South Africa",
      location: row.location || undefined,
      specialty: services[0] || "Nail Services",
      rating: Number(row.average_rating || 0),
      reviewCount: Number(row.review_count || 0),
      image: getGalleryImage(row.gallery),
      bio: row.bio || "Professional nail artist available through NailBook.",
      services,
    };
  });
}
