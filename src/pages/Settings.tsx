import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Instagram, Music2, Phone as PhoneIcon, Trash2, Upload } from "lucide-react";
import PageHeader from "../components/PageHeader";
import LocationAutocomplete from "../components/LocationAutocomplete";
import PhoneInput from "../components/PhoneInput";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";
import { deactivateMyAccount, updateMyProfile } from "../lib/auth";
import {
  getMyArtistProfile,
  removeGalleryPhoto,
  updateMyArtistProfile,
  uploadGalleryPhoto,
} from "../lib/artistDashboard";
import type { ArtistProfileRow } from "../types";

export default function Settings() {
  const { profile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isArtist = profile?.role === "artist";

  // ---- Basic profile (both roles) ----
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [savingBasic, setSavingBasic] = useState(false);
  const [basicMessage, setBasicMessage] = useState("");

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setCity(profile?.city ?? "");
  }, [profile]);

  async function saveBasic() {
    setSavingBasic(true);
    setBasicMessage("");
    try {
      await updateMyProfile({ fullName, phone, city });
      await refreshProfile();
      setBasicMessage("Saved.");
    } catch {
      setBasicMessage("Couldn't save. Try again.");
    } finally {
      setSavingBasic(false);
    }
  }

  // ---- Artist-only profile (bio, socials, gallery) ----
  const [artistProfile, setArtistProfile] = useState<ArtistProfileRow | null>(null);
  const [loadingArtist, setLoadingArtist] = useState(isArtist);
  const [artistDraft, setArtistDraft] = useState({
    business_name: "", location: "", bio: "",
    instagram_handle: "", tiktok_handle: "", whatsapp_number: "",
  });
  const [savingArtist, setSavingArtist] = useState(false);
  const [artistMessage, setArtistMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryError, setGalleryError] = useState("");

  useEffect(() => {
    if (!isArtist) return;
    getMyArtistProfile()
      .then((ap) => {
        setArtistProfile(ap);
        if (ap) {
          setArtistDraft({
            business_name: ap.business_name ?? "",
            location: ap.location ?? "",
            bio: ap.bio ?? "",
            instagram_handle: ap.instagram_handle ?? "",
            tiktok_handle: ap.tiktok_handle ?? "",
            whatsapp_number: ap.whatsapp_number ?? "",
          });
        }
      })
      .finally(() => setLoadingArtist(false));
  }, [isArtist]);

  async function saveArtist() {
    setSavingArtist(true);
    setArtistMessage("");
    try {
      await updateMyArtistProfile(artistDraft);
      setArtistMessage("Saved.");
    } catch {
      setArtistMessage("Couldn't save. Try again.");
    } finally {
      setSavingArtist(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setGalleryError("");
    try {
      const url = await uploadGalleryPhoto(file);
      setArtistProfile((prev) => (prev ? { ...prev, gallery: [...prev.gallery, url] } : prev));
    } catch {
      setGalleryError("Couldn't upload that photo. Try a smaller image or a different format.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemovePhoto(url: string) {
    setGalleryError("");
    try {
      await removeGalleryPhoto(url);
      setArtistProfile((prev) => (prev ? { ...prev, gallery: prev.gallery.filter((g) => g !== url) } : prev));
    } catch {
      setGalleryError("Couldn't remove that photo. Try again.");
    }
  }

  // ---- Deactivate account ----
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  async function handleDeactivate() {
    setDeactivating(true);
    setDeactivateError("");
    try {
      await deactivateMyAccount();
      navigate("/", { replace: true });
    } catch {
      setDeactivateError("Couldn't deactivate your account. Try again, or contact support.");
      setDeactivating(false);
    }
  }

  return (
    <main>
      <PageHeader eyebrow="ACCOUNT" title="Settings" text="Manage your NailBook account preferences." />

      <section className="contentSection settingsGrid">
        <div className="settingsCard">
          <h2>Profile</h2>
          <label className="formField">
            <span>Full name</span>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <PhoneInput label="Phone number" value={phone} onChange={setPhone} />
          <LocationAutocomplete label="City" value={city} onChange={setCity} placeholder="e.g. Sandton, Johannesburg" />
          <button className="primaryButton" type="button" onClick={saveBasic} disabled={savingBasic}>
            {savingBasic ? "Saving…" : "Save Profile"}
          </button>
          {basicMessage && <p className="formMessage">{basicMessage}</p>}
        </div>

        {isArtist && (
          <>
            <div className="settingsCard">
              <h2>Artist Profile</h2>
              {loadingArtist ? (
                <p className="mutedLine">Loading…</p>
              ) : (
                <>
                  <label className="formField">
                    <span>Business name</span>
                    <input
                      type="text"
                      value={artistDraft.business_name}
                      onChange={(e) => setArtistDraft((d) => ({ ...d, business_name: e.target.value }))}
                    />
                  </label>
                  <LocationAutocomplete
                    label="Location"
                    value={artistDraft.location}
                    onChange={(v) => setArtistDraft((d) => ({ ...d, location: v }))}
                  />
                  <label className="formField">
                    <span>Bio</span>
                    <textarea
                      rows={3}
                      value={artistDraft.bio}
                      onChange={(e) => setArtistDraft((d) => ({ ...d, bio: e.target.value }))}
                    />
                  </label>
                  <button className="primaryButton" type="button" onClick={saveArtist} disabled={savingArtist}>
                    {savingArtist ? "Saving…" : "Save Artist Profile"}
                  </button>
                  {artistMessage && <p className="formMessage">{artistMessage}</p>}
                </>
              )}
            </div>

            <div className="settingsCard">
              <h2>Social Links</h2>
              <label className="formField">
                <span><Instagram size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />Instagram handle</span>
                <input
                  type="text"
                  placeholder="yourhandle (without @)"
                  value={artistDraft.instagram_handle}
                  onChange={(e) => setArtistDraft((d) => ({ ...d, instagram_handle: e.target.value }))}
                />
              </label>
              <label className="formField">
                <span><Music2 size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />TikTok handle</span>
                <input
                  type="text"
                  placeholder="yourhandle (without @)"
                  value={artistDraft.tiktok_handle}
                  onChange={(e) => setArtistDraft((d) => ({ ...d, tiktok_handle: e.target.value }))}
                />
              </label>
              <label className="formField">
                <span><PhoneIcon size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />WhatsApp number</span>
                <input
                  type="text"
                  placeholder="+27 82 123 4567"
                  value={artistDraft.whatsapp_number}
                  onChange={(e) => setArtistDraft((d) => ({ ...d, whatsapp_number: e.target.value }))}
                />
              </label>
              <button className="primaryButton" type="button" onClick={saveArtist} disabled={savingArtist}>
                {savingArtist ? "Saving…" : "Save Social Links"}
              </button>
              {artistMessage && <p className="formMessage">{artistMessage}</p>}
            </div>

            <div className="settingsCard">
              <h2>Photos of Your Work</h2>
              <p className="mutedLine">These show up in your portfolio on your public profile.</p>

              {galleryError && <p className="formMessage error">{galleryError}</p>}

              <div className="galleryGrid">
                {artistProfile?.gallery.map((url) => (
                  <div key={url} className="galleryThumb">
                    <img src={url} alt="Portfolio work" />
                    <button type="button" className="galleryRemove" onClick={() => handleRemovePhoto(url)} aria-label="Remove photo">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="galleryAddTile"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={20} />
                  <span>{uploading ? "Uploading…" : "Add Photo"}</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileSelected}
              />
            </div>
          </>
        )}

        <div className="settingsCard">
          <h2>Appearance</h2>
          <p>Switch between light and dark mode across the app.</p>
          <button type="button" className="outlineButton" onClick={toggleTheme}>
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>

        <div className="settingsCard dangerCard">
          <h2>Deactivate Account</h2>
          <p className="mutedLine">
            {isArtist
              ? "Your profile will be hidden from Find Artists and clients won't be able to book you. Your history is kept — you can contact support to reactivate."
              : "Your account will be deactivated and you'll be signed out. Your history is kept — you can contact support to reactivate."}
          </p>

          {deactivateError && <p className="formMessage error">{deactivateError}</p>}

          {!confirmingDeactivate ? (
            <button type="button" className="outlineButton dangerButton" onClick={() => setConfirmingDeactivate(true)}>
              Deactivate Account
            </button>
          ) : (
            <div className="dangerConfirmRow">
              <span>Are you sure? This can't be undone from within the app.</span>
              <div>
                <button type="button" className="primaryButton dangerButton" onClick={handleDeactivate} disabled={deactivating}>
                  {deactivating ? "Deactivating…" : "Yes, Deactivate"}
                </button>
                <button type="button" className="outlineButton" onClick={() => setConfirmingDeactivate(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
