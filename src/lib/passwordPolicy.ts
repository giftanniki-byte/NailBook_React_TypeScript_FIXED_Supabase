// Password policy for signup. Two independent checks:
//   1. Strength — length + character variety, checked entirely locally.
//   2. Breach check — is this password already known to be leaked?
//
// The breach check uses the "Have I Been Pwned" Pwned Passwords API with
// k-anonymity: the password is SHA-1 hashed *in the browser*, and only the
// first 5 characters of that hash are ever sent over the network. The full
// password — and even the full hash — never leaves the device. See
// https://haveibeenpwned.com/API/v3#PwnedPasswords for the exact protocol.

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
  issues: string[];
};

export function checkPasswordStrength(password: string): PasswordStrength {
  const issues: string[] = [];

  if (password.length < 8) issues.push("Use at least 8 characters");
  if (!/[a-z]/.test(password)) issues.push("Add a lowercase letter");
  if (!/[A-Z]/.test(password)) issues.push("Add an uppercase letter");
  if (!/[0-9]/.test(password)) issues.push("Add a number");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("Add a symbol (e.g. ! ? # -)");

  const metCount = 5 - issues.length;
  const score = (password.length === 0 ? 0 : Math.max(1, Math.min(4, metCount - 1))) as PasswordStrength["score"];
  const labels: PasswordStrength["label"][] = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

  return { score, label: labels[score], issues };
}

export function isPasswordStrongEnough(password: string): boolean {
  return checkPasswordStrength(password).issues.length === 0;
}

async function sha1Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Returns true if this password has appeared in a known data breach.
 * Fails "open" (returns false) on any network error — a breach-check
 * outage should never block someone from signing up entirely.
 */
export async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return false;

    const body = await response.text();
    return body.split("\n").some((line) => line.split(":")[0].trim() === suffix);
  } catch {
    return false;
  }
}
