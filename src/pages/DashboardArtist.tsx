import { CalendarCheck, ClipboardList, Users } from "lucide-react";

export default function DashboardArtist() {
  return <main className="dashboard"><div className="dashboardTop"><div><span className="eyebrow">ARTIST DASHBOARD</span><h1>Manage your NailBook profile.</h1><p>Keep your services and appointment requests organised.</p></div></div><div className="dashboardGrid"><div className="dashboardCard"><CalendarCheck/><h2>Appointments</h2><strong>0</strong><p>Booking requests will appear here.</p></div><div className="dashboardCard"><ClipboardList/><h2>Your services</h2><p>Add the services you offer to help clients find you.</p><button className="outlineButton" type="button">Manage Services</button></div><div className="dashboardCard"><Users/><h2>Clients</h2><strong>0</strong><p>Keep an eye on your client activity.</p></div></div></main>;
}
