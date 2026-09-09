import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { listMessages, sendMessage, subscribeToMessages } from "../lib/chat";
import { useAuth } from "../lib/AuthContext";
import type { BookingMessage } from "../types";

export default function BookingChat({
  bookingId,
  otherPartyName,
  onClose,
}: {
  bookingId: string;
  otherPartyName: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listMessages(bookingId)
      .then((rows) => {
        if (active) setMessages(rows);
      })
      .catch(() => {
        if (active) setError("Couldn't load this conversation.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = subscribeToMessages(bookingId, (message) => {
      setMessages((prev) => (prev.some((m) => m.message_id === message.message_id) ? prev : [...prev, message]));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [bookingId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    try {
      await sendMessage(bookingId, text);
      setDraft("");
    } catch {
      setError("Couldn't send that message. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chatOverlay" onClick={onClose}>
      <div className="chatPanel" onClick={(e) => e.stopPropagation()}>
        <div className="chatHeader">
          <strong>{otherPartyName}</strong>
          <button type="button" className="chatCloseButton" onClick={onClose} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        <div className="chatMessages" ref={scrollRef}>
          {loading ? (
            <p className="mutedLine chatEmptyState">Loading conversation…</p>
          ) : messages.length === 0 ? (
            <p className="mutedLine chatEmptyState">No messages yet — say hello about this booking.</p>
          ) : (
            messages.map((m) => (
              <div key={m.message_id} className={m.sender_id === user?.id ? "chatBubble mine" : "chatBubble"}>
                <p>{m.body}</p>
                <span className="chatBubbleTime">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))
          )}
        </div>

        {error && <p className="formMessage error chatError">{error}</p>}

        <div className="chatInputRow">
          <input
            type="text"
            value={draft}
            placeholder="Type a message…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button type="button" className="primaryButton smallButton chatSendButton" onClick={handleSend} disabled={sending || !draft.trim()}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
