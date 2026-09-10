import { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck, MapPin, Search, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import ArtistCard from "../components/ArtistCard";
import { useAuth } from "../lib/AuthContext";
import { getArtists } from "../lib/artists";
import { getPlatformStats, type PlatformStats } from "../lib/homeStats";
import type { Artist } from "../types";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const [featured, setFeatured] = useState<Artist[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    getArtists()
      .then((artists) => {
        // Only ever feature real artists on the marketing page — never the
        // built-in demo fallback records used when the database is empty
        // or unreachable.
        const real = artists.filter((a) => !a.id.startsWith("demo-"));
        setFeatured([...real].sort((a, b) => b.rating - a.rating).slice(0, 3));
      })
      .catch(() => undefined);

    getPlatformStats().then(setStats).catch(() => undefined);
  }, []);

  // A signed-in visitor lands on "/" if they click the logo, use a
  // bookmark, or come back after closing the tab. Showing them a "Create
  // an Account" marketing page at that point is irrelevant at best and
  // confusing at worst — send them straight to their dashboard instead,
  // the same way logging in already does.
  if (loading) return <div className="loadingPage">Checking your account…</div>;

  if (user) {
    const dashboardPath = profile?.role === "artist" ? "/dashboard/artist" : "/dashboard/client";
    return <Navigate to={dashboardPath} replace />;
  }

  const showStats = stats && stats.artistCount > 0;

  return (
    <main>
      <PageMeta
        title="NailBook — Book Trusted Nail Artists Near You"
        description="Discover talented nail artists, compare services and prices, and book your next appointment in a few simple steps with NailBook."
      />

      <section className="hero">
        <div className="heroContent">
          <span className="eyebrow">NAILBOOK</span>
          <h1>Find your perfect nail artist.</h1>
          <p>Browse real portfolios, compare services and prices, and book with confidence — all in one place.</p>
          <div className="heroActions">
            <Link className="primaryButton" to="/artists"><MapPin size={17} /> Find Artists Near Me</Link>
            <Link className="outlineButton" to="/signup/artist">Join as an Artist</Link>
          </div>

          {showStats && (
            <div className="heroStats">
              <div><strong>{stats!.artistCount}</strong><span>Artists</span></div>
              <div><strong>{stats!.completedBookingCount}</strong><span>Bookings completed</span></div>
              <div><strong>{stats!.cityCount}</strong><span>Cities served</span></div>
            </div>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="featuredSection">
          <div className="sectionHeading spread">
            <div>
              <span className="eyebrow">TOP RATED</span>
              <h2>Featured artists near you</h2>
            </div>
            <Link className="textButton" to="/artists">View all artists <ArrowRight size={16} /></Link>
          </div>
          <div className="artistGrid">
            {featured.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      <section className="featureSection">
        <div className="sectionHeading centered">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>Booking made simple.</h2>
        </div>

        <div className="howItWorksGrid">
          <div className="howItWorksStep">
            <span className="howItWorksNumber"><Search size={20} /></span>
            <h3>Search & discover</h3>
            <p>Find talented artists near you and explore their portfolios, reviews, and styles.</p>
          </div>
          <div className="howItWorksStep">
            <span className="howItWorksNumber"><CalendarCheck size={20} /></span>
            <h3>Book instantly</h3>
            <p>Choose your service, time, and date. Send a request in just a few taps.</p>
          </div>
          <div className="howItWorksStep">
            <span className="howItWorksNumber"><Sparkles size={20} /></span>
            <h3>Enjoy your appointment</h3>
            <p>Relax and get your perfect set from an artist you chose with confidence.</p>
          </div>
        </div>
      </section>

      <section className="ctaSection">
        <div><span className="eyebrow">READY TO START?</span><h2>Find your next nail appointment.</h2><p>Browse artists and discover a service that suits you.</p></div>
        <Link className="primaryButton" to="/artists">Browse Artists <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}
