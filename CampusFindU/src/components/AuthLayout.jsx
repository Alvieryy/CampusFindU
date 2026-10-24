import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function AuthLayout({ children, wide = false }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link to="/" className="auth-brand">
          <img src="/logo.png" alt="" />
          <span>
            CampusFindU
            <small>MMSU Lost and Found</small>
          </span>
        </Link>

        <Link to="/login" className="auth-header-link">
          Sign in
        </Link>
      </header>

      <main className="auth-main">
        <section className={`auth-card ${wide ? "auth-card-wide" : ""}`}>
          {children}
        </section>
      </main>

      <footer className="auth-footer">
        © {new Date().getFullYear()} CampusFindU · MMSU Batac Campus
      </footer>
    </div>
  );
}
