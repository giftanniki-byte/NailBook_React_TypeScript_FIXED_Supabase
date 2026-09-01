import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { demoArtists, getArtists } from "../lib/artists";
import type { Artist } from "../types";

export default function ArtistProfile() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(demoArtists.find((item) => item.id === id) ?? null);

  useEffect(() => {
    getArtists().then((items) => {
      const found = items.find((item) => item.id === id);
      if (found) setArtist(found);
    }).catch(() => undefined);
  }, [id]);

  if (!artist) return <main className="centerPage"><h1>Artist not found</h1><Link className="primaryButton" to="/artists">Back to Artists</Link></main>;

  return (
    <main className="contentSection">
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
        <form className="bookingForm" onSubmit={(event) => event.preventDefault()}>
          <label className="formField"><span>Service</span><select defaultValue={artist.specialty}>{(artist.services?.length ? artist.services : [artist.specialty]).map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="formField"><span>Preferred date</span><input type="date" required /></label>
          <label className="formField"><span>Preferred time</span><input type="time" required /></label>
          <button className="primaryButton" type="submit"><CalendarDays size={17} /> Send Booking Request</button>
        </form>
      </section>
    </main>
  );
}
