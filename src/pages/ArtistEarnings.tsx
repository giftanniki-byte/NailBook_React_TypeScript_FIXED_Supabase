import { useEffect, useState } from "react";
import { getEarningsBreakdown } from "../lib/artistDashboard";
import type { ArtistBooking } from "../types";

type Breakdown = {
  totalEarned: number;
  thisMonthTotal: number;
  completedCount: number;
  byService: { serviceName: string; count: number; total: number }[];
  recentCompleted: ArtistBooking[];
};

export default function ArtistEarnings() {
  const [data, setData] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEarningsBreakdown()
      .then(setData)
      .catch(() => setError("Couldn't load your earnings."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="artistDash">
      <div className="artistDashTop">
        <div>
          <span className="eyebrow">EARNINGS</span>
          <h1>Track what you've made.</h1>
          <p>Based on completed bookings.</p>
        </div>
      </div>

      {error && <div className="formMessage error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading || !data ? (
        <p className="mutedLine">Loading…</p>
      ) : (
        <>
          <div className="artistMetricGrid">
            <div className="artistMetricCard">
              <span className="artistMetricLabel">Total Earned</span>
              <strong>R{data.totalEarned.toLocaleString()}</strong>
            </div>
            <div className="artistMetricCard">
              <span className="artistMetricLabel">This Month</span>
              <strong>R{data.thisMonthTotal.toLocaleString()}</strong>
            </div>
            <div className="artistMetricCard">
              <span className="artistMetricLabel">Completed Bookings</span>
              <strong>{data.completedCount}</strong>
            </div>
          </div>

          <section className="artistUpNext">
            <div className="artistSectionHead"><h2>By Service</h2></div>
            {data.byService.length === 0 ? (
              <div className="emptyState">No completed bookings yet.</div>
            ) : (
              <div className="artistServiceBreakdown">
                {data.byService
                  .sort((a, b) => b.total - a.total)
                  .map((s) => (
                    <div key={s.serviceName} className="artistServiceBreakdownRow">
                      <span>{s.serviceName}</span>
                      <span className="mutedLine">{s.count} booking{s.count === 1 ? "" : "s"}</span>
                      <strong>R{s.total.toLocaleString()}</strong>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section className="artistUpNext">
            <div className="artistSectionHead"><h2>Recent Completed</h2></div>
            {data.recentCompleted.length === 0 ? (
              <div className="emptyState">Nothing completed yet.</div>
            ) : (
              <div className="artistBookingList">
                {data.recentCompleted.map((b) => (
                  <div key={b.booking_id} className="artistBookingRow">
                    <div className="artistClientAvatar">{b.client_name?.[0]?.toUpperCase() ?? "?"}</div>
                    <div className="artistBookingInfo">
                      <strong>{b.client_name}</strong>
                      <span className="mutedLine">{b.service_name}</span>
                      <span className="mutedLine">{new Date(b.booking_date).toLocaleDateString()}</span>
                    </div>
                    <strong>R{Number(b.price).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
