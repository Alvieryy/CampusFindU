import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    if (hashParams.get("error") || searchParams.get("error")) {
      window.location.href = "/login";
      return;
    }

    const processSession = async (session) => {
      if (!session?.user) {
        window.location.href = "/login";
        return;
      }

      const user = session.user;
      const { data: existingUser } = await supabase
        .from("Users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingUser) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Campus User";
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        await supabase.from("Users").upsert([
          {
            id: user.id,
            fullName,
            email: user.email,
            userType: "student",
            avatarUrl,
            is_online: true,
          },
        ]);
      } else {
        await supabase
          .from("Users")
          .update({ is_online: true })
          .eq("id", user.id);
      }

      if (isMounted) {
        window.location.href = "/dashboard";
      }
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        const { data: listener } = supabase.auth.onAuthStateChange(
          (_event, authSession) => {
            if (authSession) {
              processSession(authSession);
            }
          },
        );
        return () => listener.subscription.unsubscribe();
      } else {
        processSession(session);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-sm w-full">
        <div className="w-10 h-10 border-4 border-mmsu-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-bold text-gray-800">Signing you in</h3>
        <p className="text-gray-500 text-sm mt-1">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
}
