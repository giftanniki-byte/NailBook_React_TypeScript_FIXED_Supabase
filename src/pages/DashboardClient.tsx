import { CalendarCheck, Clock3, Heart, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardClient() {
  return <main className="dashboard"><div className="dashboardTop"><div><span className="eyebrow">CLIENT DASHBOARD</span><h1>Welcome back.</h1><p>Keep track of your appointments and discover your next artist.</p></div><Link className="primaryButton" to="/artists"><Search size={17}/> Find an Artist</Link></div><div className="dashboardGrid"><div className="dashboardCard"><CalendarCheck/><h2>Upcoming appointments</h2><p>No upcoming appointments yet.</p><Link to="/artists">Book an appointment</Link></div><div className="dashboardCard"><Heart/><h2>Saved artists</h2><p>Your saved artists will appear here.</p><Link to="/artists">Browse artists</Link></div><div className="dashboardCard"><Clock3/><h2>Recent activity</h2><p>Your recent booking activity will appear here.</p></div></div></main>;
}
