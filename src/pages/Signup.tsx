import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import FormField from "../components/FormField";
import { signUp } from "../lib/auth";

export default function Signup({ role }: { role: "client" | "artist" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from ?? "/";
  const [form, setForm] = useState({ name:"", email:"", password:"", phone:"", city:"", location:"", businessName:"", services:"" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form) => (value: string) => setForm((old) => ({ ...old, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const data = await signUp({
        role, email: form.email, password: form.password, fullName: form.name, phone: form.phone, city: form.city, location: form.location, businessName: form.businessName, services: form.services.split(",").map((x) => x.trim()).filter(Boolean),
      });
      if (data.session) navigate(destination, { replace: true });
      else setMessage("Your account has been created. Check your email to confirm the account before signing in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create the account.");
    } finally { setBusy(false); }
  }

  return <main><PageHeader eyebrow={role === "artist" ? "ARTIST SIGN UP" : "CLIENT SIGN UP"} title={`Create a ${role} account`} text="Fill in the details below. You can update your profile later." /><section className="formSection"><form className="authForm" onSubmit={submit}><FormField label="Full name" name="name" value={form.name} onChange={update("name")} /><FormField label="Email" name="email" type="email" value={form.email} onChange={update("email")} /><FormField label="Password" name="password" type="password" value={form.password} onChange={update("password")} /><FormField label="Phone" name="phone" value={form.phone} onChange={update("phone")} required={false} /><FormField label="City" name="city" value={form.city} onChange={update("city")} required={false} /><FormField label="Location" name="location" value={form.location} onChange={update("location")} required={false} />{role === "artist" && <><FormField label="Business name" name="businessName" value={form.businessName} onChange={update("businessName")} required={false} /><FormField label="Services" name="services" value={form.services} onChange={update("services")} placeholder="Manicure, Gel Nails, Pedicure" required={false} /></>}<button className="primaryButton fullButton" disabled={busy}>{busy ? "Creating account…" : "Create Account"}</button>{message && <p className="formMessage success">{message}</p>}<p className="formFooter">Already have an account? <Link to={role === "artist" ? "/login/artist" : "/login/client"}>Sign in</Link></p></form></section></main>;
}
