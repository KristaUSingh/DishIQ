import { createContext, useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);

  // Load from localStorage immediately
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        setAuth(JSON.parse(stored));
      } catch {
        localStorage.removeItem("auth");
      }
    }
  }, []);

  // Full reload from Supabase
  const loadUserProfile = async (session) => {
    const user = session?.user;
    if (!user) {
      setAuth(null);
      return;
    }

    // Always fetch from DB
    const { data: profile } = await supabase
      .from("users")
      .select("role, warnings, vip_flag, restaurant_name")
      .eq("user_id", user.id)
      .single();

    setAuth({
      isLoggedIn: true,
      user_id: user.id,
      email: user.email,
      role: profile?.role || null,
      warnings: profile?.warnings || 0,
      vip_flag: profile?.vip_flag || false,
      restaurant_name: profile?.restaurant_name || null,
    });
  };

  useEffect(() => {
    // On refresh
    supabase.auth.getSession().then(({ data }) => {
      loadUserProfile(data.session);
    });

    // On login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserProfile(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (auth) localStorage.setItem("auth", JSON.stringify(auth));
    else localStorage.removeItem("auth");
  }, [auth]);

  // Logout helper
  const logout = async () => {
    await supabase.auth.signOut();
    setAuth(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}