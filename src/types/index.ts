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
};
