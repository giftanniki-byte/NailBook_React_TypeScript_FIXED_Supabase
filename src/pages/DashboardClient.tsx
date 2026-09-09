import { useEffect, useState } from "react";
import { CalendarCheck, Heart, MessageCircle, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { listMyBookingsAsClient } from "../lib/bookings";
import BookingChat from "../components/BookingChat";
import type { ClientBookingRow } from "../types";

export default function DashboardClient() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<ClientBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<{ bookingId: string; artistName: string } | null>(null);

  useEffect(() => {
    listMyBookingsAsClient()
      .then(setBookings)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status));
  const recent = bookings.filter((b) => !["pending", "confirmed"].includes(b.status));

  return (
    <main className="artistDash">
      <div className="artistDashTop">
        <div>
          <span className="eyebrow">YOUR NAILBOOK</span>
          <h1>Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.</h1>
          <p>Here's what's coming up, and where to find your next artist.</p>
        </div>
        <Link className="primaryButton" to="/artists"><Search size={17} /> Find an Artist</Link>
      </div>

      <div className="artistMetricGrid clientMetricGrid">
        <div className="artistMetricCard">
          <CalendarCheck size={19} />
          <span className="artistMetricLabel">Upcoming</span>
          <strong>{loading ? "—" : upcoming.length}</strong>
        </div>
        <div className="artistMetricCard">
          <Sparkles size={19} />
          <span className="artistMetricLabel">Past Visits</span>
          <strong>{loading ? "—" : recent.length}</strong>
        </div>
        <div className="artistMetricCard">
          <Heart size={19} />
          <span className="artistMetricLabel">Saved Artists</span>
          <strong>0</strong>
        </div>
      </div>

      <section className="artistUpNext">
        <div className="artistSectionHead">
          <h2>Your Appointments</h2>
        </div>

        {loading ? (
          <p className="mutedLine">Loading…</p>
        ) : upcoming.length === 0 ? (
          <div className="emptyState">
            No upcoming appointments yet.{" "}
            <Link to="/artists">Browse artists to book one</Link>.
          </div>
        ) : (
          <div className="artistBookingList">
            {upcoming.map((b) => (
              <div key={b.booking_id} className="artistBookingRow">
                <div className="artistClientAvatar">{b.artist_name?.[0]?.toUpperCase() ?? "?"}</div>
                <div className="artistBookingInfo">
                  <strong>{b.artist_name}</strong>
                  <span className="mutedLine">{b.service_name}</span>
                  <span className="mutedLine">
                    {new Date(b.booking_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {b.start_time.slice(0, 5)}
                  </span>
                </div>
                <span className={`artistStatusTag ${b.status}`}>{b.status}</span>
                <div className="artistBookingActions">
                  <button
                    type="button"
                    className="chatIconButton"
                    aria-label={`Message ${b.artist_name}`}
                    onClick={() => setActiveChat({ bookingId: b.booking_id, artistName: b.artist_name })}
                  >
                    <MessageCircle size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section className="artistUpNext">
          <div className="artistSectionHead">
            <h2>Recent Activity</h2>
          </div>
          <div className="artistBookingList">
            {recent.slice(0, 5).map((b) => (
              <div key={b.booking_id} className="artistBookingRow">
                <div className="artistClientAvatar">{b.artist_name?.[0]?.toUpperCase() ?? "?"}</div>
                <div className="artistBookingInfo">
                  <strong>{b.artist_name}</strong>
                  <span className="mutedLine">{b.service_name}</span>
                </div>
                <span className={`artistStatusTag ${b.status}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeChat && (
        <BookingChat
          bookingId={activeChat.bookingId}
          otherPartyName={activeChat.artistName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </main>
  );
}
