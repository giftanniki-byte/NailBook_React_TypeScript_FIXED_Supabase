import { Mail, MapPin, Phone } from "lucide-react";
import { FormEvent, useState } from "react";
import PageHeader from "../components/PageHeader";

export default function Contact() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  return <main><PageHeader eyebrow="GET IN TOUCH" title="Contact NailBook" text="Have a question or need help? Send us a message." /><section className="contactGrid"><div className="contactInfo"><div><Phone/><h3>Phone</h3><p>+27 00 000 0000</p></div><div><Mail/><h3>Email</h3><p>support@nailbook.example</p></div><div><MapPin/><h3>Location</h3><p>South Africa</p></div></div><form className="authForm" onSubmit={submit}><label className="formField"><span>Name</span><input required /></label><label className="formField"><span>Email</span><input type="email" required /></label><label className="formField"><span>Message</span><textarea rows={6} required /></label><button className="primaryButton fullButton">Send Message</button>{sent && <p className="formMessage success">Thanks. Your message has been recorded for this demo.</p>}</form></section></main>;
}
