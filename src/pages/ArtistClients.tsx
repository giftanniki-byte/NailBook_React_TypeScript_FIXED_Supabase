import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { listArtistClients, saveClientNote } from "../lib/artistDashboard";
import type { ArtistClientRow } from "../types";

export default function ArtistClients() {
  const [clients, setClients] = useState<ArtistClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const rows = await listArtistClients();
      setClients(rows);
      setDrafts(Object.fromEntries(rows.map((r) => [r.client_id, r.private_note ?? ""])));
    } catch {
      setError("Couldn't load your clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveNote(clientId: string) {
    setSavingId(clientId);
    try {
      await saveClientNote(clientId, drafts[clientId] ?? "");
    } catch {
      setError("Couldn't save that note.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="artistDash">
      <div className="artistDashTop">
        <div>
          <span className="eyebrow">CLIENTS</span>
          <h1>Everyone you've worked with.</h1>
          <p>Private notes here are only visible to you — clients never see them.</p>
        </div>
      </div>

      {error && <div className="formMessage error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <p className="mutedLine">Loading…</p>
      ) : clients.length === 0 ? (
        <div className="emptyState">No clients yet — once you complete a booking, they'll show up here.</div>
      ) : (
        <div className="artistClientList">
          {clients.map((c) => (
            <div key={c.client_id} className="artistClientCard">
              <div className="artistClientCardHead">
                <div className="artistClientAvatar">{c.client_name?.[0]?.toUpperCase() ?? "?"}</div>
                <div>
                  <strong>{c.client_name}</strong>
                  <p className="mutedLine">{c.client_email}</p>
                </div>
              </div>

              <div className="artistClientStats">
                <span>{c.total_appointments} appointment{c.total_appointments === 1 ? "" : "s"}</span>
                <span>R{Number(c.total_spent).toLocaleString()} total</span>
                {c.avg_rating_given != null && (
                  <span><Star size={14} fill="currentColor" /> {Number(c.avg_rating_given).toFixed(1)} ({c.public_review_count} public)</span>
                )}
                {c.last_appointment && (
                  <span>Last visit {new Date(c.last_appointment).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                )}
              </div>

              <label className="formField">
                <span>Private note (only you can see this)</span>
                <textarea
                  rows={2}
                  value={drafts[c.client_id] ?? ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [c.client_id]: e.target.value }))}
                  onBlur={() => saveNote(c.client_id)}
                />
              </label>
              {savingId === c.client_id && <span className="mutedLine">Saving…</span>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
