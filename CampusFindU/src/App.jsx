import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Register from "./pages/Register";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading</div>;

  if (!session) return <Navigate to="/login" />;

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div style={{ padding: "20px" }}>
                <h2>Welcome to the Protected Dashboard! 🔐</h2>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/login";
                  }}
                  style={{
                    padding: "10px",
                    marginTop: "10px",
                    cursor: "pointer",
                  }}
                >
                  Log Out
                </button>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
