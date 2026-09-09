import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, LogIn, MapPin, Star, UserPlus } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { demoArtists, getArtists } from "../lib/artists";
import { createBookingRequest, getArtistBookableServices, type BookableService } from "../lib/bookings";
import { useAuth } from "../lib/AuthContext";
import PageMeta from "../components/PageMeta";
import type { Artist } from "../types";

export default function ArtistProfile() {
  const { id } = useParams();
  const location = useLocation();
  const { user, profile, loading: authLoading } = useAuth();

  const [artist, setArtist] = useState<Artist | null>(demoArtists.find((item) => item.id === id) ?? null);
  const [services, setServices] = useState<BookableService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getArtists().then((items) => {
      const found = items.find((item) => item.id === id);
      if (found) setArtist(found);
    }).catch(() => undefined);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getArtistBookableServices(id).then((rows) => {
      setServices(rows);
      setSelectedServiceId(rows[0]?.service_id ?? null);
    }).catch(() => undefined);
  }, [id]);

  if (!artist) return <main className="centerPage"><h1>Artist not found</h1><Link className="primaryButton" to="/artists">Back to Artists</Link></main>;

  async function submitBooking(event: FormEvent) {
    event.preventDefault();
    if (!id || selectedServiceId == null || !artist) return;
    const chosen = services.find((s) => s.service_id === selectedServiceId);
    if (!chosen) return;

    setSubmitting(true);
    setFormMessage(null);
    try {
      await createBookingRequest({
        artistId: id,
        serviceId: chosen.service_id,
        price: chosen.price,
        bookingDate: date,
        startTime: time,
      });
      setFormMessage({ type: "success", text: `Your request has been sent to ${artist.name}. You'll be notified once they respond.` });
      setDate("");
      setTime("");
    } catch (error) {
      setFormMessage({ type: "error", text: error instanceof Error ? error.message : "Couldn't send that request. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="contentSection">
      <PageMeta
        title={`${artist.name} — Nail Artist in ${artist.city} | NailBook`}
        description={`Book ${artist.name}, a nail artist in ${artist.city} specializing in ${(artist.services?.length ? artist.services : [artist.specialty]).join(", ")}. Rated ${artist.rating.toFixed(1)} on NailBook.`}
      />
      <div className="profileHero">
        <img src={artist.image} alt={`${artist.name} portfolio`} />
        <div className="profileInfo">
          <span className="eyebrow">NAIL ARTIST</span>
          <h1>{artist.name}</h1>
          <p className="mutedLine"><MapPin size={17} /> {artist.city}</p>
          <div className="profileRating"><Star size={17} fill="currentColor" /> {artist.rating.toFixed(1)} <span>({artist.reviewCount ?? 0} reviews)</span></div>
          <p>{artist.bio}</p>
          <div className="tagList">
            {(artist.services?.length ? artist.services : [artist.specialty]).map((service) => <span key={service}>{service}</span>)}
          </div>
        </div>
      </div>

      <section id="booking" className="bookingPanel">
        <div><span className="eyebrow">BOOKING</span><h2>Request an appointment</h2><p>Choose your preferred date and send a request to {artist.name}.</p></div>

        {authLoading ? (
          <p className="mutedLine">Loading…</p>
        ) : !user ? (
          // Not signed in at all — booking requires an account so the
          // artist can confirm who they're dealing with.
          <div className="bookingGate">
            <p>You'll need an account to request a booking with {artist.name}.</p>
            <div className="bookingGateActions">
              <Link className="primaryButton" to="/login/client" state={{ from: location.pathname }}>
                <LogIn size={16} /> Sign In
              </Link>
              <Link className="outlineButton" to="/signup/client" state={{ from: location.pathname }}>
                <UserPlus size={16} /> Create Account
              </Link>
            </div>
          </div>
        ) : profile?.role === "artist" ? (
          // Artists currently have one role per account (no "switch to
          // client mode" yet), so they can't submit a booking as a client.
          <div className="bookingGate">
            <p>Booking is available on client accounts. Your account is set up as an artist.</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bookingGate">
            <p>{artist.name} hasn't set up any bookable services yet — check back soon.</p>
          </div>
        ) : (
          <form className="bookingForm" onSubmit={submitBooking}>
            <label className="formField">
              <span>Service</span>
              <select value={selectedServiceId ?? ""} onChange={(e) => setSelectedServiceId(Number(e.target.value))}>
                {services.map((s) => (
                  <option key={s.service_id} value={s.service_id}>
                    {s.service_name} — R{s.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
            <label className="formField">
              <span>Preferred date</span>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </label>
            <label className="formField">
              <span>Preferred time</span>
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
            <button className="primaryButton" type="submit" disabled={submitting}>
              <CalendarDays size={17} /> {submitting ? "Sending…" : "Send Booking Request"}
            </button>
            {formMessage && (
              <p className={formMessage.type === "success" ? "formMessage success" : "formMessage error"}>{formMessage.text}</p>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
