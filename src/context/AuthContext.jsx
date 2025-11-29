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
