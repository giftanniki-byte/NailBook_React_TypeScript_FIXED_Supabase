import { useEffect, useState } from "react";
import { listArtistServices, removeArtistService, upsertArtistService } from "../lib/artistDashboard";
import type { ArtistServiceRow } from "../types";

export default function ArtistServices() {
  const [services, setServices] = useState<ArtistServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      setServices(await listArtistServices());
    } catch {
      setError("Couldn't load your services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateLocal(serviceId: number, patch: Partial<ArtistServiceRow>) {
    setServices((prev) => prev.map((s) => (s.service_id === serviceId ? { ...s, ...patch } : s)));
  }

  async function saveRow(row: ArtistServiceRow) {
    setSavingId(row.service_id);
    setError("");
    try {
      if (row.offered) {
        await upsertArtistService({
          serviceId: row.service_id,
          price: row.price ?? 0,
          durationMinutes: row.duration_minutes,
          isAvailable: row.is_available,
        });
      } else {
        await removeArtistService(row.service_id);
      }
    } catch {
      setError("Couldn't save that service. Try again.");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleOffered(row: ArtistServiceRow) {
    const next = !row.offered;
    updateLocal(row.service_id, { offered: next, is_available: next });
    if (next) {
      await upsertArtistService({
        serviceId: row.service_id,
        price: row.price ?? 0,
        durationMinutes: row.duration_minutes ?? row.default_duration_minutes,
        isAvailable: true,
      });
    } else {
      await removeArtistService(row.service_id);
    }
  }

  return (
    <main className="artistDash">
      <div className="artistDashTop">
        <div>
          <span className="eyebrow">SERVICES</span>
          <h1>Your services & pricing.</h1>
          <p>Turn on the services you offer, and set your own price and duration for each.</p>
        </div>
      </div>

      {error && <div className="formMessage error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <p className="mutedLine">Loading…</p>
      ) : (
        <div className="artistServiceList">
          {services.map((row) => (
            <div key={row.service_id} className={row.offered ? "artistServiceRow on" : "artistServiceRow"}>
              <div className="artistServiceHead">
                <button
                  type="button"
                  className={`switch ${row.offered ? "on" : ""}`}
                  onClick={() => toggleOffered(row)}
                  aria-label={`Toggle ${row.service_name}`}
                />
                <strong>{row.service_name}</strong>
              </div>

              {row.offered && (
                <div className="artistServiceFields">
                  <label className="formField">
                    <span>Price (R)</span>
                    <input
                      type="number"
                      min={0}
                      value={row.price ?? 0}
                      onChange={(e) => updateLocal(row.service_id, { price: Number(e.target.value) })}
                      onBlur={() => saveRow(row)}
                    />
                  </label>
                  <label className="formField">
                    <span>Duration (min)</span>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={row.duration_minutes ?? row.default_duration_minutes}
                      onChange={(e) => updateLocal(row.service_id, { duration_minutes: Number(e.target.value) })}
                      onBlur={() => saveRow(row)}
                    />
                  </label>
                  {savingId === row.service_id && <span className="mutedLine">Saving…</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
