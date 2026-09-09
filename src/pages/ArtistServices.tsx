import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { addCustomService, listArtistServices, removeArtistService, upsertArtistService } from "../lib/artistDashboard";
import type { ArtistServiceRow } from "../types";

export default function ArtistServices() {
  const [services, setServices] = useState<ArtistServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customDuration, setCustomDuration] = useState("60");
  const [addingCustom, setAddingCustom] = useState(false);

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

  async function handleAddCustom() {
    const name = customName.trim();
    if (!name) {
      setError("Give your service a name first.");
      return;
    }
    setAddingCustom(true);
    setError("");
    try {
      await addCustomService({
        name,
        durationMinutes: Number(customDuration) || 60,
        price: Number(customPrice) || 0,
      });
      setCustomName("");
      setCustomPrice("");
      setCustomDuration("60");
      await load();
    } catch {
      setError("Couldn't add that service. Try again.");
    } finally {
      setAddingCustom(false);
    }
  }

  return (
    <main className="artistDash">
      <div className="artistDashTop">
        <div>
          <span className="eyebrow">SERVICES</span>
          <h1>Your services & pricing.</h1>
          <p>Turn on the services you offer, set your own price and duration — or add something of your own.</p>
        </div>
      </div>

      {error && <div className="formMessage error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="addServiceCard">
        <div className="addServiceHead">
          <span className="addServiceIcon"><Sparkles size={18} /></span>
          <div>
            <strong>Offer something not on the list?</strong>
            <p className="mutedLine">Add your own service — it'll turn on for you right away.</p>
          </div>
        </div>
        <div className="addServiceFields">
          <label className="formField">
            <span>Service name</span>
            <input
              type="text"
              placeholder="e.g. Ombré Fade"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </label>
          <label className="formField">
            <span>Price (R)</span>
            <input type="number" min={0} value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="0" />
          </label>
          <label className="formField">
            <span>Duration (min)</span>
            <input type="number" min={15} step={15} value={customDuration} onChange={(e) => setCustomDuration(e.target.value)} />
          </label>
          <button type="button" className="primaryButton" onClick={handleAddCustom} disabled={addingCustom}>
            <Plus size={16} /> {addingCustom ? "Adding…" : "Add Service"}
          </button>
        </div>
      </div>

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
