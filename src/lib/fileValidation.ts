// Matches the "artist-gallery" storage bucket's server-side limits exactly
// (see nailbook-artist-v10.sql) — checking here first means a rejected
// upload shows a fast, friendly message instead of a raw network error,
// while the bucket itself still enforces the real limit either way.

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Please choose a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "That image is too large — please choose one under 5MB.";
  }
  return null;
}
