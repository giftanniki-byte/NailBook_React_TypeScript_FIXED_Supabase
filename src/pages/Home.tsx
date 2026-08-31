import { ArrowRight, CalendarCheck, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="heroContent">
          <span className="eyebrow">NAILBOOK</span>
          <h1>Beautiful nails start with the right artist.</h1>
          <p>Discover talented nail artists, compare services and book your next appointment in a few simple steps.</p>
          <div className="heroActions">
            <Link className="primaryButton" to="/artists">Find an Artist <ArrowRight size={17} /></Link>
            <Link className="textButton" to="/signup">Create an Account</Link>
          </div>
        </div>
      </section>

      <section className="featureSection">
        <div className="sectionHeading centered">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>Everything you need in one place.</h2>
          <p>Whether you are looking for a nail artist or managing your own bookings, NailBook keeps the process simple.</p>
        </div>

        <div className="featureGrid">
          <div className="featureCard"><Search /><h3>Find Artists</h3><p>Search by city and specialty to find artists that match what you need.</p></div>
          <div className="featureCard"><CalendarCheck /><h3>Book Easily</h3><p>Open an artist profile and send a booking request without unnecessary steps.</p></div>
          <div className="featureCard"><ShieldCheck /><h3>Build Trust</h3><p>Give clients clear information about your services, location and availability.</p></div>
          <div className="featureCard"><Sparkles /><h3>Show Your Work</h3><p>Artists can use their profiles to showcase services and attract new clients.</p></div>
        </div>
      </section>

      <section className="ctaSection">
        <div><span className="eyebrow">READY TO START?</span><h2>Find your next nail appointment.</h2><p>Browse artists and discover a service that suits you.</p></div>
        <Link className="primaryButton" to="/artists">Browse Artists <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}
