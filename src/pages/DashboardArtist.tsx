import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, ClipboardList, Star, Wallet, MapPin, Instagram } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { getMyArtistProfile, getTodayMetrics, getUpNextBooking, updateBookingStatus } from "../lib/artistDashboard";
import type { ArtistBooking, ArtistProfileRow, ArtistTodayMetrics } from "../types";

export default function DashboardArtist() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<ArtistTodayMetrics | null>(null);
  const [upNext, setUpNext] = useState<ArtistBooking | null>(null);
  const [artistProfile, setArtistProfile] = useState<ArtistProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [m, next, ap] = await Promise.all([getTodayMetrics(), getUpNextBooking(), getMyArtistProfile()]);
      setMetrics(m);
      setUpNext(next);
      setArtistProfile(ap);
    } catch {
      setActionError("Couldn't load your dashboard. Pull to refresh or try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function respond(status: "confirmed" | "declined") {
    if (!upNext) return;
    setActionError("");
    try {
      await updateBookingStatus(upNext.booking_id, status);
      loadAll();
    } catch {
      setActionError("Couldn't update that booking. Try again.");
    }
  }

  return (
    <main className="artistDash">
      <div className="artistDashTop">
        <div>
          <span className="eyebrow">ARTIST DASHBOARD</span>
          <h1>Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.</h1>
          <p>Here's what's happening with your bookings today.</p>
        </div>
      </div>

      {actionError && <div className="formMessage error" style={{ marginBottom: 20 }}>{actionError}</div>}

      <div className="artistMetricGrid">
        <div className="artistMetricCard">
          <CalendarCheck size={19} />
          <span className="artistMetricLabel">Bookings Today</span>
          <strong>{loading ? "—" : metrics?.bookings_today ?? 0}</strong>
        </div>
        <div className="artistMetricCard">
          <ClipboardList size={19} />
          <span className="artistMetricLabel">Requests</span>
          <strong>{loading ? "—" : metrics?.pending_requests ?? 0}</strong>
        </div>
        <div className="artistMetricCard">
          <Star size={19} />
          <span className="artistMetricLabel">Rating</span>
          <strong>{loading ? "—" : (metrics?.average_rating ?? 0).toFixed(1)}</strong>
        </div>
        <div className="artistMetricCard">
          <Wallet size={19} />
          <span className="artistMetricLabel">Earnings Today</span>
          <strong>{loading ? "—" : `R${(metrics?.earnings_today ?? 0).toLocaleString()}`}</strong>
        </div>
      </div>

      <section className="artistUpNext">
        <div className="artistSectionHead">
          <h2>Up Next</h2>
          <Link to="/dashboard/artist/bookings">View all</Link>
        </div>

        {loading ? (
          <p className="mutedLine">Loading…</p>
        ) : !upNext ? (
          <div className="emptyState">No upcoming bookings or requests right now.</div>
        ) : (
          <div className="artistUpNextCard">
            <div className="artistUpNextInfo">
              <div className="artistClientAvatar">{upNext.client_name?.[0]?.toUpperCase() ?? "?"}</div>
              <div>
                <strong>{upNext.client_name}</strong>
                <p>{upNext.service_name}</p>
                <span className="mutedLine">
                  {new Date(upNext.booking_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {upNext.start_time.slice(0, 5)}
                </span>
              </div>
            </div>
            <div className="artistUpNextActions">
              {upNext.status === "pending" ? (
                <>
                  <button className="primaryButton smallButton" type="button" onClick={() => respond("confirmed")}>Accept</button>
                  <button className="outlineButton smallButton" type="button" onClick={() => respond("declined")}>Decline</button>
                </>
              ) : (
                <span className="artistStatusTag confirmed">Confirmed</span>
              )}
            </div>
          </div>
        )}
      </section>

      {artistProfile && (
        <section className="artistProfileSummary">
          <div className="artistProfileSummaryHead">
            <div>
              <div className="artistOnlineRow">
                <div className="artistClientAvatar large">{artistProfile.business_name?.[0]?.toUpperCase() ?? "N"}</div>
                <span className={metrics?.is_available ? "artistStatusPill online small" : "artistStatusPill small"}>
                  <span className="artistStatusDot" /> {metrics?.is_available ? "Online" : "Offline"}
                </span>
              </div>
              <h3>{artistProfile.business_name}</h3>
              <p className="mutedLine"><MapPin size={15} /> {artistProfile.location || "Add your location"}</p>
              <p className="artistBioText">{artistProfile.bio}</p>
              {artistProfile.instagram_handle && (
                <p className="mutedLine"><Instagram size={15} /> @{artistProfile.instagram_handle}</p>
              )}
            </div>
            <Link className="outlineButton smallButton" to="/settings">Edit Profile</Link>
          </div>

          {metrics?.top_service && (
            <p className="artistTopService">Most booked service: <strong>{metrics.top_service}</strong></p>
          )}

          {artistProfile.gallery.length > 0 && (
            <div className="artistPortfolioRow">
              {artistProfile.gallery.slice(0, 4).map((url) => (
                <img key={url} src={url} alt="Portfolio work" />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
