import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid) => {
    try {
      const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return data;
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
    return null;
  }, []);

  useEffect(() => {
    let active = true;

    // Fast initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!active) return;
      setSession(initialSession);

      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);

      if (nextSession?.user) {
        fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      return await fetchProfile(session.user.id);
    }
    return null;
  }, [session?.user?.id, fetchProfile]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      profile,
      loading,
      setProfile,
      refreshProfile,
    }),
    [session, profile, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
