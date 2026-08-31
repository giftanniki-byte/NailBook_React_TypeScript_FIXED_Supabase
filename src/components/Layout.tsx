import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { signOut } from "../lib/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setOpen(false);

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      navigate("/");
    }
  }

  return (
    <div className="siteShell">
      <header className="navbar">
        <Link className="brand" to="/" onClick={closeMenu}>NailBook</Link>

        <button
          className="menuButton"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open navigation menu"
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={open ? "navLinks open" : "navLinks"}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/artists" onClick={closeMenu}>Find Artist</NavLink>
          <NavLink to="/login" onClick={closeMenu}>Sign In</NavLink>
          <NavLink to="/signup" onClick={closeMenu}>Create Account</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
          <button className="navLogout" type="button" onClick={handleLogout}>Sign Out</button>
        </nav>
      </header>

      {children}

      <footer className="footer">
        <div>
          <strong>NailBook</strong>
          <span>Find talented nail artists and book with confidence.</span>
        </div>
        <div className="footerLinks">
          <Link to="/help">Help & Support</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
