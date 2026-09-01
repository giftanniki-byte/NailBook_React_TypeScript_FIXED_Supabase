import { CalendarDays, Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Artist } from "../types";

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <article className="artistCard">
      <div className="artistImageWrap">
        <img src={artist.image} alt={`${artist.name} nail work`} />
        <button className="favoriteButton" type="button" aria-label={`Save ${artist.name}`}>
          <Heart size={18} />
        </button>
      </div>

      <div className="artistCardBody">
        <h3>{artist.name}</h3>
        <p className="mutedLine"><MapPin size={15} /> {artist.city}</p>

        <div className="artistMeta">
          <span><Star size={15} fill="currentColor" /> {artist.rating.toFixed(1)}</span>
          <span>{artist.specialty}</span>
        </div>

        <div className="cardActions">
          <Link className="outlineButton" to={`/artist/${artist.id}`}>View Profile</Link>
          <Link className="primaryButton smallButton" to={`/artist/${artist.id}#booking`}>
            <CalendarDays size={16} /> Book
          </Link>
        </div>
      </div>
    </article>
  );
}
