import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Home() {
  return (
    <AuthLayout wide>
      <div className="auth-home">
        <p className="auth-eyebrow">MMSU Batac Campus</p>

        <h1 className="auth-title">
          Lost something?
          <br />
          Start here.
        </h1>

        <p className="auth-description">
          Report lost belongings, share items you have found, and reconnect them
          with their owners through CampusFindU.
        </p>

        <div className="auth-home-actions">
          <Link to="/login" className="auth-button">
            Get started
          </Link>

          <Link to="/guest/login" className="auth-button auth-button-secondary">
            Visitor / Guest Login
          </Link>
        </div>

        <p className="auth-bottom">
          New to CampusFindU?{" "}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
