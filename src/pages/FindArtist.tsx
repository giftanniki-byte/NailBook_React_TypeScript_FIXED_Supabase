import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ArtistCard from "../components/ArtistCard";
import { demoArtists, getArtists } from "../lib/artists";
import type { Artist } from "../types";

export default function FindArtist() {
  const [artists, setArtists] = useState<Artist[]>(demoArtists);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");

  useEffect(() => {
    getArtists().then(setArtists).catch(() => setArtists(demoArtists));
  }, []);

  const specialties = useMemo(() => {
    const values = artists.flatMap((artist) => artist.services?.length ? artist.services : [artist.specialty]);
    return ["All Specialties", ...Array.from(new Set(values)).filter(Boolean)];
  }, [artists]);

  const filtered = artists.filter((artist) => {
    const text = query.trim().toLowerCase();
    const matchesText = !text || [artist.name, artist.city, artist.location ?? ""].some((value) => value.toLowerCase().includes(text));
    const services = artist.services?.length ? artist.services : [artist.specialty];
    const matchesSpecialty = specialty === "All Specialties" || services.includes(specialty);
    return matchesText && matchesSpecialty;
  });

  return (
    <main>
      <PageHeader
        eyebrow="DISCOVER"
        title="Find an Artist"
        text="Search by city or specialty and find a nail artist that fits your style."
      />

      <section className="contentSection">
        <div className="filters">
          <label className="searchBox">
            <Search size={19} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by city or artist" />
          </label>
          <label className="selectBox">
            <select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
              {specialties.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="resultsBar"><strong>{filtered.length} artist{filtered.length === 1 ? "" : "s"}</strong><span>Showing matches for your search</span></div>

        {filtered.length ? (
          <div className="artistGrid">
            {filtered.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
          </div>
        ) : (
          <div className="emptyState">No artists found. Try another city or specialty.</div>
        )}
      </section>
    </main>
  );
}
