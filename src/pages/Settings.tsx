import PageHeader from "../components/PageHeader";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";

export default function Settings() {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <main>
      <PageHeader eyebrow="ACCOUNT" title="Settings" text="Manage your NailBook account preferences." />

      <section className="contentSection">
        <div className="settingsCard">
          <h2>Profile</h2>
          <p><strong>Name:</strong> {profile?.full_name ?? "—"}</p>
          <p><strong>Account type:</strong> {profile?.role ?? "—"}</p>
          <p><strong>City:</strong> {profile?.city ?? "—"}</p>
        </div>

        <div className="settingsCard">
          <h2>Appearance</h2>
          <p>Switch between light and dark mode across the app.</p>
          <button type="button" className="outlineButton" onClick={toggleTheme}>
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>
      </section>
    </main>
  );
}
