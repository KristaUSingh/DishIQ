import { createContext, useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);

  // Load auth from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch {
        localStorage.removeItem("auth");
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
  
      if (user) {
        setAuth({
          isLoggedIn: true,
          user_id: user.id,
          email: user.email,
          role: user.user_metadata?.role || null,
        });
      }
    });
  
    // Listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        setAuth({
          isLoggedIn: true,
          user_id: user.id,
          email: user.email,
          role: user.user_metadata?.role || null,
        });
      } else {
        setAuth(null);
      }
    });
  
    return () => listener.subscription.unsubscribe();
  }, []);  

  // Save to localStorage
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
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
