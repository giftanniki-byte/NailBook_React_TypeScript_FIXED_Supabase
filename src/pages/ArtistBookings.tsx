import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { listBookings, updateBookingStatus } from "../lib/artistDashboard";
import BookingChat from "../components/BookingChat";
import type { ArtistBooking, BookingStatus } from "../types";

const FILTERS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Declined", value: "declined" },
  { label: "Cancelled", value: "cancelled" },
];

export default function ArtistBookings() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [bookings, setBookings] = useState<ArtistBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChat, setActiveChat] = useState<{ bookingId: string; clientName: string } | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setBookings(await listBookings(filter));
    } catch {
      setError("Couldn't load bookings. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function act(bookingId: string, status: BookingStatus) {
    try {
      await updateBookingStatus(bookingId, status);
      load();
    } catch {
      setError("Couldn't update that booking.");
    }
  }

  return (
    <main className="artistDash">
      <div className="artistDashTop">
        <div>
          <span className="eyebrow">BOOKINGS</span>
          <h1>Manage your appointments.</h1>
          <p>Accept or decline requests, and track everything on your calendar.</p>
        </div>
      </div>

      <div className="artistFilterRow">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={filter === f.value ? "artistFilterChip active" : "artistFilterChip"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="formMessage error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <p className="mutedLine">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="emptyState">No bookings in this view yet.</div>
      ) : (
        <div className="artistBookingList">
          {bookings.map((b) => (
            <div key={b.booking_id} className="artistBookingRow">
              <div className="artistClientAvatar">{b.client_name?.[0]?.toUpperCase() ?? "?"}</div>
              <div className="artistBookingInfo">
                <strong>{b.client_name}</strong>
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
                  aria-label={`Message ${b.client_name}`}
                  onClick={() => setActiveChat({ bookingId: b.booking_id, clientName: b.client_name })}
                >
                  <MessageCircle size={17} />
                </button>
                {b.status === "pending" && (
                  <>
                    <button className="primaryButton smallButton" type="button" onClick={() => act(b.booking_id, "confirmed")}>Accept</button>
                    <button className="outlineButton smallButton" type="button" onClick={() => act(b.booking_id, "declined")}>Decline</button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <button className="primaryButton smallButton" type="button" onClick={() => act(b.booking_id, "completed")}>Mark Completed</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeChat && (
        <BookingChat
          bookingId={activeChat.bookingId}
          otherPartyName={activeChat.clientName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </main>
  );
}
