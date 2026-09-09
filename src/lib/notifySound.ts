// A short, pleasant two-tone chime for "you've got a new booking request."
// Synthesized with the Web Audio API rather than an MP3 file — nothing to
// host, nothing that can go missing on a copy-paste, and it's instant.
//
// The AudioContext is created lazily on first use (not at module load).
// Browsers restrict audio from starting with no prior user interaction on
// the page at all — by the time a booking notification fires, the artist
// has already logged in and clicked around, so this plays without issue.

let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function tone(ctx: AudioContext, frequency: number, startTime: number, duration: number, gainPeak: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playBookingAlert() {
  try {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    // A quick rising two-note chime — friendly, not jarring.
    tone(ctx, 740, now, 0.16, 0.18);
    tone(ctx, 988, now + 0.11, 0.22, 0.18);
  } catch {
    // Audio isn't essential — if the browser blocks it for any reason,
    // the visual badge/pulse still does the job of getting attention.
  }
}
