import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import FormField from "../components/FormField";
import { signIn } from "../lib/auth";

export default function Login({ role }: { role: "client" | "artist" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await signIn(email, password, role);
      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return <main><PageHeader eyebrow={role === "artist" ? "ARTIST LOGIN" : "CLIENT LOGIN"} title={`Sign in as ${role}`} text="Use the email address and password connected to your NailBook account." /><section className="formSection"><form className="authForm" onSubmit={submit}><FormField label="Email" name="email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><FormField label="Password" name="password" type="password" value={password} onChange={setPassword} placeholder="Your password" /><button className="primaryButton fullButton" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>{message && <p className="formMessage error">{message}</p>}<p className="formFooter">Need an account? <Link to={role === "artist" ? "/signup/artist" : "/signup/client"}>Create one</Link></p></form></section></main>;
}
