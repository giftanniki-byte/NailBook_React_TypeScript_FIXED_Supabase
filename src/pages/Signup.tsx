import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import FormField from "../components/FormField";
import PhoneInput from "../components/PhoneInput";
import LocationAutocomplete from "../components/LocationAutocomplete";
import { signUp } from "../lib/auth";
import { checkPasswordStrength, isPasswordBreached } from "../lib/passwordPolicy";

export default function Signup({ role }: { role: "client" | "artist" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fallback = role === "artist" ? "/dashboard/artist" : "/dashboard/client";
  const destination = (location.state as { from?: string } | null)?.from ?? fallback;
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", city: "", location: "", businessName: "", services: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkingBreach, setCheckingBreach] = useState(false);
  const update = (key: keyof typeof form) => (value: string) => setForm((old) => ({ ...old, [key]: value }));

  const strength = useMemo(() => checkPasswordStrength(form.password), [form.password]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    if (strength.issues.length > 0) {
      setMessage({ type: "error", text: `Your password needs a bit more: ${strength.issues[0].toLowerCase()}.` });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Those passwords don't match — check and try again." });
      return;
    }

    setCheckingBreach(true);
    const breached = await isPasswordBreached(form.password);
    setCheckingBreach(false);

    if (breached) {
      setMessage({ type: "error", text: "That password has appeared in a known data breach — please choose a different one." });
      return;
    }

    setBusy(true);
    try {
      const data = await signUp({
        role, email: form.email, password: form.password, fullName: form.name, phone: form.phone, city: form.city, location: form.location, businessName: form.businessName, services: form.services.split(",").map((x) => x.trim()).filter(Boolean),
      });
      if (data.session) navigate(destination, { replace: true });
      else setMessage({ type: "success", text: "Your account has been created. Check your email to confirm the account before signing in." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to create the account." });
    } finally { setBusy(false); }
  }

  return (
    <main>
      <PageHeader
        eyebrow={role === "artist" ? "ARTIST SIGN UP" : "CLIENT SIGN UP"}
        title={`Create a ${role} account`}
        text="Fill in the details below. You can update your profile later."
      />
      <section className="formSection">
        <form className="authForm" onSubmit={submit}>
          <FormField label="Full name" name="name" value={form.name} onChange={update("name")} />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={update("email")} />

          <FormField label="Password" name="password" type="password" value={form.password} onChange={update("password")} />
          {form.password.length > 0 && (
            <div className="passwordStrength">
              <div className="passwordStrengthBar">
                <span className={`passwordStrengthFill level-${strength.score}`} />
              </div>
              <div className="passwordStrengthMeta">
                <span className={`passwordStrengthLabel level-${strength.score}`}>{strength.label}</span>
                {strength.issues.length > 0 && <span className="mutedLine">{strength.issues[0]}</span>}
              </div>
            </div>
          )}

          <FormField label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} />
          {form.confirmPassword.length > 0 && form.confirmPassword !== form.password && (
            <p className="fieldHint error">Passwords don't match yet.</p>
          )}

          <PhoneInput label="Phone" value={form.phone} onChange={update("phone")} />
          <LocationAutocomplete label="City" value={form.city} onChange={update("city")} placeholder="e.g. Johannesburg" />
          <LocationAutocomplete
            label="Location"
            value={form.location}
            onChange={update("location")}
            placeholder={role === "artist" ? "e.g. Sandton, Johannesburg" : "e.g. Rosebank, Johannesburg"}
          />
          {role === "artist" && (
            <>
              <FormField label="Business name" name="businessName" value={form.businessName} onChange={update("businessName")} required={false} />
              <FormField label="Services" name="services" value={form.services} onChange={update("services")} placeholder="Manicure, Gel Nails, Pedicure" required={false} />
            </>
          )}
          <button className="primaryButton fullButton" disabled={busy || checkingBreach}>
            {checkingBreach ? "Checking password…" : busy ? "Creating account…" : "Create Account"}
          </button>
          {message && <p className={message.type === "success" ? "formMessage success" : "formMessage error"}>{message.text}</p>}
          <p className="formFooter">Already have an account? <Link to={role === "artist" ? "/login/artist" : "/login/client"}>Sign in</Link></p>
        </form>
      </section>
    </main>
  );
}
